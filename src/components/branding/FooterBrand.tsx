import { Link } from 'react-router-dom'

/** The existing shared-shell footer identity, reused without page layout changes. */
export default function FooterBrand({ linked = false }: { linked?: boolean }) {
  const identity = <><img src="/images/home/auroralys-mark.svg" width="34" height="34" alt="" style={{ flexShrink: 0 }} /><span><b>AURORALYS</b><small>BUILT FOR CURIOUS MINDS</small></span></>
  return linked
    ? <Link className="brand mini" to="/" aria-label="Auroralys home">{identity}</Link>
    : <div className="brand mini">{identity}</div>
}
