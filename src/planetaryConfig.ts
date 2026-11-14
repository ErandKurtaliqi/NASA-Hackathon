import type { PlanetId } from './types'

export interface PlanetaryLayerConfig {
  planet: PlanetId
  title: string
  shortTitle: string
  projection: string
  matrixSet: 'default028mm'
  maxZoom: number
  tileUrl: string
  capabilitiesUrl: string
  metadataUrl: string
  fallbackWest: string
  fallbackEast: string
}

export const planetaryLayers: Record<PlanetId, PlanetaryLayerConfig> = {
  mars: {
    planet: 'mars',
    title: 'MGS MOLA Global Color Hillshade',
    shortTitle: 'MGS MOLA',
    projection: 'IAU 2000 Mars Equirectangular · EPSG 104905',
    matrixSet: 'default028mm',
    maxZoom: 7,
    tileUrl: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
    capabilitiesUrl: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/WMTSCapabilities.xml',
    metadataUrl: 'https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=mars',
    fallbackWest: '/nasa-fallback/mars/west.jpg',
    fallbackEast: '/nasa-fallback/mars/east.jpg',
  },
  moon: {
    planet: 'moon',
    title: 'LRO WAC Global Mosaic 303 ppd v02',
    shortTitle: 'LRO WAC',
    projection: 'IAU 2000 Moon Equirectangular · EPSG 104903',
    matrixSet: 'default028mm',
    maxZoom: 8,
    tileUrl: 'https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
    capabilitiesUrl: 'https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/WMTSCapabilities.xml',
    metadataUrl: 'https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=moon',
    fallbackWest: '/nasa-fallback/moon/west.jpg',
    fallbackEast: '/nasa-fallback/moon/east.jpg',
  },
}

export function textureTileUrl(planet: PlanetId, z: number, y: number, x: number) {
  return planetaryLayers[planet].tileUrl
    .replace('{z}', String(z))
    .replace('{y}', String(y))
    .replace('{x}', String(x))
}
