import type { Lesson } from '../engine/types'
import {
  testDefinitionsInclude,
  allTestsPass,
} from '../engine/validators'

const RAW_ORDERS = `id,customer_id,status,amount
1,1,paid,10.00
2,2,paid,20.00
3,3,refunded,5.00
4,1,pending,7.50`

const RAW_CUSTOMERS = `id,name
1,Alice
2,Bob
3,Carol`

const lesson08: Lesson = {
  id: 8,
  title: 'Relationships & accepted_values',
  concept: `Beyond not_null/unique, two more tests show up constantly:

- **accepted_values** — column must be one of a fixed list. Great for status fields.
- **relationships** — every value in this column must exist in another model's column. This is a foreign-key check, without you ever writing one.

Both are declared in YAML and run with \`dbt test\`.`,
  initialFiles: {
    'models/stg_customers.sql': `select id, name from raw_customers`,
    'models/stg_orders.sql': `select
    id as order_id,
    customer_id,
    status,
    amount
from raw_orders`,
    'models/schema.yml': `version: 2

models:
  - name: stg_orders
    columns:
      - name: status
        tests:
          # add an accepted_values test here
      - name: customer_id
        tests:
          # add a relationships test here
  - name: stg_customers
    columns:
      - name: id
        tests:
          - not_null
          - unique
`,
  },
  seeds: { raw_customers: RAW_CUSTOMERS, raw_orders: RAW_ORDERS },
  preRanModels: ['stg_customers', 'stg_orders'],
  tasks: [
    {
      id: 'accepted',
      prompt: "Add an `accepted_values` test to `stg_orders.status` allowing `['paid', 'refunded', 'pending']`.",
      hint: "Under the column's tests, add:\n```\n- accepted_values:\n    values: ['paid', 'refunded', 'pending']\n```",
      validate: (s) => testDefinitionsInclude(s, 'stg_orders', ['accepted_values']),
    },
    {
      id: 'rel',
      prompt: "Add a `relationships` test to `stg_orders.customer_id` pointing at `stg_customers.id`.",
      hint: "```\n- relationships:\n    to: ref('stg_customers')\n    field: id\n```",
      validate: (s) => testDefinitionsInclude(s, 'stg_orders', ['relationships']),
    },
    {
      id: 'run',
      prompt: 'Run `dbt test` — both checks should pass.',
      validate: (s) => allTestsPass(s, 'stg_orders'),
    },
  ],
  quiz: {
    question: 'A `relationships` test on column A pointing at model X column B fails when…',
    options: [
      'Column A contains a NULL',
      'Column A contains a value not present in X.B',
      'Column B contains a duplicate',
      "Model X hasn't been built",
    ],
    correctIndex: 1,
    explanation: 'A relationships test fails on orphan rows — values in column A that have no matching row in the referenced model.',
  },
  furtherReading: [
    { label: 'Generic data tests reference', url: 'https://docs.getdbt.com/reference/resource-properties/data-tests' },
  ],
}

export default lesson08
