import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import postcss from 'postcss'
import ts from 'typescript'

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
const adapter = postcss.parse(read('src/components/explorer/ScientificMap.module.css'))
const leaflet = postcss.parse(read('node_modules/leaflet/dist/leaflet.css'))
const globalCss = postcss.parse(read('src/index.css'))

// Source/cascade and geometry regression checks, not a substitute for browser rendering.
function declarations(roots, selector, { width, queries = true } = {}) {
  const result = {}
  for (const root of roots) root.walkRules(rule => {
    if (!rule.selectors.includes(selector)) return
    for (let parent = rule.parent; parent; parent = parent.parent) {
      if (parent.type !== 'atrule') continue
      if (parent.name === 'supports' && !queries) return
      const max = parent.params?.match(/max-width:\s*(\d+)px/)
      if (parent.name === 'media' && max && width > +max[1]) return
    }
    rule.walkDecls(decl => { result[decl.prop] = decl.value })
  })
  return result
}

function length(value, viewport, variables = {}) {
  const expression = value
    .replace(/var\((--[\w-]+)\)/g, (_, key) => `(${length(variables[key], viewport, variables)})`)
    .replace(/([\d.]+)(px|cqw|vw|svh|dvh)/g, (_, number, unit) =>
      +number * (unit === 'px' ? 1 : unit === 'cqw' ? viewport.mapWidth / 100 : unit === 'vw' ? viewport.width / 100 : viewport.height / 100))
    .replace(/calc\(/g, '(').replace(/clamp\(/g, 'clamp(')
  assert.match(expression, /^[\d\s.,()+*/\-minaxclp]+$/)
  return new Function('min', 'max', 'clamp', `return ${expression}`)(Math.min, Math.max, (min, preferred, max) => Math.min(max, Math.max(min, preferred)))
}

// Run the installed Leaflet auto-pan method against measured-box fixtures.
// Application code never calls private methods or changes Leaflet options.
const popupSource = ts.createSourceFile('Popup.js', read('node_modules/leaflet/src/layer/Popup.js'), ts.ScriptTarget.Latest, true)
let panBody
function findPan(node) {
  if (ts.isPropertyAssignment(node) && node.name.getText(popupSource) === '_adjustPan') panBody = node.initializer.body.getText(popupSource)
  ts.forEachChild(node, findPan)
}
findPan(popupSource)
assert.ok(panBody, 'Review tests when upgrading Leaflet')
class Point {
  constructor(x, y) { this.x = x; this.y = y }
  _add(point) { this.x += point.x; this.y += point.y; return this }
}
const adjustPan = new Function('Point', 'toPoint', 'DomUtil', `return function() ${panBody}`)(
  Point, value => value instanceof Point ? value : new Point(...value), { getStyle: () => '20px', getPosition: element => element.position },
)

const data = ts.transpileModule(read('src/data.ts'), { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const { markers } = await import(`data:text/javascript;base64,${Buffer.from(data).toString('base64')}`)
const viewports = [
  { width: 320, height: 568, mapWidth: 286 },
  { width: 360, height: 800, mapWidth: 326 },
  { width: 390, height: 844, mapWidth: 356 },
  { width: 439, height: 591, mapWidth: 397 },
  { width: 820, height: 640, mapWidth: 385 },
  { width: 1024, height: 768, mapWidth: 589 },
  { width: 1280, height: 720, mapWidth: 692 },
  { width: 1440, height: 900, mapWidth: 833 },
  { width: 1920, height: 1080, mapWidth: 1116 },
]

for (const planet of ['mars', 'moon']) for (const queries of [true, false]) {
  test(`${planet}: native auto-pan fits edge popups and leaves the control rail free (container queries ${queries})`, () => {
    assert.ok(markers.some(marker => marker.planet === planet))
    for (const viewport of viewports) for (const fullscreen of [false, true]) {
      const context = { ...viewport, queries, mapWidth: fullscreen ? viewport.width : viewport.mapWidth }
      const variables = declarations([adapter], '.frame', context)
      if (fullscreen) Object.assign(variables, declarations([adapter], '.frame :global(.map-shell:fullscreen)', context))
      const popup = declarations([adapter], '.frame :global(.leaflet-popup)', context)
      const content = declarations([adapter], '.frame :global(.leaflet-popup-content)', context)
      const gutter = length(popup['padding-right'], context, variables)
      const mapHeight = length(variables['--map-height'], context, variables)
      const contentWidth = length(content.width, context, variables)
      const contentHeight = length(content['max-height'], context, variables)
      const margins = content.margin.split(' ').map(value => length(value, context))
      // Leaflet wrapper: 1px padding + the app's 1px border on each side.
      assert.equal(declarations([leaflet], '.leaflet-popup-content-wrapper').padding, '1px')
      assert.match(declarations([globalCss], '.leaflet-popup-content-wrapper').border, /^1px /)
      const popupWidth = contentWidth + 2 * margins[1] + 4 + gutter
      const popupHeight = contentHeight + margins[0] + margins[2] + 4
      const controls = declarations([adapter], '.frame :global(.map-controls)', context)
      const button = declarations([adapter], '.frame :global(.map-controls) button', context)
      const railLeft = context.mapWidth - length(controls.right, context) - length(button.width, context) - 2
      assert.ok(contentWidth >= 150, 'Popup text must retain a usable column')
      for (const x of [1, context.mapWidth / 2, context.mapWidth - 1]) for (const y of [1, mapHeight / 2, mapHeight - 1]) {
        let delta = [0, 0]
        const map = { getSize: () => new Point(context.mapWidth, mapHeight), layerPointToContainerPoint: point => point,
          fire() { return this }, panBy(value) { delta = value } }
        const left = -Math.round(popupWidth / 2)
        adjustPan.call({ options: { autoPan: true, autoPanPadding: [5, 5] }, _map: map,
          _container: { offsetHeight: popupHeight, position: new Point(x, y) }, _containerWidth: popupWidth,
          _containerLeft: left, _containerBottom: -7 })
        const finalLeft = x + left - delta[0]
        const finalTop = y - popupHeight - 20 + 7 - delta[1]
        assert.ok(finalLeft >= 5 && finalLeft + popupWidth <= context.mapWidth - 5, 'Horizontal popup clipping')
        assert.ok(finalTop >= 5 && finalTop + popupHeight + 20 <= mapHeight - 5, 'Vertical popup clipping')
        assert.ok(finalLeft + popupWidth - gutter <= railLeft - 8, 'Painted popup overlaps controls')
        assert.ok(Math.abs(finalLeft + popupWidth / 2 - (x - delta[0])) <= 0.5, 'Native geographic tip moved')
      }
    }
  })
}

test('popup accessibility and metadata remain scoped to the 2D adapter', () => {
  const content = declarations([adapter], '.frame :global(.leaflet-popup-content)', { width: 360 })
  assert.equal(content.overflow, 'auto')
  assert.equal(content['overscroll-behavior'], 'contain')
  assert.equal(content['touch-action'], 'pan-y')
  const close = declarations([adapter], '.frame :global(.leaflet-container) a:global(.leaflet-popup-close-button)')
  assert.equal(close.width, '44px'); assert.equal(close.height, '44px')
  assert.equal(close.right, 'var(--popup-control-space)')
  for (const selector of ['.frame :global(.leaflet-popup-content) a:focus-visible', '.frame :global(.leaflet-marker-icon):focus-visible']) {
    assert.ok(declarations([adapter], selector).outline)
  }
  for (const target of ['map-data-panel', 'map-service-state']) {
    assert.equal(declarations([adapter], `.frame :global(.${target})`, { width: 360 }).position, 'static')
  }
  adapter.walkRules(rule => {
    assert.ok(rule.selectors.every(selector => selector.startsWith('.frame') || selector.startsWith('.interactive')))
    assert.ok(!/leaflet-(tile|overlay|marker|popup)-pane/.test(rule.selector), 'Scientific pane ordering must remain untouched')
  })
})
