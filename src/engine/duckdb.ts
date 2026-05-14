import * as duckdb from '@duckdb/duckdb-wasm'
import duckdb_wasm_mvp from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url'
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url'
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url'
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url'

const BUNDLES: duckdb.DuckDBBundles = {
  mvp: { mainModule: duckdb_wasm_mvp, mainWorker: mvp_worker },
  eh: { mainModule: duckdb_wasm_eh, mainWorker: eh_worker },
}

let dbPromise: Promise<duckdb.AsyncDuckDB> | null = null

async function createDb(): Promise<duckdb.AsyncDuckDB> {
  const bundle = await duckdb.selectBundle(BUNDLES)
  const worker = new Worker(bundle.mainWorker!)
  const logger = new duckdb.VoidLogger()
  const db = new duckdb.AsyncDuckDB(logger, worker)
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker)
  await db.open({ query: { castBigIntToDouble: true } })
  return db
}

export function getDb(): Promise<duckdb.AsyncDuckDB> {
  if (!dbPromise) dbPromise = createDb()
  return dbPromise
}

export interface QueryResult {
  columns: string[]
  rows: unknown[][]
  rowCount: number
}

export async function runQuery(sql: string): Promise<QueryResult> {
  const db = await getDb()
  const conn = await db.connect()
  try {
    const table = await conn.query(sql)
    const columns = table.schema.fields.map((f) => f.name)
    const rows: unknown[][] = []
    for (let i = 0; i < table.numRows; i++) {
      const row = table.get(i)
      if (!row) continue
      rows.push(columns.map((c) => normalize(row[c])))
    }
    return { columns, rows, rowCount: table.numRows }
  } finally {
    await conn.close()
  }
}

export async function exec(sql: string): Promise<void> {
  const db = await getDb()
  const conn = await db.connect()
  try {
    await conn.query(sql)
  } finally {
    await conn.close()
  }
}

export async function registerCsv(name: string, csv: string): Promise<void> {
  const db = await getDb()
  const dotIdx = name.indexOf('.')
  const schema = dotIdx !== -1 ? name.slice(0, dotIdx) : 'main'
  const table = dotIdx !== -1 ? name.slice(dotIdx + 1) : name
  const fileKey = `${schema}_${table}`
  try { await db.dropFile(`${fileKey}.csv`) } catch { /* not registered yet */ }
  await db.registerFileText(`${fileKey}.csv`, csv)
  const conn = await db.connect()
  try {
    if (schema !== 'main') {
      await conn.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`)
    }
    await conn.query(
      `CREATE OR REPLACE TABLE "${schema}"."${table}" AS SELECT * FROM read_csv_auto('${fileKey}.csv', header=true)`,
    )
  } finally {
    await conn.close()
  }
}

/**
 * Drops every user-created table and view so the next level starts clean.
 *
 * Arrow row objects don't expose named fields as plain properties — use
 * `table.getChild(col)` to get the column vector and `.get(i)` per row.
 */
export async function resetDb(): Promise<void> {
  const db = await getDb()
  // Flush all registered CSV / Parquet files too.
  try { await db.dropFiles() } catch { /* nothing registered */ }
  const conn = await db.connect()
  try {
    const schemaRes = await conn.query(
      `SELECT schema_name FROM information_schema.schemata
         WHERE schema_name NOT IN ('information_schema', 'pg_catalog')
         ORDER BY schema_name`,
    )
    const schemaCol = schemaRes.getChild('schema_name')
    const schemas: string[] = []
    for (let i = 0; i < schemaRes.numRows; i++) {
      const s = schemaCol?.get(i) as string | null
      if (s) schemas.push(s)
    }
    // Drop views first (they may reference tables), then tables, then non-main schemas.
    for (const type of ['VIEW', 'BASE TABLE']) {
      for (const schema of schemas) {
        const res = await conn.query(
          `SELECT table_name FROM information_schema.tables
             WHERE table_schema = '${schema}' AND table_type = '${type}'`,
        )
        const col = res.getChild('table_name')
        for (let i = 0; i < res.numRows; i++) {
          const name = col?.get(i) as string | null
          if (!name) continue
          const drop = type === 'VIEW' ? 'DROP VIEW' : 'DROP TABLE'
          await conn.query(`${drop} IF EXISTS "${schema}"."${name}" CASCADE`)
        }
      }
    }
    for (const schema of schemas) {
      if (schema !== 'main') {
        await conn.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`)
      }
    }
  } finally {
    await conn.close()
  }
}

function normalize(v: unknown): unknown {
  if (typeof v === 'bigint') return Number(v)
  if (v instanceof Date) return v.toISOString()
  if (v && typeof v === 'object' && 'toString' in v && !Array.isArray(v)) {
    const s = (v as { toString: () => string }).toString()
    if (s !== '[object Object]') return s
  }
  return v
}
