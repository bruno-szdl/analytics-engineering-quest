import type { Lesson } from '../engine/types'
import {
  hasModel,
  modelRan,
  modelRefs,
  lineageHasEdge,
} from '../engine/validators'

const RAW_ORDERS = `id,customer_id,amount,status,created_at
101,1,42.00,paid,2024-01-10
102,2,18.50,paid,2024-01-12
103,1,99.00,refunded,2024-01-15
104,3,12.75,paid,2024-02-01
105,4,55.00,paid,2024-02-04
106,2,8.00,pending,2024-02-09`

const lesson03: Lesson = {
  id: 3,
  title: 'Multi-step pipelines',
  panels: ['warehouse', 'lineage', 'files'],
  concept: `Real pipelines have intermediate steps. A common pattern is:

\`staging → intermediate → mart\`

Staging cleans the raw input. Intermediate joins or aggregates. Marts are the polished outputs the business consumes. Each step is its own model, connected by \`ref()\`.`,
  initialFiles: {
    'models/stg_orders.sql': `select
    id as order_id,
    customer_id,
    amount,
    status,
    created_at
from raw_orders`,
  },
  seeds: { raw_orders: RAW_ORDERS },
  preRanModels: ['stg_orders'],
  tasks: [
    {
      id: 'int',
      prompt: 'Create `models/int_paid_orders.sql` that selects only rows where status = \'paid\' from `stg_orders`.',
      hint: "Filter with a WHERE clause: `where status = 'paid'`",
      validate: (s) => hasModel(s, 'int_paid_orders') && modelRefs(s, 'int_paid_orders', 'stg_orders'),
    },
    {
      id: 'mart',
      prompt: 'Create `models/fct_revenue_by_customer.sql` that sums `amount` from `int_paid_orders` grouped by `customer_id`.',
      hint: "Try: `select customer_id, sum(amount) as revenue from {{ ref('int_paid_orders') }} group by customer_id`",
      validate: (s) =>
        hasModel(s, 'fct_revenue_by_customer') &&
        modelRefs(s, 'fct_revenue_by_customer', 'int_paid_orders'),
    },
    {
      id: 'edges',
      prompt: 'Verify the DAG shows the full chain: `stg_orders → int_paid_orders → fct_revenue_by_customer`.',
      validate: (s) =>
        lineageHasEdge(s, 'stg_orders', 'int_paid_orders') &&
        lineageHasEdge(s, 'int_paid_orders', 'fct_revenue_by_customer'),
    },
    {
      id: 'run',
      prompt: 'Run `dbt run` and confirm all three models build.',
      validate: (s) =>
        modelRan(s, 'stg_orders') &&
        modelRan(s, 'int_paid_orders') &&
        modelRan(s, 'fct_revenue_by_customer'),
    },
  ],
  quiz: {
    question: 'What happens if you change `stg_orders` and run `dbt run`?',
    options: [
      'Only `stg_orders` is rebuilt',
      'Every model in the project is rebuilt in dependency order',
      'You have to manually rebuild downstream models',
      'Nothing — dbt only rebuilds when files are renamed',
    ],
    correctIndex: 1,
    explanation: '`dbt run` rebuilds all models in topological order, so downstream models always see the latest upstream output.',
  },
  goal: {
    dagShape: {
      nodes: [
        { id: 'stg_orders', label: 'stg_orders', layer: 'staging' },
        { id: 'int_paid_orders', label: 'int_paid_orders', layer: 'intermediate' },
        { id: 'fct_revenue_by_customer', label: 'fct_revenue_by_customer', layer: 'mart' },
      ],
      edges: [
        { source: 'stg_orders', target: 'int_paid_orders' },
        { source: 'int_paid_orders', target: 'fct_revenue_by_customer' },
      ],
    },
  },
  furtherReading: [
    { label: 'How we structure dbt projects', url: 'https://docs.getdbt.com/best-practices/how-we-structure/1-guide-overview' },
  ],
}

export default lesson03
