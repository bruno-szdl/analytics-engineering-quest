import type { Lesson } from '../engine/types'
import { modelRan, modelShown } from '../engine/validators'

const RAW_CUSTOMERS = `id,name,email,country
1,Alice,alice@example.com,US
2,Bob,bob@example.com,CA
3,Carol,carol@example.com,BR
4,Dave,dave@example.com,IN
5,Eve,eve@example.com,DE`

const lesson01: Lesson = {
  id: 1,
  title: 'Your first dbt model',
  panels: ['warehouse'],
  concept: `A **model** in dbt is just a \`SELECT\` statement saved as a \`.sql\` file inside the \`models/\` folder. When you run dbt, it turns that query into a **view** in your database — a saved query the database knows by name.

You already have one model — \`stg_customers.sql\` — that reads from a raw table called \`raw_customers\`.

Two commands you'll use constantly:

- \`dbt run\` — builds every model. After it finishes, \`stg_customers\` will appear in the **Database** panel as a view.
- \`dbt show --select <model>\` — previews the rows of a model.

Try them below.`,
  initialFiles: {
    'models/stg_customers.sql': `select
    id,
    name,
    email,
    country
from raw_customers`,
  },
  seeds: { raw_customers: RAW_CUSTOMERS },
  tasks: [
    {
      id: 'run',
      prompt: 'Run `dbt run` in the terminal to build every model in the project.',
      hint: 'Type `dbt run` at the prompt and press Enter.',
      validate: (s) => modelRan(s, 'stg_customers'),
    },
    {
      id: 'show',
      prompt: 'Preview the rows by running `dbt show --select stg_customers`.',
      hint: '`dbt show` reads the materialized result back from the warehouse.',
      validate: (s) => modelShown(s, 'stg_customers'),
    },
  ],
  quiz: {
    question: 'Which command builds your models against the warehouse?',
    options: ['dbt compile', 'dbt run', 'dbt execute', 'dbt deploy'],
    correctIndex: 1,
    explanation: '`dbt run` compiles every model into SQL and materializes it as a view or table.',
  },
  goal: {
    dagShape: {
      nodes: [{ id: 'stg_customers', label: 'stg_customers', layer: 'staging' }],
      edges: [],
    },
  },
  furtherReading: [
    { label: 'dbt run command reference', url: 'https://docs.getdbt.com/reference/commands/run' },
    { label: 'About dbt models', url: 'https://docs.getdbt.com/docs/build/models' },
  ],
}

export default lesson01
