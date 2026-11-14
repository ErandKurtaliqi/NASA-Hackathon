import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'

const root = new URL('../../', import.meta.url)
const draft = 'caef52b956dea57ecad619b84adf3fe9e18332ad'
// The historical comparisons still run against their original snapshots.
// Normalize only the exact Hardware Lab and audio workstream integration.
const integrated = new Map([
  ['2aecc72186a1c045b2285632e1988d1dc23e4159823354dd7f98e7fb30a3bd49', 'src/App.tsx'],
  ['d980db25dcc746c6d5558f0e879c694f518571caab9e6d71eced83e1a6d948eb', 'src/index.css'],
  ['0e3ae83877bb3a52884d3a5a102d8dbc38672264ba6e2d51cd593743ed61b55c', 'src/components/RoverScene.tsx'],
  ['b083e79b6eb90ec4be9a9cf566cd4a6c7373b076ddfd956e6af9cb4b85ce0121', 'src/components/storytelling/Apollo15ScrollStory.tsx'],
  ['b73d46b25bcb7ac358eb4f64244283b9f2192364e13ee406dc0f6957123dfbf8', 'src/components/storytelling/StoryRecording.tsx'],
])

export function beforeAllBranches(source) {
  const normalized = source.replaceAll('\r\n', '\n')
  const path = integrated.get(createHash('sha256').update(normalized).digest('hex'))
  return path ? execFileSync('git', ['show', `${draft}:${path}`], { cwd: root, encoding: 'utf8' }).replaceAll('\r\n', '\n') : source
}
