import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

const root = fileURLToPath(new URL('../', import.meta.url))
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
const base = 'e9573dad6fd9e61f221a0bb7e1d07775c2da8974'
function files(dir) {
  return readdirSync(`${root}/${dir}`, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? files(`${dir}/${entry.name}`) : [`${dir}/${entry.name}`])
}

test('review history excludes private QA commits and introduces no restricted binary or credential files', () => {
  const approvedMaster = '3b45e8f2324e8af85e55d81a1020306e95e1706e'
  // Test both the pending merge and its eventual commit; neither parent can be
  // dropped merely to satisfy the older single-branch review guard.
  const heads = ['HEAD']
  try { heads.push(git('rev-parse', '--verify', 'MERGE_HEAD')) } catch {}
  assert.ok(heads.some(head => git('merge-base', base, head) === base))
  assert.ok(heads.some(head => git('merge-base', approvedMaster, head) === approvedMaster))
  const ancestry = new Set(git('rev-list', ...heads).split('\n'))
  for (const sha of ['032ce7c94045c621d92da218dad55449972e0f4f', '4f6d3806e962dfcb3eaed12634d0e9fee9ec974b']) {
    assert.ok(!ancestry.has(sha), 'Never import the private QA parent chain')
  }
  const approvedAssets = new Set(
    [approvedMaster, 'caef52b956dea57ecad619b84adf3fe9e18332ad']
      .flatMap(ref => git('ls-tree', '-r', ref).split('\n'))
      .map(row => row.replace(/^\d+ blob /, ''))
  )
  // Check every introduced commit, not only a final snapshot that may delete media.
  const commits = git('rev-list', ...heads, '--not', base).split('\n').filter(Boolean)
  for (const commit of commits) for (const path of git('diff-tree', '--no-commit-id', '--name-only', '-r', commit).split('\n').filter(Boolean)) {
    if (/\.(?:mp3|pdf|zip|wav|m4a|ogg|jpeg|jpg|png|glb|bundle)$/i.test(path)) {
      const blob = git('rev-parse', `${commit}:${path}`)
      if (path === 'public/models/ingenuity.glb') {
        assert.equal(blob, '50bfaaaf7a2a6244e18902c1675455fecc35b1bb', path)
      } else {
        // The old local backup may repeat a master asset byte for byte.
        assert.ok(approvedAssets.has(`${blob}\t${path}`), path)
      }
    }
    assert.ok(!/(?:^|\/)(?:\.env(?:\..*)?|node_modules|dist)(?:\/|$)/.test(path), path)
  }
  const original = git('ls-tree', '-r', '--name-only', base, '--', 'public/audio').split('\n').filter(p => p.endsWith('.mp3')).sort()
  const actual = files('public/audio').filter(p => p.endsWith('.mp3')).sort()
  assert.equal(original.length, 22)
  assert.deepEqual(actual, original)
  for (const path of original) assert.deepEqual(readFileSync(`${root}/${path}`), execFileSync('git', ['show', `${base}:${path}`], { cwd: root, maxBuffer: 1024 * 1024 }), path)
  for (const path of ['public/audio/apollo-11', 'public/audio/apollo-17', 'public/images/apollo11-story']) assert.equal(existsSync(`${root}/${path}`), false)
  assert.equal(files('public').filter(p => p.endsWith('.pdf')).length, 0)
})
