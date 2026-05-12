import type { Lesson } from '../engine/types'
import {
  sourceDefined,
  modelRan,
  lineageHasSourceEdge,
} from '../engine/validators'

const RAW_CUSTOMERS = `id,name,country
1,Alice,US
2,Bob,CA
3,Carol,BR`

const lesson05: Lesson = {
  id: 5,
  title: 'Sources',
  concept: `Raw tables in your warehouse aren't dbt models — you didn't build them. To reference them, you declare them as **sources** in a \`.yml\` file, then read them in models with \`{{ source('schema', 'table') }}\` instead of \`ref()\`.

Sources give you three things: a name to reference, lineage that starts from the real upstream system, and a place to attach freshness checks and tests later.`,
  initialFiles: {
    'models/sources.yml': `version: 2

sources:
  - name: raw
    tables:
      - name: customers
`,
    'models/stg_customers.sql': `select
    id,
    name,
    country
from {{ source('raw', 'customers') }}`,
  },
  seeds: { 'raw.customers': RAW_CUSTOMERS },
  tasks: [
    {
      id: 'source',
      prompt: 'Confirm `sources.yml` declares a source `raw` with table `customers`.',
      hint: "It's already there — just open `models/sources.yml` and read it.",
      validate: (s) => sourceDefined(s, 'raw', 'customers'),
    },
    {
      id: 'edge',
      prompt: '`stg_customers` already uses `source()`. Confirm the lineage edge `raw.customers → stg_customers` appears in the DAG.',
      validate: (s) => lineageHasSourceEdge(s, 'raw', 'customers', 'stg_customers'),
    },
    {
      id: 'run',
      prompt: 'Run `dbt run` to materialize `stg_customers` on top of the source.',
      validate: (s) => modelRan(s, 'stg_customers'),
    },
  ],
  quiz: {
    question: 'When should you use `source()` vs `ref()`?',
    options: [
      'They are interchangeable',
      "`source()` for raw warehouse tables you didn't build; `ref()` for dbt models",
      '`source()` only in production',
      '`ref()` only for table materializations',
    ],
    correctIndex: 1,
    explanation: '`source()` points to inputs you don\'t own (raw landings, external systems). `ref()` points to other dbt models.',
  },
  goal: {
    dagShape: {
      nodes: [
        { id: 'source.raw.customers', label: 'raw.customers', layer: 'source' },
        { id: 'stg_customers', label: 'stg_customers', layer: 'staging' },
      ],
      edges: [{ source: 'source.raw.customers', target: 'stg_customers' }],
    },
  },
  furtherReading: [
    { label: 'Sources', url: 'https://docs.getdbt.com/docs/build/sources' },
  ],
}

export default lesson05
