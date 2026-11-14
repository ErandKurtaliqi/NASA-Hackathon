import { useState } from 'react'
import { ExternalLink } from 'lucide-react'

export default function EsriMarsView(){
 const [loaded,setLoaded]=useState(false)
 return <section className="esri-mars-view" aria-label="Esri Explore Mars"><iframe title="Explore Mars — Esri 3D terrain and rover locations" src="https://explore-mars.esri.com/" allow="fullscreen" allowFullScreen onLoad={()=>setLoaded(true)}/><div className="esri-map-help"><span>{loaded?'Find a rover: open Locations in the Esri map.':'Loading Esri Explore Mars…'}</span><a href="https://explore-mars.esri.com/" target="_blank" rel="noreferrer">Open full map <ExternalLink size={14}/></a><small>Esri Explore Mars · External map. Our landing-site markers are in Map View; they are not live rover positions.</small></div></section>
}
