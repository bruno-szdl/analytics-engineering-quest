import type { Lesson } from '../engine/types'
import { buildSucceeded, modelRan, allTestsPass } from '../engine/validators'

const RAW_CUSTOMERS = `id,name,country
1,Alice,US
2,Bob,CA
3,Carol,BR`

const RAW_ORDERS = `id,customer_id,amount,status
1,1,10.00,paid
2,2,20.00,paid
3,1,5.00,refunded
4,3,7.50,paid`

const lesson12: Lesson = {
  id: 12,
  title: 'Putting it all together: dbt build',
  concept: `\`dbt build\` is the command you'll run most in real projects. It walks the DAG once and, for each node:

1. Builds the model (or loads the seed, or runs the snapshot)
2. Immediately runs every test attached to it

If a test fails, downstream models that depend on the bad data are skipped. That's the safety net: no broken upstream data quietly poisons a dashboard.

Let's put a small project together end-to-end.`,
  initialFiles: {
    'models/sources.yml': `version: 2

sources:
  - name: raw
    tables:
      - name: customers
      - name: orders
`,
    'models/staging/stg_customers.sql': `select id, name, country from {{ source('raw', 'customers') }}`,
    'models/staging/stg_orders.sql': `select
    id as order_id,
    customer_id,
    amount,
    status
from {{ source('raw', 'orders') }}`,
    'models/marts/fct_revenue.sql': `{{ config(materialized='table') }}

select
    c.country,
    sum(o.amount) as revenue
from {{ ref('stg_orders') }} o
join {{ ref('stg_customers') }} c on o.customer_id = c.id
where o.status = 'paid'
group by c.country`,
    'models/schema.yml': `version: 2

models:
  - name: stg_customers
    columns:
      - name: id
        tests:
          - not_null
          - unique
  - name: stg_orders
    columns:
      - name: order_id
        tests:
          - not_null
          - unique
      - name: customer_id
        tests:
          - relationships:
              to: ref('stg_customers')
              field: id
      - name: status
        tests:
          - accepted_values:
              values: ['paid', 'refunded', 'pending']
  - name: fct_revenue
    description: "Total paid revenue by customer country."
`,
  },
  seeds: { 'raw.customers': RAW_CUSTOMERS, 'raw.orders': RAW_ORDERS },
  tasks: [
    {
      id: 'build',
      prompt: 'Run `dbt build`. It will materialize every model and run every test in DAG order.',
      hint: 'A single command does the whole thing — `dbt build`.',
      validate: (s) => buildSucceeded(s),
    },
    {
      id: 'fct',
      prompt: 'Verify `fct_revenue` built and passed.',
      validate: (s) => modelRan(s, 'fct_revenue'),
    },
    {
      id: 'tests',
      prompt: 'Verify every model has passing tests.',
      validate: (s) =>
        allTestsPass(s, 'stg_customers') && allTestsPass(s, 'stg_orders'),
    },
  ],
  quiz: {
    question: 'Why prefer `dbt build` over `dbt run` + `dbt test` separately?',
    options: [
      "It's shorter to type",
      'It runs tests in DAG order and skips downstream models when upstream tests fail',
      "It's the only way to use sources",
      'It generates documentation',
    ],
    correctIndex: 1,
    explanation: '`dbt build` interleaves tests with builds so bad data is caught the moment it appears, before downstream models consume it.',
  },
  furtherReading: [
    { label: 'dbt build command', url: 'https://docs.getdbt.com/reference/commands/build' },
  ],
}

export default lesson12
