// Restore only the authorized JSX slot extraction for historical source guards.
// Compiled behavior tests always execute the real new components and handlers.
import { beforeAllBranches } from './all-branches-contract.mjs'
export function beforeCinematicSlots(source) {
  source = beforeAllBranches(source)
  source = source.replace("import MissionSceneCredits from './MissionSceneCredits'\n", '')
    .replace('<RoverStoryLayout sceneNote={<MissionSceneCredits idPrefix={`apollo${mission}-terrain`} diagram={experiment} />} opening=', '<RoverStoryLayout opening=')
  source = source.replace("import RoverStoryLayout from './CinematicStoryLayout'", "import RoverStoryLayout from './RoverStoryLayout'")
    .replace("import { apollo15OpeningEvidence } from '../../features/storytelling/storyStageAssets'\n", '')
    .replace("  const media = index === 0 && active === 0 && !cueMedia ? apollo15OpeningEvidence : apollo15StoryMedia[cueMedia ?? segmentMedia]", "  const media = apollo15StoryMedia[cueMedia ?? segmentMedia]")
    .replace('{inlineEvidence && i > 0 && evidence(apollo15SegmentMedia[index][i])}', '{inlineEvidence && evidence(apollo15SegmentMedia[index][i])}')
    .replace('{inline && i > 0 && evidence(mediaFor(i))}', '{inline && evidence(mediaFor(i))}')
    .replace('evidence={<><p className={styles.eyebrow}>NASA EVIDENCE ·', 'evidence={!inlineEvidence && <><p className={styles.eyebrow}>NASA EVIDENCE ·')
    .replace('evidence={<><p className={styles.eyebrow}>NASA EVIDENCE</p>', 'evidence={!inline && <><p className={styles.eyebrow}>NASA EVIDENCE</p>')
  for (const [collection,item,renderer] of [['tracks','track','renderTrack'],['segments','segment','renderSegment']]) {
    const prefix = `  const ${renderer} = (${item}: typeof ${collection}[number], i: number) => `
    const start=source.indexOf(prefix)
    if(start<0) continue
    const control=source.indexOf('  const readingControls = index < 4 ? ',start)
    const end=source.indexOf(' : undefined\n',control)
    if(control<0||end<0) throw Error('Unexpected cinematic JSX extraction')
    const article=source.slice(start+prefix.length,control).trimEnd()
    const controls=source.slice(control+'  const readingControls = index < 4 ? '.length,end)
    source=source.slice(0,start)+source.slice(end+' : undefined\n'.length)
    source=source.replace(`        {${collection}.slice(1).map((${item}, i) => ${renderer}(${item}, i + 1))}\n\n`,
      `        ${controls}\n        {${collection}.map((${item}, i) => ${article})}\n`)
    source=source.replace(`<RoverStoryLayout ${collection==='tracks'?'sceneCredits ':''}opening={index < 4 ? ${renderer}(${collection}[0], 0) : undefined} controls={readingControls} intro={introduction}`, '<RoverStoryLayout intro={introduction}')
  }
  return source
}
