import { beforeAllBranches } from './all-branches-contract.mjs'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const manifest = JSON.parse(readFileSync(new URL('../fixtures/master-integration-sources.json', import.meta.url), 'utf8'))
const root = new URL('../../', import.meta.url)
const snapshots = new Map(manifest.files.map(row => [row.integratedSha256, row.path]))
// Historical byte comparisons predate the explicitly authorized master merge.
// Only an EXACT reviewed snapshot can be reversed to its feature checkpoint.
// Any unreviewed byte fails those comparisons. Functional tests compile the real
// integrated files; master-integration.test.mjs additionally checks both parents.
export function beforeMasterIntegration(source) {
  source = beforeAllBranches(source)
  const normalized = source.replaceAll('\r\n', '\n')
  const path = snapshots.get(createHash('sha256').update(normalized).digest('hex'))
  return path ? execFileSync('git', ['show', `${manifest.feature}:${path}`], { cwd: root, encoding: 'utf8' }).replaceAll('\r\n', '\n') : source
}
