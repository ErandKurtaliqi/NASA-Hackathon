import { readFileSync } from 'node:fs'

// Component-only coverage of retained historical Perseverance code. Production
// routes remain disabled and are exercised without this fixture in moon-scope.
// Install only in old component suites, never in the public routing tests.
export const historicalPerseverance = {
  name: 'retained-historical-perseverance-components',
  setup(build) {
    build.onLoad({ filter: /[\\/]storytelling[\\/]pilot\.ts$/ }, args => ({ loader: 'ts', contents:
      readFileSync(args.path, 'utf8')
        .replace("import { storyCatalog } from './storyCatalog'", "import { storyCatalog as published } from './storyCatalog'; import {machineStories} from '../../machineStories'; const storyCatalog={...published,'follow-perseverance':machineStories['follow-perseverance']}")
    }))
  },
}
