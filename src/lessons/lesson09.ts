import type { Lesson } from '../engine/types'

const lesson09: Lesson = {
  id: 9,
  title: 'Documentation',
  concept: `Every model and column in your YAML can carry a \`description\`. Those descriptions become the docs site (\`dbt docs generate\`) and show up next to the column in your warehouse browser.

Good documentation isn't about completeness — it's about the *non-obvious* bits. Compare:

- ❌ \`customer_id\` — *"The customer id"* (the name already says this)
- ✅ \`customer_id\` — *"FK to stg_customers.id; null for guest checkouts"* (semantics + nullability)

If a name is self-explanatory, you don't need to describe it. Spend your words on what the name *can't* tell you: what a status value means, why a column is nullable, which team owns the model.`,
  initialFiles: {
    'models/stg_orders.sql': `select
    id as order_id,
    customer_id,
    status,
    amount
from raw_orders`,
    'models/schema.yml': `version: 2

models:
  - name: stg_orders
    description: ""
    columns:
      - name: order_id
        description: "Primary key — unique per order row."
      - name: status
        description: ""
`,
  },
  seeds: { raw_orders: `id,customer_id,status,amount\n1,1,paid,10` },
  tasks: [
    {
      id: 'model-desc',
      prompt: 'Write a non-empty description on the `stg_orders` model in `schema.yml`.',
      hint: 'Replace the empty `""` after `description:` on the model with a short sentence.',
      validate: (s) => {
        const yml = s.files['models/schema.yml'] ?? ''
        const m = yml.match(/- name: stg_orders[\s\S]*?description:\s*"([^"]+)"/)
        return Boolean(m && m[1].trim().length >= 5)
      },
    },
    {
      id: 'col-desc',
      prompt: 'Write a description on the `status` column explaining the allowed values.',
      hint: "Something like: 'paid, refunded, or pending'.",
      validate: (s) => {
        const yml = s.files['models/schema.yml'] ?? ''
        const m = yml.match(/- name: status[\s\S]*?description:\s*"([^"]+)"/)
        return Boolean(m && m[1].trim().length >= 5)
      },
    },
  ],
  quiz: {
    question: 'What\'s the best column description?',
    options: [
      '"The customer id"',
      '"customer_id"',
      '"FK to stg_customers.id; nullable for guest checkouts"',
      'Leave it blank',
    ],
    correctIndex: 2,
    explanation: 'Descriptions earn their keep by capturing what the name alone cannot — semantics, nullability, ownership.',
  },
  furtherReading: [
    { label: 'Documentation', url: 'https://docs.getdbt.com/docs/build/documentation' },
  ],
}

export default lesson09
