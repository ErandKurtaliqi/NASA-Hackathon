import { beforeStoryVisual } from './story-visual-contract.mjs'
// Only this optional C activity mount is authorized in the Apollo 15 component.
// The remaining component, narration and completion logic retain the baseline.
export function withoutReleaseActivity(source) {
  return beforeStoryVisual(source)
    .replace("import EvidencePredictionActivity from './activities/EvidencePredictionActivity'\n", '')
    .replace("import { apollo15HammerFeatherPrediction } from '../../features/storytelling/activities/apollo15Prediction'\n", '')
    .replace('          {index === 3 && <EvidencePredictionActivity activity={apollo15HammerFeatherPrediction} />}\n', '')
}
