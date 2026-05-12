import type { Lesson } from '../engine/types'
import {
  testDefinitionsInclude,
  allTestsPass,
} from '../engine/validators'

const RAW_CUSTOMERS = `id,name,email
1,Alice,alice@example.com
2,Bob,bob@example.com
3,Carol,carol@example.com
4,Dave,dave@example.com`

const lesson07: Lesson = {
  id: 7,
  title: 'Generic tests: not_null & unique',
  concept: `dbt has two built-in tests for almost every column you'll write: **not_null** and **unique**. They're declared in YAML alongside your model and run with \`dbt test\`.

Catching a null or duplicate early — before it breaks a downstream join — is the cheapest data-quality win you'll ever get.`,
  initialFiles: {
    'models/stg_customers.sql': `select
    id,
    name,
    email
from raw_customers`,
    'models/schema.yml': `version: 2

models:
  - name: stg_customers
    columns:
      - name: id
        tests:
          # add the two tests below this line (one per line, prefixed with "- ")
`,
  },
  seeds: { raw_customers: RAW_CUSTOMERS },
  preRanModels: ['stg_customers'],
  tasks: [
    {
      id: 'add-tests',
      prompt: 'Add `not_null` and `unique` tests to the `id` column in `schema.yml`.',
      hint: "Under `tests:` add two lines: `- not_null` and `- unique`. Watch indentation.",
      validate: (s) => testDefinitionsInclude(s, 'stg_customers', ['not_null', 'unique']),
    },
    {
      id: 'run-tests',
      prompt: 'Run `dbt test` and make sure both tests pass on `stg_customers`.',
      hint: 'Type `dbt test` at the prompt.',
      validate: (s) => allTestsPass(s, 'stg_customers'),
    },
  ],
  quiz: {
    question: 'When does `dbt test` run your tests?',
    options: [
      'Continuously in the background',
      'Only when you call `dbt test` (or `dbt build`)',
      'Automatically after every `dbt run`',
      'Only in production',
    ],
    correctIndex: 1,
    explanation: 'Tests run only when you invoke them. `dbt build` is a shortcut that runs models and their tests together.',
  },
  furtherReading: [
    { label: 'Data tests', url: 'https://docs.getdbt.com/docs/build/data-tests' },
  ],
}

export default lesson07
