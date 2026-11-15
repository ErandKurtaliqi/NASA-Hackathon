import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const root = fileURLToPath(new URL('../', import.meta.url)), require = createRequire(import.meta.url)
const effects = [], calls = [], tileStates = []
let reduced = false
const fakeMap = { flyTo: (...args) => calls.push(['flyTo', ...args]), fitBounds: (...args) => calls.push(['fitBounds', ...args]) }
globalThis.__finalLocationMap = fakeMap
globalThis.__finalLocationReduced = () => reduced
const result = await build({ stdin: { contents: `export * from './src/features/explorer/storyMapLocations';
  export {default as Locations} from './src/components/explorer/ScientificLocations';
  export {default as PlanetMap} from './src/components/PlanetMap';`, resolveDir: root },
  bundle: true, write: false, outfile: `${root}/.final-locations-test.cjs`, platform: 'node', format: 'cjs',
  packages: 'external', jsx: 'automatic', loader: { '.css': 'local-css' }, logLevel: 'silent', plugins: [{name:'map-host',setup(b) {
    const fixtures = {
      leaflet: `export default {extend:Object.assign, CRS:{Simple:{}}, Transformation:class {},divIcon:options=>options}`,
      'react-leaflet': `export const ImageOverlay='image-overlay',MapContainer='map-container',Marker='map-marker',Popup='map-popup',TileLayer='tile-layer';export const useMap=()=>globalThis.__finalLocationMap`,
      'react-router-dom': `export const useNavigate=()=>()=>{},Link='a'`,
      'framer-motion': `export const useReducedMotion=()=>globalThis.__finalLocationReduced()`,
    }
    b.onResolve({filter:/^(leaflet|react-leaflet|react-router-dom|framer-motion)$/},args=>({path:args.path,namespace:'fixture'}))
    b.onLoad({filter:/.*/,namespace:'fixture'},args=>({contents:fixtures[args.path],loader:'js'}))
    b.onLoad({filter:/[\\/]store\.ts$/},()=>({contents:'export const useProgress=selector=>selector({exploreLocation(){}})',loader:'js'}))
  }}] })
const module = {exports:{}}
new Function('require','module','exports',result.outputFiles.find(f=>f.path.endsWith('.cjs')).text)(
  id=>id==='react'?{...React,useEffect:(fn,deps)=>effects.push({fn,deps}),useState:value=>[value,next=>tileStates.push(next)],useRef:value=>({current:value}),useMemo:fn=>fn()}:require(id),module,module.exports)
const api = module.exports
const expected = [
  ['moon','Apollo 11 Eagle Descent Stage','Tranquility Base, Mare Tranquillitatis',0.67408,23.47297,'0.67408° N, 23.47297° E'],
  ['moon','Apollo 11 LRRR','Mare Tranquillitatis, Sea of Tranquility',0.67345,23.47307,'0.67345° N, 23.47307° E'],
  ['moon','Apollo 15 LRV','Hadley-Apennine Region, Hadley Rille',26.13110,3.63972,'26.13110° N, 3.63972° E'],
  ['moon','Apollo 16 LRV','Descartes Highlands, near Orion Lunar Module',-8.97292,15.50279,'8.97292° S, 15.50279° E'],
  ['moon','Apollo 17 LRV','Taurus-Littrow Valley, near Challenger Lunar Module',20.19043,30.77726,'20.19043° N, 30.77726° E'],
  ['mars','Opportunity Rover','Perseverance Valley, Endeavour Crater'],
  ['mars','Sojourner Rover','Ares Vallis, Mars Pathfinder Landing Site'],
  ['mars','Viking 1 Lander','Chryse Planitia',22.483,-47.968,'22.483° N, 47.968° W'],
  ['mars','Ingenuity Helicopter','Valinor Hills, Jezero Crater'],
]
function nodes(tree, predicate) {
  if (Array.isArray(tree)) return tree.flatMap(child=>nodes(child,predicate))
  if (!tree?.props) return []
  return [...(predicate(tree)?[tree]:[]),...nodes(tree.props.children,predicate)]
}

for (const planet of ['moon','mars']) test(`${planet}: expected mission inventory; no general-purpose or retired entries`,()=>{
  const rows=api.getPlanetLocations(planet)
  assert.deepEqual(rows.map(r=>r.name),expected.filter(r=>r[0]===planet).map(r=>r[1]))
  assert.equal(rows.length,planet==='moon'?5:4)
  assert.ok(rows.every(r=>!['jezero','curiosity','perseverance','tycho'].includes(r.id)))
})

for (const [planet,name,place,lat,lon,display] of expected) test(`${name}: exact approved text, optional coordinates, selection and map action`,()=>{
  const row=api.getPlanetLocations(planet).find(r=>r.name===name)
  assert.equal(row.location,place)
  if (display) assert.deepEqual(row.coordinates,{latitude:lat,longitude:lon,display})
  else {assert.equal(row.coordinates,undefined);assert.equal('latitude' in row,false);assert.equal(row.precision,'location-only')}
  let selected, viewed
  const props={planet,selectedId:row.id,onSelect:id=>selected=id,onViewMap:id=>viewed=id}
  const tree=api.Locations(props), buttons=nodes(tree,n=>n.type==='button')
  assert.equal(buttons.length,planet==='moon'?6:5)
  const active=buttons.find(b=>b.props['aria-pressed']===true)
  active.props.onClick(); assert.equal(selected,row.id)
  assert.equal(active.props['aria-controls'],'location-information')
  buttons.find(b=>b.props['aria-pressed']===undefined).props.onClick();assert.equal(viewed,row.id)
  const html=renderToStaticMarkup(React.createElement(api.Locations,props))
  assert.ok(html.includes(place));assert.ok(html.includes(display??'Not provided'))
  assert.ok(!html.includes('Location precision')&&!html.includes('<details'))
  assert.ok(html.includes('Final Mission Locations')&&html.includes('role="status"'))
  if(name==='Apollo 11 LRRR'){assert.ok(html.includes('Stationary reflector'));assert.ok(!html.includes('parked'))}
})

for (const planet of ['moon','mars']) test(`${planet}: Leaflet creates only supplied-coordinate pins and focuses the approved selection`,()=>{
  for(const row of api.getPlanetLocations(planet)) {
    calls.length=0;effects.length=0
    const tree=api.PlanetMap({planet,focusId:row.id,focusRequest:7})
    const pins=nodes(tree,n=>n.type==='map-marker')
    assert.equal(pins.length,planet==='moon'?5:1)
    assert.deepEqual(pins.map(p=>p.props.position),api.getPlanetLocations(planet).filter(api.hasCoordinates).map(r=>[r.coordinates.latitude,r.coordinates.longitude]))
    const focus=nodes(tree,n=>typeof n.type==='function'&&n.type.name==='FocusLocation')[0]
    focus.type(focus.props);effects.forEach(e=>e.fn())
    if(row.coordinates){assert.deepEqual(calls[0].slice(0,2),['flyTo',[row.coordinates.latitude,row.coordinates.longitude]])}
    else {assert.deepEqual(calls,[['fitBounds',[[-90,-180],[90,180]],{animate:false}]]);assert.ok(!pins.some(p=>p.props.title.includes(row.name)))}
    const notice=nodes(tree,n=>n.props['data-mission-location']===row.id)[0]
    assert.ok(notice);assert.equal(notice.props.role,'status')
    assert.ok(effects[0].deps.includes(7),'Repeated map requests can refocus the same mission')
  }
})

test('reduced motion disables exact focus animation; NASA layers, CRS and controls remain configured',()=>{
  reduced=true;effects.length=0;calls.length=0
  const tree=api.PlanetMap({planet:'moon',focusId:'apollo-15-rover'})
  const focus=nodes(tree,n=>typeof n.type==='function'&&n.type.name==='FocusLocation')[0]
  focus.type(focus.props);effects.forEach(e=>e.fn());assert.equal(calls[0][3].animate,false);reduced=false
  const container=nodes(tree,n=>n.type==='map-container')[0]
  assert.deepEqual(container.props.crs.wrapLng,[-180,180]);assert.equal(container.props.crs.infinite,false)
  assert.equal(nodes(tree,n=>n.type==='tile-layer').length,1)
  assert.equal(nodes(tree,n=>n.type==='image-overlay').length,2)
  assert.equal(nodes(tree,n=>typeof n.type==='function'&&n.type.name==='MapControls').length,1)
})

test('planet changes and unknown selections cannot retain another planet’s mission',()=>{
  for(const planet of ['moon','mars'])for(const id of ['unknown','',...api.getPlanetLocations(planet==='moon'?'mars':'moon').map(r=>r.id)]){
    assert.equal(api.getSelectedLocation(planet,id).planet,planet)
    assert.equal(api.getSelectedLocation(planet,id).id,api.getPlanetLocations(planet)[0].id)
  }
})

test('a failed NASA tile batch cannot be reported as live, and a later successful batch recovers',()=>{
  tileStates.length=0
  const tree=api.PlanetMap({planet:'mars',focusId:'opportunity'})
  const events=nodes(tree,n=>n.type==='tile-layer')[0].props.eventHandlers
  events.loading();events.tileerror();events.load()
  assert.deepEqual(tileStates,['loading','fallback','fallback'])
  events.loading();events.load()
  assert.deepEqual(tileStates.slice(-2),['loading','live'])
})

test('all nine mission links resolve',()=>{
  assert.equal(new Set(api.storyMapLocations.map(r=>api.getMapStory(r)?.id)).size,9)
  assert.ok(api.storyMapLocations.every(r=>api.getMapStory(r)?.planet===r.planet))
})

test('Rover implementation, stories, assets, legacy scientific data and progress are untouched',()=>{
  const changed=execFileSync('git',['diff','--name-only','a912a7e7ef646a43cdd81ad16ada7af243dde494'],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/)
  const protectedPath=/^(src\/(?:App\.tsx|store\.ts|data\.ts|types\.ts|machineStories\.ts|planetaryConfig\.ts|features\/storytelling\/|components\/(?:storytelling|rover)\/|components\/(?:PlanetScene|RoverScene|LunarRoverScene)\.tsx)|public\/)/
  assert.deepEqual(changed.filter(path=>protectedPath.test(path)),[])
  const page=readFileSync(new URL('../src/pages/ExplorerPage.tsx',import.meta.url),'utf8')
  assert.ok(page.includes('focusId={location.id}')&&page.includes('setFocusRequest(value => value + 1)'))
})
