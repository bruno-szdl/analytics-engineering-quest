import type { Lesson } from '../engine/types'
import { modelRan, hasModel, modelRefs } from '../engine/validators'

const RAW_ORDERS = `id,customer_id,amount,status
1,1,10.00,paid
2,2,20.00,paid
3,1,5.00,refunded`

const RAW_CUSTOMERS = `id,name
1,Alice
2,Bob`

const lesson10: Lesson = {
  id: 10,
  title: 'Project structure: staging, intermediate, marts',
  concept: `The dbt community has a strong convention for organizing models into three layers:

- **staging/** — one model per source table, light cleaning (renames, casts). Prefixed \`stg_\`.
- **intermediate/** — joins and reusable building blocks. Prefixed \`int_\`.
- **marts/** — business-facing tables (often dimensional). Prefixed \`dim_\` or \`fct_\`.

Folders aren't enforced by dbt, but following the convention makes any dbt project instantly readable.`,
  initialFiles: {
    'models/staging/stg_customers.sql': `select id, name from raw_customers`,
    'models/staging/stg_orders.sql': `select
    id as order_id,
    customer_id,
    amount,
    status
from raw_orders`,
    'models/intermediate/int_orders_with_customers.sql': `-- Goal: pull each order together with the customer's name.
-- stg_orders is already aliased as o below — add a JOIN on stg_customers (alias c)
-- so we can also select c.name.

select
    o.order_id,
    o.customer_id,
    o.amount,
    o.status
from {{ ref('stg_orders') }} o
-- write your JOIN here
`,
  },
  seeds: { raw_customers: RAW_CUSTOMERS, raw_orders: RAW_ORDERS },
  preRanModels: ['stg_customers', 'stg_orders'],
  tasks: [
    {
      id: 'intermediate',
      prompt: "Open `models/intermediate/int_orders_with_customers.sql` and complete the JOIN on `stg_customers` (alias `c`) so the query reads from both models.",
      hint: "Replace the `-- write your JOIN here` line with: `join {{ ref('stg_customers') }} c on o.customer_id = c.id` — and add `c.name` to the SELECT list.",
      validate: (s) =>
        hasModel(s, 'int_orders_with_customers') &&
        modelRefs(s, 'int_orders_with_customers', 'stg_orders') &&
        modelRefs(s, 'int_orders_with_customers', 'stg_customers'),
    },
    {
      id: 'mart',
      prompt: "Create `models/marts/fct_orders.sql` that selects from `int_orders_with_customers`.",
      hint: "Put it in models/marts/ and name it with the fct_ prefix.",
      validate: (s) =>
        hasModel(s, 'fct_orders') &&
        modelRefs(s, 'fct_orders', 'int_orders_with_customers'),
    },
    {
      id: 'run',
      prompt: 'Run `dbt run` — all four models should build.',
      validate: (s) =>
        modelRan(s, 'stg_customers') &&
        modelRan(s, 'stg_orders') &&
        modelRan(s, 'int_orders_with_customers') &&
        modelRan(s, 'fct_orders'),
    },
  ],
  quiz: {
    question: 'A new teammate sees a model called `int_active_users`. What should they expect?',
    options: [
      'A raw source table',
      'A staging model with light renames',
      'A reusable joined/aggregated model, not yet business-facing',
      'A dashboard',
    ],
    correctIndex: 2,
    explanation: 'The `int_` prefix signals intermediate logic — joins, aggregations, building blocks consumed by marts.',
  },
  furtherReading: [
    { label: 'How we structure dbt projects', url: 'https://docs.getdbt.com/best-practices/how-we-structure/1-guide-overview' },
  ],
}

export default lesson10
