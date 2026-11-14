import { missionStageSurfaces } from '../../features/storytelling/missionStageAssets'

export default function MissionSceneCredits({ idPrefix, diagram = false }: { idPrefix: string; diagram?: boolean }) {
  const surface = missionStageSurfaces[idPrefix]
  if (!surface) return null
  return <p role="note">Storytelling composition · <a href={surface.sourceUrl} target="_blank" rel="noreferrer">{surface.label} ↗</a> · Credit: {surface.credit}. {diagram ? 'The hardware is an educational diagram, not a NASA photograph.' : 'The hardware portrait is a separate historical photograph; its provenance is labelled above.'} Scene framing and decorative lighting are not a single mission photograph or a geographic reconstruction.</p>
}
