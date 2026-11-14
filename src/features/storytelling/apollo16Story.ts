import type { MachineStory } from '../../machineStories'

export const apollo16Sources = {
  mission: { label: 'NASA - Apollo 16 mission details', url: 'https://www.nasa.gov/missions/apollo/apollo-16-mission-details/' },
  dates: { label: 'NASA NSSDCA - Apollo 16 dates (UTC)', url: 'https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo16info.html' },
  surface: { label: 'NASA - Apollo 16 on the Moon at Descartes', url: 'https://www.nasa.gov/history/apollo-16-on-the-moon-at-descartes/' },
  return: { label: 'NASA - Apollo 16 heads home to Earth', url: 'https://www.nasa.gov/history/apollo-16-heads-home-to-earth/' },
  rover: { label: 'NASA NSSDCA - Lunar Roving Vehicle', url: 'https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_lrv.html' },
  ultraviolet: { label: 'NASA - Earth in far-ultraviolet', url: 'https://www.nasa.gov/image-article/earth-in-far-ultraviolet/' },
}

export const apollo16Story: MachineStory = {
  id: 'apollo-16-rover', machineId: 'lrv-2', name: 'Apollo 16 Lunar Roving Vehicle', shortName: 'LRV-2', planet: 'moon',
  missionLabel: 'Apollo 16', status: 'INACTIVE ON THE MOON',
  heroLine: 'I carried John Young and Charlie Duke across the Descartes Highlands.',
  intro: "I'm LRV-2, the second Apollo rover driven on the Moon. My crew explored highland rocks while Ken Mattingly worked in orbit aboard Casper. Follow my original recorded story, then compare its dramatic language with the mission evidence.",
  profile: [
    { label: 'MY NAME', value: 'LRV-2 - Apollo 16' },
    { label: 'MY BUILDERS', value: 'NASA Marshall - Boeing - General Motors/Delco' },
    { label: 'MY HOME', value: 'Descartes Highlands, Moon' },
    { label: 'MY CREW', value: 'John Young and Charles Duke' },
    { label: 'LUNAR MODULE', value: 'Orion' },
    { label: 'COMMAND MODULE', value: 'Casper - Ken Mattingly' },
  ],
  sources: Object.values(apollo16Sources),
  journey: [
    { label: 'LAUNCH & ARRIVAL', date: '16-21 APR 1972 UTC', title: 'From Saturn V to Orion', copy: 'Launch was April 16. Touchdown was April 21 UTC, still April 20 in US Eastern time; these dates describe the same landing.' },
    { label: 'ENVIRONMENT', date: 'LUNAR SURFACE', title: 'Drive in a vacuum', copy: 'A hand controller operated steering, speed and braking. Two silver-zinc batteries supplied electric power; wire-mesh wheels needed no air.' },
    { label: 'THREE EXCURSIONS', date: '3 MOONWALKS', title: 'A wider field of science', copy: 'The rover extended the crew\'s practical range. Routes remained limited by the need to return safely to Orion if the rover failed.' },
    { label: 'GRAND PRIX', date: '21 APR 1972', title: 'Test the handling', copy: 'Duke filmed Young driving a planned engineering demonstration, testing turning and stopping on lunar terrain.' },
  ],
  challenges: [
    { title: 'A broken fender', problem: 'During EVA 2, Young caught his suit on the right rear fender extension and tore it off.', solution: 'The crew continued, with more dust thrown onto them and their equipment. The famous map-and-tape repair belongs to Apollo 17.' },
    { title: 'Stone Mountain', problem: 'Rocky, sloping terrain made travel and sampling difficult.', solution: 'The crew selected a route and sampling stops on the mountain slope; driving and geology remained a coordinated crew task.' },
    { title: 'Test a geological hypothesis', problem: 'Preflight expectations included volcanic highland formations.', solution: 'The samples instead emphasized impact processes. Evidence can overturn an attractive scientific hypothesis.' },
  ],
  discoveries: [
    { title: 'BIG MULEY', detail: 'At Plum Crater, Duke collected the nearly 26-pound rock nicknamed Big Muley, the largest single rock returned by an Apollo crew.' },
    { title: 'IMPACT BRECCIAS', detail: 'Fragments joined together by impact processes helped change interpretations of the Descartes highlands.' },
    { title: 'SURFACE AND ORBIT', detail: 'Young and Duke sampled the surface while Mattingly observed and photographed the Moon from Casper.' },
  ],
  legacy: [
    { year: '1972', title: 'Proving useful mobility', copy: 'A second crew used a rover for three lunar excursions, extending work in highland terrain.' },
    { year: '1972', title: 'A lunar observatory', copy: 'The far-ultraviolet camera was a separate surface instrument, developed by George Carruthers. It observed Earth and celestial targets; it was not the rover television camera.' },
    { year: '23 APR', title: 'A final camera station', copy: 'Young parked the rover about 300 feet east of Orion so its remotely controlled television camera could watch liftoff.' },
    { year: 'TODAY', title: 'Inactive at Descartes', copy: 'The rover stayed on the Moon. It is not still driving, transmitting, or actively guarding the landing site.' },
  ],
  quiz: [
    { question: 'Where did Apollo 16 land on the Moon?', options: ['Sea of Tranquility', 'Descartes Highlands', 'Ocean of Storms', 'South Pole'], answer: 1, explanation: 'Apollo 16 explored the Descartes Highlands.' },
    { question: 'What was the name of the giant Moon rock Charlie Duke collected?', options: ['Big Muley', 'Moon Giant', 'Rock Star', 'Lunar King'], answer: 0, explanation: 'Big Muley was collected at Plum Crater. Its nickname honors geology investigator Bill Muehlberger.' },
    { question: 'While John Young and Charlie Duke explored the Moon, what was Ken Mattingly doing?', options: ['Waiting on Earth for their return', 'Orbiting the Moon aboard Casper', 'Exploring another part of the Moon', 'Operating the rover from Orion'], answer: 1, explanation: 'Mattingly operated orbital experiments and cameras aboard Casper.' },
  ],
  reward: 'Descartes Highlands Explorer',
}
