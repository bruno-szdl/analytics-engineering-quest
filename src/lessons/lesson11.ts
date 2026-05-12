import type { Lesson } from '../engine/types'
import { buildSucceeded } from '../engine/validators'

const RAW_USERS = `id,email,signup_at
1,a@example.com,2024-01-01
2,b@example.com,2024-01-02
3,c@example.com,2024-01-03`

const lesson11: Lesson = {
  id: 11,
  title: 'Custom (singular) tests',
  concept: `When the built-in tests aren't enough, you can write your own. A **singular test** is just a SQL query saved under \`tests/\` — if it returns any rows, the test fails.

Example: "no user signed up before our company was founded." Put a SELECT that returns offending rows in \`tests/no_pre_launch_signups.sql\` and \`dbt test\` will pick it up.`,
  initialFiles: {
    'models/stg_users.sql': `select id, email, signup_at from raw_users`,
    'tests/no_future_signups.sql': `-- Returns rows where signup_at is in the future. Should be empty.
select *
from {{ ref('stg_users') }}
where signup_at > current_date`,
    'models/schema.yml': `version: 2

models:
  - name: stg_users
    columns:
      - name: id
        tests:
          - not_null
          - unique
`,
  },
  seeds: { raw_users: RAW_USERS },
  tasks: [
    {
      id: 'inspect',
      prompt: 'Open `tests/no_future_signups.sql` and read it. The test passes when this query returns zero rows.',
      hint: "Click the file in the explorer to open it. The pattern is: write a SELECT for the bad case; empty result = pass.",
      validate: (s) => Boolean(s.files['tests/no_future_signups.sql']),
    },
    {
      id: 'build',
      prompt: 'Run `dbt build` — it runs models then every test (generic + singular) in dependency order.',
      hint: '`dbt build` = `dbt run` + `dbt test`, in DAG order.',
      validate: (s) => buildSucceeded(s),
    },
  ],
  quiz: {
    question: 'A singular test in `tests/foo.sql` passes when…',
    options: [
      'The query returns at least one row',
      'The query returns zero rows',
      'The query has no syntax errors',
      'The file exists',
    ],
    correctIndex: 1,
    explanation: "Singular tests are 'find me the bad rows' queries. Zero bad rows = pass.",
  },
  furtherReading: [
    { label: 'Singular data tests', url: 'https://docs.getdbt.com/docs/build/data-tests#singular-data-tests' },
  ],
}

export default lesson11
