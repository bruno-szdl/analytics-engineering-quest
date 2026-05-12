import type { Lesson } from '../engine/types'
import { seedLoaded, modelRan } from '../engine/validators'

const COUNTRIES = `code,name,region
US,United States,Americas
CA,Canada,Americas
BR,Brazil,Americas
IN,India,Asia
DE,Germany,Europe`

const lesson06: Lesson = {
  id: 6,
  title: 'Seeds',
  concept: `**Seeds** are small CSV files checked into the repo that dbt loads into the warehouse as tables. They're perfect for lookup data: country codes, currency rates, status mappings — anything that's small, slow-changing, and lives more naturally in version control than in a database.

Seeds are loaded with \`dbt seed\` (not \`dbt run\`) and are referenced from models with \`ref()\` just like models.`,
  initialFiles: {
    'seeds/countries.csv': COUNTRIES,
    'models/dim_countries.sql': `select
    code,
    name,
    region
from {{ ref('countries') }}`,
  },
  tasks: [
    {
      id: 'seed',
      prompt: 'Run `dbt seed` to load the `countries.csv` file into the warehouse.',
      hint: 'Type `dbt seed` at the prompt.',
      validate: (s) => seedLoaded(s, 'countries'),
    },
    {
      id: 'run',
      prompt: 'Now run `dbt run` to build `dim_countries`, which reads from the seed via `ref()`.',
      hint: "Seeds are referenced the same way as models: `{{ ref('countries') }}`.",
      validate: (s) => modelRan(s, 'dim_countries'),
    },
  ],
  quiz: {
    question: 'Which kind of data is a seed best suited for?',
    options: [
      'Millions of rows of event data',
      'Small, slow-changing reference data like country codes',
      'Production transactions',
      'Real-time streaming data',
    ],
    correctIndex: 1,
    explanation: 'Seeds are CSVs in your repo — they go through code review and are tiny. Anything large or fast-changing belongs in your warehouse, not a CSV.',
  },
  furtherReading: [
    { label: 'Seeds', url: 'https://docs.getdbt.com/docs/build/seeds' },
  ],
}

export default lesson06
