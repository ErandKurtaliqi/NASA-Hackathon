import type { DocumentaryGalleryItem, StoryEvidenceMedia } from '../../components/storytelling/StoryMedia'
import type { MarsStoryId } from './marsStories'
import { ingenuityEvidence } from './ingenuityEvidence'

export type MarsSegmentEvidence = {
  label: string
  summary: string
  sourceUrl: string
  media?: StoryEvidenceMedia
  gallery?: readonly DocumentaryGalleryItem[]
  video?: string
  optionalVideo?: { url: string; label: string }
}

const usage = {
  verifiedOn: '2026-11-13',
  usagePolicyUrl: 'https://www.nasa.gov/nasa-brand-center/images-and-media/',
  usageNotes: 'Evidence selected only from the supplied mission PDF. No NASA endorsement is implied.',
}

function image(id: string, label: string, summary: string, src: string, sourceUrl = src,
  kind: StoryEvidenceMedia['kind'] = 'Photograph', credit = 'NASA/JPL-Caltech'): MarsSegmentEvidence & { media: StoryEvidenceMedia } {
  return { label, summary, sourceUrl, media: {
    id, title: label, caption: summary, alt: `${label}. ${summary}`, credit, kind,
    src, originalUrl: src, srcSet: `${src} 1600w`, width: 1600, height: 900, sourceUrl, ...usage,
  } }
}

function source(label: string, summary: string, sourceUrl: string): MarsSegmentEvidence {
  return { label, summary, sourceUrl }
}

const sojournerWaterEvidence = [
  image('sojourner-3-3', 'Sockets and pebbles', 'A close-up shows small rounded features in a Martian rock.', 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/resources/detail_files/8/8625_PIA00989-full2.jpg?w=523&h=475&fit=clip&crop=faces%2Cfocalpoint', 'https://science.nasa.gov/photojournal/sockets-and-pebbles/'),
  image('sojourner-3-3-detail', 'Rocky terrain at the Pathfinder site', 'A second view gives context for the observations of rounded rocks.', 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/resources/detail_files/8/8648_PIA01133-full2.jpg?w=288&h=288&fit=clip&crop=faces%2Cfocalpoint', 'https://science.nasa.gov/mission/mars-pathfinder/'),
]

const sojournerIntro = image('sojourner-1-1', 'Sojourner on Mars', 'The Pathfinder mission image supplied for Sojourner\'s introduction.', 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/2023/09/p/i/a/0/PIA01551-1.jpg?w=1099&h=572&fit=clip&crop=faces%2Cfocalpoint', 'https://science.nasa.gov/mission/mars-pathfinder/')

function withSojournerGallery(
  primary: MarsSegmentEvidence & { media: StoryEvidenceMedia },
  entries: (primary: MarsSegmentEvidence & { media: StoryEvidenceMedia }) => readonly DocumentaryGalleryItem[],
): MarsSegmentEvidence {
  return { ...primary, gallery: entries(primary) }
}

const sojourner: readonly MarsSegmentEvidence[][] = [
  [
    {
      ...sojournerIntro,
      gallery: [
        image('sojourner-intro-supplied', 'Sojourner rover', 'The first image supplied for the rover introduction.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRu4c1ayYJcfVpW_dZu3gfCwkEOq4vc_KFLP9CS1gEaJVJnrHDHVsmEO7tv&s=10', undefined, 'Photograph', 'Supplied image').media,
        sojournerIntro.media,
      ],
    },
    image('sojourner-small-but-mighty', 'Sojourner’s instruments and hardware', 'A labeled diagram shows the solar panel, antenna, science instruments and six-wheel suspension.', '/images/sojourner-evidence/small-but-mighty.png', 'https://science.nasa.gov/mission/mars-pathfinder/', 'Illustration · not a photograph', 'Image supplied for this section'),
    withSojournerGallery(image('sojourner-1-3', 'Sojourner engineering view', 'A supplied Pathfinder image showing the small six-wheeled rover and its engineering form.', 'https://assets.science.nasa.gov/content/dam/science/psd/photojournal/pia/pia04/pia04421/PIA04421.jpg/jcr:content/renditions/cq5dam.web.1280.1280.jpeg', 'https://science.nasa.gov/mission/mars-pathfinder/'), primary => [
        image('sojourner-rover-rotation', 'Sojourner from multiple angles', 'An animated view shows the compact rover and its six wheels.', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/Sojourner.gif/330px-Sojourner.gif?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail', 'https://science.nasa.gov/mission/mars-pathfinder/', 'Photograph', 'Supplied Wikimedia Commons image').media,
        image('sojourner-lander-preparations', 'Pathfinder lander preparations', 'Technicians prepare the lander before folding it for launch.', 'https://www.nasa.gov/wp-content/uploads/2021/12/mars_pathfinder_2_lander_preparations_about_to_be_folded_up_oct_2_1996-1.jpg', 'https://science.nasa.gov/mission/mars-pathfinder/', 'Photograph', 'NASA/JPL-Caltech').media,
        primary.media,
    ]),
    withSojournerGallery(image('sojourner-1-4', 'Pathfinder lander instruments', 'A diagram identifies the instruments and hardware on Sojourner’s partner lander.', 'https://www.nasa.gov/wp-content/uploads/2021/12/mars_pathfinder_4_instruments.jpg', 'https://www.jpl.nasa.gov/news/new-nasa-orbiter-sees-details-of-1997-pathfinder-site/', 'Illustration · not a photograph'), primary => [
        primary.media,
        image('sojourner-pathfinder-concept', 'Mars Pathfinder and Sojourner', 'An artist’s concept shows the lander and its rover on Mars.', 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/2023/09/p/a/pathfinder-concept_1280.jpg?w=1280&h=1183&fit=clip&crop=faces%2Cfocalpoint', 'https://science.nasa.gov/mission/mars-pathfinder/', 'Illustration · not a photograph', 'NASA/JPL-Caltech').media,
    ]),
  ],
  [
    withSojournerGallery(image('sojourner-2-1', 'Pathfinder launch', 'A launch photograph accompanies the December 1996 departure for Mars.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwwj5fQV2mtqpmrb7TZZkv03e46qKVZVUfUlV31loxae2xDtV5y_JEzAet&s=10', 'https://science.nasa.gov/mission/mars-pathfinder/', 'Photograph', 'Image link supplied in the Sojourner PDF'), primary => [
        { type: 'youtube', url: 'https://youtu.be/1rVH0YlcKyY?si=iquQEK07lQkRjIAc', videoId: '1rVH0YlcKyY', label: 'JPL and the Space Age: The Pathfinders' },
        primary.media,
    ]),
    withSojournerGallery(image('sojourner-2-2', 'Pathfinder entry, descent and landing', 'The supplied sequence diagrams the airbag landing described in this section.', 'https://www.nasa.gov/wp-content/uploads/2021/12/mars_pathfinder_5_edl_sequence_of_events.png', 'https://science.nasa.gov/mission/mars-pathfinder/', 'Illustration · not a photograph'), primary => [
        primary.media,
        { type: 'youtube', url: 'https://youtu.be/JXZa8cmab1g?si=yb9fYvEUk_fk7tPo', videoId: 'JXZa8cmab1g', label: 'NASA at Mars: 20 years of 24/7 exploration' },
        image('sojourner-landing-reference', 'Mars Pathfinder landing reference', 'The supplied image accompanies Pathfinder’s airbag landing.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFgAK8ChQCBW6Qthzo0dN8RScN5-47-c6ofJfFqaoFXs3XPMQ7QKPITkcu&s=10', 'https://science.nasa.gov/mission/mars-pathfinder/', 'Illustration · not a photograph', 'Supplied image').media,
    ]),
    withSojournerGallery(image('sojourner-2-3', 'Pathfinder opened on Mars', 'The supplied mission image shows Pathfinder deployed with its petals open.', 'https://www.nasa.gov/wp-content/uploads/2021/12/mars_pathfinder_7_pathfinder_and_sojourner_on_mars.jpg', 'https://science.nasa.gov/mission/mars-pathfinder/'), primary => [
        image('sojourner-lander-site-orbit', 'Pathfinder landing site from orbit', 'Mars Global Surveyor imaged the landing area after the mission.', 'https://www.nasa.gov/wp-content/uploads/2021/12/mars_pathfinder_6_lander_site_from_mgs_apr_1998.jpg', 'https://science.nasa.gov/mission/mars-pathfinder/', 'Photograph', 'NASA/JPL-Caltech').media,
        primary.media,
    ]),
    image('sojourner-2-4', 'First wheels on Mars panorama', 'The supplied Pathfinder panorama documents the surface setting for Sojourner\'s deployment.', 'https://www.nasa.gov/wp-content/uploads/2021/12/mars_pathfinder_9_panorama_large.jpg', 'https://www.nasa.gov/image-article/nasas-first-rover-red-planet/'),
  ],
  [
    { ...source('The Messages that Broke', '', 'https://science.nasa.gov/mission/mars-pathfinder/'), gallery: [] },
    withSojournerGallery(image('sojourner-3-2', 'Sojourner using APXS on Yogi', 'The supplied mission photograph shows the rover examining Yogi with its science instrument.', 'https://www.nasa.gov/wp-content/uploads/2021/12/mars_pathfinder_11_sojourner_apxs_on_yogi_rock_1997.jpg', 'https://science.nasa.gov/mission/mars-pathfinder/'), primary => [
        image('sojourner-rock-reference', 'Sojourner at a Martian rock', 'A supplied image accompanies the rover’s examination of Martian rocks.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxYgE_J9eMY2LT0gQdgF4LJ7lhicB47XFOi3mnvRIO_Q&s=10', 'https://science.nasa.gov/mission/mars-pathfinder/', 'Photograph', 'Supplied image').media,
        primary.media,
    ]),
    { ...sojournerWaterEvidence[0], gallery: sojournerWaterEvidence.map(item => item.media) },
    image('sojourner-3-4', 'Pathfinder surface view', 'The rocky landing site provides context for the soil investigation.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjoKiF6NDVVHYTx9wQN9rpeSWz6CfUNMYmmKDAd6qO7g&s=10', 'https://www.jpl.nasa.gov/news/new-nasa-orbiter-sees-details-of-1997-pathfinder-site/', 'Photograph', 'Image link supplied in the Sojourner PDF'),
  ],
  [
    image('sojourner-seven-days-became-eighty-three', 'Mission duration report', 'The abstract records the seven-day primary mission and 83 sols of rover operations.', '/images/sojourner-evidence/seven-days-became-eighty-three.png', 'https://science.nasa.gov/solar-system/mars-pathfinder-winds-down-after-phenomenal-mission/', 'Illustration · not a photograph', 'Image supplied for this section'),
    image('sojourner-4-2', 'Mars Exploration Rover twins', 'The supplied image shows Spirit and Opportunity, the rover generation that followed Sojourner.', 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/resources/detail_files/2/22356_MER_twins_white_cyc-web.jpg?w=1600&h=891&fit=clip&crop=faces%2Cfocalpoint', 'https://science.nasa.gov/mission/mer-spirit/'),
    image('sojourner-my-last-message-home', 'Pathfinder’s final contact', 'The highlighted passage records final contact on September 27, 1997.', '/images/sojourner-evidence/my-last-message-home.png', 'https://science.nasa.gov/solar-system/mars-pathfinder-winds-down-after-phenomenal-mission/', 'Illustration · not a photograph', 'Image supplied for this section'),
    { ...source('The Long Goodbye', '', 'https://science.nasa.gov/solar-system/mars-pathfinder-winds-down-after-phenomenal-mission/'), gallery: [] },
  ],
]

const opportunity: readonly MarsSegmentEvidence[][] = [
  [
    image('opportunity-1-1', 'Meet Opportunity', 'An illustration of the Mars Exploration Rover design used by Opportunity.', 'https://d2pn8kiwq2w21t.cloudfront.net/original_images/missionswebmer_cMTGwaG.jpg', 'https://science.nasa.gov/mission/mer-opportunity/','Illustration · not a photograph'),
    image('opportunity-1-2', 'Opportunity during assembly', 'The supplied JPL evidence shows the rover, its wheels and robotic arm during assembly.', 'https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA04418.jpg', 'https://www.jpl.nasa.gov/images/pia04418-rover-2-assembly/'),
    source('Opportunity science objective', 'The supplied mission record describes the search for evidence of past liquid water.', 'https://science.nasa.gov/mission/mer-opportunity/'),
    image('opportunity-1-4', 'Spirit and Opportunity', 'The supplied image represents the twin-rover mission described in this section.', 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/internal_resources/477.jpeg?w=1400&h=1021&fit=clip&crop=faces%2Cfocalpoint', 'https://science.nasa.gov/resource/opportunity-nasa-rover-completes-mars-mission/'),
  ],
  [
    image('opportunity-2-1', 'Opportunity launch', 'The supplied NASA launch image accompanies Opportunity\'s July 2003 departure for Mars.', 'https://www.nasa.gov/wp-content/uploads/2023/03/03pp2099.jpg', 'https://science.nasa.gov/mission/mer-opportunity/'),
    image('opportunity-2-2', 'Curiosity’s sky-crane landing concept', 'This illustration shows Curiosity’s landing system. Opportunity landed in Eagle Crater using airbags.', 'https://science.nasa.gov/wp-content/uploads/2024/08/pia14839-artists-concept-of-mars-curiosity-sky-crane.jpg?resize=2000,1125', 'https://science.nasa.gov/planetary-science/programs/mars-exploration/mission-timeline/how-we-land-on-mars/', 'Illustration · not a photograph'),
    image('opportunity-2-3', 'Opportunity marathon traverse', 'The supplied traverse map documents the long route from Eagle Crater toward Endeavour.', 'https://d2pn8kiwq2w21t.cloudfront.net/images/jpegPIA19154.width-1600.jpg', 'https://www.jpl.nasa.gov/images/pia19154-opportunity-rovers-full-marathon-length-traverse/', 'Illustration · not a photograph'),
    image('opportunity-2-4', 'Perseverance Valley panorama', 'The supplied final panorama shows Opportunity\'s last exploration area on Endeavour Crater\'s rim.', 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/2023/09/p/i/a/-/PIA-22908-LegacyPan-ANNOTATED-NASA.jpg?w=2048&h=457&fit=clip&crop=faces%2Cfocalpoint', 'https://solarsystem.nasa.gov/resources/2303/opportunity-rovers-final-mars-images/'),
  ],
  [
    image('opportunity-3-1', 'Martian blueberries', 'The supplied close-up shows the hematite-rich concretions nicknamed blueberries.', 'https://d2pn8kiwq2w21t.cloudfront.net/images/jpegPIA19113.width-1280.jpg', 'https://www.jpl.nasa.gov/images/pia19113-martian-concretions-near-fram-crater/'),
    image('opportunity-3-2', 'Heat Shield Rock meteorite', 'The supplied NASA image documents the iron-nickel meteorite found near Opportunity\'s heat shield.', 'https://www.nasa.gov/wp-content/uploads/2023/03/107041main_image_feature_257_ajhfull.jpg', 'https://science.nasa.gov/mission/mer-opportunity/'),
    image('opportunity-3-3', 'Opportunity trapped in Purgatory Dune', 'The supplied mission image shows the wheel tracks and sand trap from the 2005 incident.', 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/resources/detail_files/5874_Sol456_to_464_Rub_al_Khali-PIA07216-full2.jpg?w=396&h=279&fit=clip&crop=faces%2Cfocalpoint', 'https://science.nasa.gov/missions/mer/six-things-to-know-about-nasas-opportunity-rover/'),
    source('Endeavour water evidence', 'The supplied Opportunity mission record covers the gypsum veins and clay minerals described in this section.', 'https://science.nasa.gov/mission/mer-opportunity/'),
  ],
  [
    image('opportunity-4-1', 'Shadow of a Martian robot', 'The supplied image accompanies the contrast between a 90-sol plan and almost 15 years of work.', 'https://assets.science.nasa.gov/content/dam/science/cds/apod/apod/2019/february/marsshadow_opportunity_1024.jpg?w=1024&h=1024&fit=crop&crop=faces%2Cfocalpoint', 'https://science.nasa.gov/image-article/apod-2019-february-17-shadow-of-a-martian-robot/'),
    image('opportunity-4-2', 'Opportunity\'s final transmission', 'The supplied incomplete Sun-filter image was transmitted during the 2018 dust storm.', 'https://d2pn8kiwq2w21t.cloudfront.net/images/jpegPIA22929.width-1024.jpg', 'https://www.jpl.nasa.gov/images/pia22929-opportunitys-last-message/'),
    source('Opportunity mission completion', 'The supplied NASA record documents the recovery campaign and the February 2019 mission-complete announcement.', 'https://science.nasa.gov/resource/opportunity-nasa-rover-completes-mars-mission/'),
    image('opportunity-4-4', 'Off-world driving distance record', 'The supplied NASA graphic compares total off-world driving distance after Perseverance passed Opportunity\'s record.', 'https://assets.science.nasa.gov/dynamicimage/assets/science/missions/mars2020/2026/JPL_DrivingDistanceRecord_GraphicRecreation_August2026_v3.png?w=1152&h=2048&fit=clip&crop=faces%2Cfocalpoint', 'https://science.nasa.gov/blogs/perseverance-mars-rover/2026/10/12/nasas-perseverance-sets-offworld-record-for-total-distance-driven/', 'Illustration · not a photograph'),
  ],
]

const viking: readonly MarsSegmentEvidence[][] = [
  [
    image('viking-1-1', 'Viking 1 on Mars', 'The supplied NASA mission image introduces the stationary Viking 1 lander.', 'https://assets.science.nasa.gov/dynamicimage/assets/science/missions/viking/viking-%E2%80%94-50-years-on-mars-poster/Viking_50_Desktop_Background_1920x1080.jpg?w=900&h=900&fit=crop&crop=faces%2Cfocalpoint', 'https://science.nasa.gov/mission/viking-1/', 'Illustration · not a photograph'),
    image('viking-1-2', 'First close surface view', 'The supplied Viking 1 image shows rocks, soil and a lander footpad from its fixed landing site.', 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/resources/detail_files/2/2305_Mars-Viking1-Lander-1st-Image-PIA00381-full2.jpg?w=1439&h=512&fit=clip&crop=faces%2Cfocalpoint', 'https://science.nasa.gov/mission/viking-1/'),
    image('viking-1-3', 'Viking orbiter partner', 'The supplied NASA image represents the orbital partner described in this section.', 'https://science.nasa.gov/wp-content/uploads/2024/03/261003main-02-viking1-full.jpg?resize=900,675', 'https://nssdc.gsfc.nasa.gov/planetary/viking.html', 'Illustration · not a photograph', 'NASA'),
  ],
  [
    image('viking-2-1', 'Viking 1 launch', 'The supplied launch photograph accompanies the August 20, 1975 departure.', 'https://www.nasa.gov/wp-content/uploads/2025/08/4940404265-47186ca7a3-o.jpg', 'https://science.nasa.gov/mission/viking-1/'),
    source('Viking landing-site selection', 'The supplied NASA mission history explains why the planned July 4 landing was delayed for a safer site.', 'https://science.nasa.gov/mission/viking-1/'),
    { ...source('Viking 1 touchdown film', 'NASA’s mission film accompanies the July 20, 1976 landing story.', 'https://science.nasa.gov/mission/viking-1/'), video: 'https://science.nasa.gov/wp-content/uploads/2024/07/jpl-19760131-vikings-0001-src001968-viking-mission-to-mars-trimmed.mp4' },
    image('viking-2-4', 'Viking 1 soil trench', 'A later sampling trench shows the work Viking 1 went on to do after landing.', 'https://www.nasa.gov/wp-content/uploads/2021/07/viking_1_10_trench_color.png', 'https://science.nasa.gov/mission/viking-1/'),
  ],
  [
    image('viking-3-1', 'Viking 1 color surface image', 'The supplied color image shows the rocky Chryse Planitia surface explored from the lander\'s fixed position.', 'https://assets.science.nasa.gov/content/dam/science/psd/mars/downloadable_items/3/4/34282_Mars-Viking1-Lander-Color-Image-PIA00563.jpg', 'https://science.nasa.gov/mission/viking-1/'),
    source('Viking biology laboratory', 'The supplied NASA mission record describes the sampling arm and three onboard biology experiments.', 'https://science.nasa.gov/mission/viking-1/'),
    source('Viking soil experiment results', 'The supplied NASA mission record documents the unresolved experiment results without claiming proof of life.', 'https://science.nasa.gov/mission/viking-1/'),
    image('viking-3-4', 'Viking weather evidence', 'The supplied visual accompanies the story of Viking 1’s temperature, pressure and wind measurements.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbp5weV5BXfsKkJMRp7I3GJ0e5v10n7s2MmUnKCY2Y-A&s=10', 'https://science.nasa.gov/mission/viking-1/', 'Photograph', 'Image link supplied in the Viking 1 PDF'),
  ],
  [
    image('viking-4-1', 'Thomas A. Mutch', 'The supplied portrait identifies the imaging-team leader honored by the memorial station name.', 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Thomas_Mutch%2C_1976.jpg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original', 'https://science.nasa.gov/mission/viking-1/', 'Photograph', 'Wikimedia Commons'),
    source('Viking 1 extended mission', 'The supplied NASA mission history documents more than six years of surface operations.', 'https://science.nasa.gov/mission/viking-1/'),
    image('viking-4-3', 'Phobos photographed by Viking 1 Orbiter', 'The supplied orbiter mosaic accompanies the separate ending of Viking 1\'s orbital partner.', 'https://www.nasa.gov/wp-content/uploads/2021/07/viking_1_14_orbiter_phobos_mosaic_1978.jpg', 'https://science.nasa.gov/mission/viking-1/'),
    source('Viking 1 final transmission', 'The supplied NASA mission record covers the November 1982 communications loss and recovery attempts.', 'https://science.nasa.gov/mission/viking-1/'),
  ],
]

const ingenuity: readonly MarsSegmentEvidence[][] = [
  [
    image('ingenuity-1-1', 'Ingenuity on Mars', 'The supplied Perseverance image introduces the small helicopter on the Martian surface.', 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/downloadable_items/4/5/45954_PIA24581.jpg?w=1578&h=1176&fit=clip&crop=faces%2Cfocalpoint'),
    image('ingenuity-1-2', 'Anatomy of Ingenuity', 'The supplied NASA diagram identifies the helicopter\'s rotors, solar panel, batteries and landing legs.', 'https://science.nasa.gov/wp-content/uploads/2024/03/anatomy-of-ingenuity-mars-helicopter.jpg?resize=1536,1033', undefined, 'Illustration · not a photograph'),
    image('ingenuity-1-3', 'Ingenuity technology demonstration', 'The supplied mission image accompanies the goal of proving powered flight in the thin Martian atmosphere.', 'https://images-assets.nasa.gov/image/PIA24466/PIA24466~large.jpg?w=1920&h=1627&fit=clip&crop=faces%2Cfocalpoint'),
    image('ingenuity-1-4', 'Ingenuity carried by Perseverance', 'The supplied image shows the helicopter attached beneath its rover partner.', 'https://images-assets.nasa.gov/image/PIA23962/PIA23962~large.jpg?w=1920&h=1126&fit=clip&crop=faces%2Cfocalpoint'),
  ],
  [
    image('ingenuity-2-1', 'Mars 2020 launch', 'The supplied launch photograph shows the Atlas V carrying Perseverance and Ingenuity.', 'https://images-assets.nasa.gov/image/KSC-20200730-PH-AWG06_0018/KSC-20200730-PH-AWG06_0018~large.jpg?w=1920&h=1277&fit=clip&crop=faces%2Cfocalpoint'),
    image('ingenuity-2-2', 'Perseverance touchdown', 'The supplied high-resolution landing still accompanies arrival in Jezero Crater.', 'https://science.nasa.gov/wp-content/uploads/2024/08/45686-1-pia24428-high-resolution-still-image-of-perseverances-landing.jpg?resize=2000,1500'),
    image('ingenuity-2-3', 'Ingenuity deployment', 'The supplied deployment animation shows the helicopter being placed on Martian soil.', 'https://assets.science.nasa.gov/content/dam/science/psd/mars/resources/detail_files/2/5/25792_PIA24548-1200.gif', undefined, 'Video frame · actual mission footage'),
    image('ingenuity-2-4', 'Ingenuity\'s first flight', 'The supplied navigation-camera frame documents the first powered flight on another world.', 'https://www.nasa.gov/wp-content/uploads/2021/04/ncam_flight10000000.pbin_.jpeg'),
  ],
  [
    image('ingenuity-3-1', 'Ingenuity during the dusty season', 'The supplied mission image accompanies the low-power winter communications event.', 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/resources/detail_files/2/6/26778_PIA25322-web.jpg?w=960&h=540&fit=clip&crop=faces%2Cfocalpoint'),
    image('ingenuity-3-2', 'Flight 6 navigation challenge', 'The supplied mission image accompanies the flight affected by a navigation-camera timing glitch.', 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/images/mepjpl/PIA24600-16x9-1.jpg?w=1200&h=675&fit=clip&crop=faces%2Cfocalpoint'),
    image('ingenuity-3-3', 'Raised Ridges from above', 'The supplied Flight 9 image shows terrain observed from Ingenuity\'s aerial perspective.', 'https://www.nasa.gov/wp-content/uploads/2021/07/e2-pia24727-ingenuity-spots-raised-ridges-during-ninth-flight.jpg'),
    image('ingenuity-3-4', 'Ingenuity by the numbers', 'The supplied NASA poster summarizes 72 flights, distance and flight time.', 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/resources/detail_files/2/7/27896_ingenuity_numbers1.24_0R1-web.jpg?w=1200&h=675&fit=clip&crop=faces%2Cfocalpoint', undefined, 'Illustration · not a photograph'),
  ],
  [
    image('ingenuity-4-1', 'Ingenuity after Flight 72', 'The supplied final-flight evidence shows the helicopter after its hard landing.', 'https://d2pn8kiwq2w21t.cloudfront.net/images/jpegPIA26482.width-1600.jpg'),
    image('ingenuity-4-2', 'Damaged rotor-blade shadow', 'The supplied image shows the shadow evidence used to assess blade damage.', 'https://d2pn8kiwq2w21t.cloudfront.net/images/e1-PIA26243-Ingenuity_Spots_the_Shadow_of_its.width-1600.jpg'),
    image('ingenuity-4-3', 'Skyfall helicopter concept', 'The supplied artist concept shows the future helicopter generation discussed in this section.', 'https://d2pn8kiwq2w21t.cloudfront.net/images/PIA26760.width-1600.jpg', undefined, 'Illustration · not a photograph'),
    source('I Opened the Sky', 'A summary of Ingenuity’s achievements and legacy.', 'https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/'),
  ],
]

function ingenuityGallery(chapter: number, segment: number): DocumentaryGalleryItem[] | undefined {
  const items = ingenuityEvidence[`${chapter + 1}-${segment + 1}`]
  return items?.map((item): DocumentaryGalleryItem => {
    if ('type' in item) return item
    return { ...item, kind: item.kind ?? 'Photograph', originalUrl: item.src, srcSet: '', ...usage }
  })
}

export const marsSegmentEvidence: Record<MarsStoryId, readonly MarsSegmentEvidence[][]> = {
  sojourner, opportunity, 'viking-1': viking, ingenuity,
}

export const marsStoryMedia = Object.fromEntries(
  Object.values(marsSegmentEvidence).flat(2).flatMap(record => record.media ? [[record.media.id, record.media]] : []),
) as Record<string, StoryEvidenceMedia>

export function marsEvidenceFor(id: MarsStoryId, chapter: number, segment: number) {
  const record = marsSegmentEvidence[id][chapter][segment]
  const gallery = id === 'ingenuity' ? ingenuityGallery(chapter, segment) : undefined
  if (!gallery) return record
  const media = gallery.find((item): item is StoryEvidenceMedia => 'src' in item)
  return { ...record, gallery, media }
}

export const marsHeroMedia: Record<MarsStoryId, string> = {
  sojourner: 'sojourner-1-1', opportunity: 'opportunity-1-2', 'viking-1': 'viking-1-1', ingenuity: 'ingenuity-1-1',
}

/** Compatibility helper for callers that need an image id; source-only steps return the mission hero. */
export function marsMediaId(id: MarsStoryId, chapter: number, segment: number) {
  return marsEvidenceFor(id, chapter, segment).media?.id ?? marsHeroMedia[id]
}
