import type { PlanetId } from '../../types'

// Tab navigation intent only, never scientific data or persisted mission progress.
const key = 'auroralys-documentary-return-planet-v1'
let documentaryPlanet: PlanetId | undefined
export function noteDocumentaryPlanet(planet: PlanetId) {
  documentaryPlanet = planet
  try { window.sessionStorage.setItem(key, planet) } catch { /* In-memory fallback. */ }
}
export function isDocumentaryPlanetReturn(planet: PlanetId) {
  if (documentaryPlanet === planet) return true
  try { return window.sessionStorage.getItem(key) === planet } catch { return false }
}
export function clearDocumentaryPlanetReturn() {
  documentaryPlanet = undefined
  try { window.sessionStorage.removeItem(key) } catch { /* Storage may be denied. */ }
}
