// Read-only history/tree audit. Writes only the explicitly requested JSON report.
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const output = process.argv[2]
if (!output) throw Error('Specify the output JSON path')
const root = fileURLToPath(new URL('../', import.meta.url))
const master = '3b45e8f2324e8af85e55d81a1020306e95e1706e', feature = 'ddb458657e1fa5fca0bd117f265e95b444090712'
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, stdio: ['ignore','pipe','pipe'] }).trim()
const common = git('merge-base', master, feature)
const commits = git('rev-list', master, feature, '--not', common).split('\n')
const patterns = {
  githubToken: /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/,
  awsAccessKey: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
  privateKey: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  openaiToken: /\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{30,}\b/,
}
const findings = [], personalPaths = []
function scan(text, location) {
  for (const [kind, pattern] of Object.entries(patterns)) if (pattern.test(text)) findings.push({ kind, location })
  if (/[A-Za-z]:[\\/]Users[\\/](?!<|Public\b|Default\b)[^\\/\r\n ]+/i.test(text)) personalPaths.push(location)
}
const binary = /\.(?:mp3|pdf|zip|wav|m4a|ogg|jpeg|jpg|png|glb|bundle)$/i
const approved = new Map()
for (const ref of [master, feature]) for (const line of git('ls-tree', '-r', ref).split('\n')) {
  const [, blob, path] = line.match(/^\d+ blob ([a-f0-9]+)\t(.+)$/) ?? []
  if (path && binary.test(path)) {
    if (!approved.has(path)) approved.set(path, new Set())
    approved.get(path).add(blob)
  }
}
const unauthorizedMedia = [], prohibitedPaths = []
for (const commit of commits) {
  const added = git('show', '-m', '--format=', '--unified=0', commit).split('\n').filter(line => line.startsWith('+') && !line.startsWith('+++')).join('\n')
  scan(added, `commit:${commit}`)
  for (const path of git('diff-tree', '--no-commit-id', '--name-only', '-r', commit).split('\n').filter(Boolean)) {
    if (/(?:^|\/)(?:\.env(?:\..*)?|node_modules|dist)(?:\/|$)/.test(path) && !path.endsWith('.env.example')) prohibitedPaths.push({ commit, path })
    if (binary.test(path)) {
      try { if (!approved.get(path)?.has(git('rev-parse', `${commit}:${path}`))) unauthorizedMedia.push({ commit, path }) } catch { /* deletion: inspect earlier introducing commit */ }
    }
  }
}
const files = [...new Set(git('ls-files', '--cached', '--others', '--exclude-standard').split('\n').filter(Boolean))]
for (const path of files) {
  const bytes = readFileSync(resolve(root, path))
  if (binary.test(path)) {
    if (!approved.get(path)?.has(git('hash-object', '--', path))) unauthorizedMedia.push({ tree: 'working', path })
  } else if (!bytes.includes(0)) scan(bytes.toString('utf8'), `working:${path}`)
}
const forbiddenAncestors = ['032ce7c94045c621d92da218dad55449972e0f4f','4f6d3806e962dfcb3eaed12634d0e9fee9ec974b','44e6a65982e86d050a5305a708bb945f1669c13b','814d0443f65c77164635bc43b643a2aea2799d5f']
const ancestry = new Set(git('rev-list', master, feature).split('\n'))
const importedPrivateAncestors = forbiddenAncestors.filter(sha => ancestry.has(sha))
const report = { master, feature, common, incomingCommits: commits.length, workingFiles: files.length,
  knownSecretMatches: findings, personalPathLocations: personalPaths, unauthorizedMedia, prohibitedPaths, importedPrivateAncestors,
  trackedAudioCount: files.filter(path => path.endsWith('.mp3')).length,
  trackedPdfZipCount: files.filter(path => /\.(pdf|zip)$/i.test(path)).length,
  passed: !findings.length && !personalPaths.length && !unauthorizedMedia.length && !prohibitedPaths.length && !importedPrivateAncestors.length,
  limitation: 'Known key/token patterns, filesystem-path patterns, binary hashes and ancestry checks; not an exhaustive credential or licensing certification.' }
writeFileSync(resolve(root, output), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report))
if (!report.passed) process.exitCode = 1
