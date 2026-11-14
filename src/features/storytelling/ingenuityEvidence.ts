import type { DocumentaryGalleryItem, StoryEvidenceMedia } from '../../components/storytelling/StoryMedia'

type EvidenceImage = Omit<StoryEvidenceMedia, 'kind' | 'originalUrl' | 'srcSet' | 'verifiedOn' | 'usagePolicyUrl' | 'usageNotes'> & {
  kind?: StoryEvidenceMedia['kind']
}
type EvidenceItem = EvidenceImage | Exclude<DocumentaryGalleryItem, StoryEvidenceMedia>

export const ingenuityEvidence: Partial<Record<string, readonly EvidenceItem[]>> = {
  "1-2": [
    {
      "id": "ingenuity-evidence-1-2-1",
      "title": "Anatomy of Ingenuity",
      "alt": "Anatomy of Ingenuity",
      "caption": "Anatomy of Ingenuity.",
      "src": "https://science.nasa.gov/wp-content/uploads/2024/03/anatomy-of-ingenuity-mars-helicopter.jpg?resize=1536,1033",
      "sourceUrl": "https://science.nasa.gov/wp-content/uploads/2024/03/anatomy-of-ingenuity-mars-helicopter.jpg?resize=1536,1033",
      "width": 1536,
      "height": 1033,
      "credit": "NASA/JPL-Caltech",
      "kind": "Illustration · not a photograph"
    },
    {
      "id": "ingenuity-evidence-1-2-2",
      "title": "Ingenuity during assembly",
      "alt": "Ingenuity during assembly",
      "caption": "Ingenuity during assembly.",
      "src": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSloJO1o7xuLjW7C3iLgboS9wXO08cQ_dQVeu-0qyAQ-2Y851JB6Z1ctyCq&s=10",
      "sourceUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSloJO1o7xuLjW7C3iLgboS9wXO08cQ_dQVeu-0qyAQ-2Y851JB6Z1ctyCq&s=10",
      "width": 738,
      "height": 415,
      "credit": "Image supplied in the Ingenuity PDF"
    },
    {
      "id": "ingenuity-evidence-1-2-3",
      "title": "Close-up of Ingenuity’s rotor assembly",
      "alt": "Close-up of Ingenuity’s rotor assembly",
      "caption": "Close-up of Ingenuity’s rotor assembly.",
      "src": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSB4xhL1jaPd2cQ0EmF3mgYUAm98CbVtV8OOiR8BfnKrMtdeowxek9WihIh&s=10",
      "sourceUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSB4xhL1jaPd2cQ0EmF3mgYUAm98CbVtV8OOiR8BfnKrMtdeowxek9WihIh&s=10",
      "width": 739,
      "height": 415,
      "credit": "Image supplied in the Ingenuity PDF"
    }
  ],
  "1-3": [
    {
      "id": "ingenuity-evidence-1-3-1",
      "title": "Ingenuity demonstrates flight on Mars",
      "alt": "Ingenuity demonstrates flight on Mars",
      "caption": "Ingenuity demonstrates flight on Mars.",
      "src": "https://www.nasa.gov/wp-content/uploads/2023/03/pia24582-nasa.gif?w=1024",
      "sourceUrl": "https://www.nasa.gov/wp-content/uploads/2023/03/pia24582-nasa.gif?w=1024",
      "width": 1024,
      "height": 576,
      "credit": "NASA/JPL-Caltech",
      "kind": "Video frame · actual mission footage"
    },
    {
      "id": "ingenuity-evidence-1-3-2",
      "title": "Artist’s concept of Ingenuity in flight",
      "alt": "Artist’s concept of Ingenuity in flight",
      "caption": "Artist’s concept of Ingenuity in flight.",
      "src": "https://images-assets.nasa.gov/image/PIA24466/PIA24466~large.jpg?w=1920&h=1627&fit=clip&crop=faces%2Cfocalpoint",
      "sourceUrl": "https://images-assets.nasa.gov/image/PIA24466/PIA24466~large.jpg?w=1920&h=1627&fit=clip&crop=faces%2Cfocalpoint",
      "width": 1920,
      "height": 1627,
      "credit": "NASA/JPL-Caltech",
      "kind": "Illustration · not a photograph"
    }
  ],
  "2-1": [
    {
      "id": "ingenuity-evidence-2-1-1",
      "title": "Atlas V launches Mars 2020",
      "alt": "Atlas V launches Mars 2020",
      "caption": "Atlas V launches Mars 2020.",
      "src": "https://images-assets.nasa.gov/image/KSC-20200730-PH-AWG06_0018/KSC-20200730-PH-AWG06_0018~large.jpg?w=1920&h=1277&fit=clip&crop=faces%2Cfocalpoint",
      "sourceUrl": "https://images-assets.nasa.gov/image/KSC-20200730-PH-AWG06_0018/KSC-20200730-PH-AWG06_0018~large.jpg?w=1920&h=1277&fit=clip&crop=faces%2Cfocalpoint",
      "width": 1920,
      "height": 1277,
      "credit": "NASA/JPL-Caltech"
    },
    {
      "id": "ingenuity-evidence-2-1-2",
      "title": "Mars 2020 launch complex",
      "alt": "Mars 2020 launch complex",
      "caption": "Mars 2020 launch complex.",
      "src": "https://www.nasa.gov/wp-content/uploads/2023/03/mars_2020_launch_0.jpg",
      "sourceUrl": "https://www.nasa.gov/wp-content/uploads/2023/03/mars_2020_launch_0.jpg",
      "width": 1041,
      "height": 586,
      "credit": "NASA/JPL-Caltech"
    },
    {
      "type": "link",
      "url": "https://assets.science.nasa.gov/content/dam/science/psd/mars/videos/2024/5964_NASAs_Perseverance_Rover_Launches_to_Mars-360-1.m4v",
      "label": "Watch the Mars 2020 launch"
    }
  ],
  "2-2": [
    {
      "id": "ingenuity-evidence-2-2-1",
      "title": "Perseverance’s entry, descent and landing sequence",
      "alt": "Perseverance’s entry, descent and landing sequence",
      "caption": "Perseverance’s entry, descent and landing sequence.",
      "src": "https://cdn.mos.cms.futurecdn.net/TKvUVjJZQRA399tRbLHj55.png",
      "sourceUrl": "https://cdn.mos.cms.futurecdn.net/TKvUVjJZQRA399tRbLHj55.png",
      "width": 5209,
      "height": 3074,
      "credit": "Supplied landing diagram",
      "kind": "Illustration · not a photograph"
    },
    {
      "id": "ingenuity-evidence-2-2-2",
      "title": "Perseverance descending under the sky crane",
      "alt": "Perseverance descending under the sky crane",
      "caption": "Perseverance descending under the sky crane.",
      "src": "https://science.nasa.gov/wp-content/uploads/2024/08/45686-1-pia24428-high-resolution-still-image-of-perseverances-landing.jpg?resize=2000,1500",
      "sourceUrl": "https://science.nasa.gov/wp-content/uploads/2024/08/45686-1-pia24428-high-resolution-still-image-of-perseverances-landing.jpg?resize=2000,1500",
      "width": 2000,
      "height": 1500,
      "credit": "NASA/JPL-Caltech",
      "kind": "Video frame · actual mission footage"
    },
    {
      "type": "youtube",
      "videoId": "4czjS9h4Fpg",
      "url": "https://youtu.be/4czjS9h4Fpg?si=p3AO-5aC7mEiY9AN",
      "label": "Perseverance’s descent and touchdown on Mars"
    }
  ],
  "2-3": [
    {
      "id": "ingenuity-evidence-2-3-1",
      "title": "Ingenuity deploys from Perseverance",
      "alt": "Ingenuity deploys from Perseverance",
      "caption": "Ingenuity deploys from Perseverance.",
      "src": "https://assets.science.nasa.gov/content/dam/science/psd/mars/resources/detail_files/2/5/25792_PIA24548-1200.gif",
      "sourceUrl": "https://assets.science.nasa.gov/content/dam/science/psd/mars/resources/detail_files/2/5/25792_PIA24548-1200.gif",
      "width": 1200,
      "height": 861,
      "credit": "NASA/JPL-Caltech",
      "kind": "Video frame · actual mission footage"
    },
    {
      "id": "ingenuity-evidence-2-3-2",
      "title": "Ingenuity standing on the Martian surface",
      "alt": "Ingenuity standing on the Martian surface",
      "caption": "Ingenuity standing on the Martian surface.",
      "src": "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/downloadable_items/4/5/45954_PIA24581.jpg?w=1578&h=1176&fit=clip&crop=faces%2Cfocalpoint",
      "sourceUrl": "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/downloadable_items/4/5/45954_PIA24581.jpg?w=1578&h=1176&fit=clip&crop=faces%2Cfocalpoint",
      "width": 1578,
      "height": 1175,
      "credit": "NASA/JPL-Caltech"
    }
  ],
  "2-4": [
    {
      "id": "ingenuity-evidence-2-4-1",
      "title": "Ingenuity’s shadow during its first flight",
      "alt": "Ingenuity’s shadow during its first flight",
      "caption": "Ingenuity’s shadow during its first flight.",
      "src": "https://www.nasa.gov/wp-content/uploads/2021/04/ncam_flight10000000.pbin_.jpeg",
      "sourceUrl": "https://www.nasa.gov/wp-content/uploads/2021/04/ncam_flight10000000.pbin_.jpeg",
      "width": 640,
      "height": 480,
      "credit": "NASA/JPL-Caltech"
    },
    {
      "type": "youtube",
      "videoId": "wMnOo2zcjXA",
      "url": "https://youtu.be/wMnOo2zcjXA?si=1g1aUhkeKiAEuJW_",
      "label": "Video of Ingenuity’s first flight"
    }
  ],
  "3-2": [
    {
      "id": "ingenuity-evidence-3-2-1",
      "title": "Terrain photographed during Flight 6",
      "alt": "Terrain photographed during Flight 6",
      "caption": "Terrain photographed during Flight 6.",
      "src": "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/images/mepjpl/PIA24600-16x9-1.jpg?w=1200&h=675&fit=clip&crop=faces%2Cfocalpoint",
      "sourceUrl": "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/images/mepjpl/PIA24600-16x9-1.jpg?w=1200&h=675&fit=clip&crop=faces%2Cfocalpoint",
      "width": 1200,
      "height": 675,
      "credit": "NASA/JPL-Caltech"
    },
    {
      "type": "video",
      "url": "https://assets.science.nasa.gov/content/dam/science/psd/mars/downloadable_items/4/6/46153_PIA24598.mp4",
      "label": "Ingenuity navigation footage from Flight 6"
    },
    {
      "id": "ingenuity-evidence-3-2-3",
      "title": "Flight 6 surface view",
      "alt": "Flight 6 surface view",
      "caption": "Flight 6 surface view.",
      "src": "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/downloadable_items/4/6/46154_PIA24599.png?w=1168&h=1200&fit=clip&crop=faces%2Cfocalpoint",
      "sourceUrl": "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/downloadable_items/4/6/46154_PIA24599.png?w=1168&h=1200&fit=clip&crop=faces%2Cfocalpoint",
      "width": 1168,
      "height": 1200,
      "credit": "NASA/JPL-Caltech"
    }
  ],
  "3-3": [
    {
      "id": "ingenuity-evidence-3-3-1",
      "title": "Flight 9 route across Séítah",
      "alt": "Flight 9 route across Séítah",
      "caption": "Flight 9 route across Séítah.",
      "src": "https://www.nasa.gov/wp-content/uploads/2021/08/pia24801-s-seitah-rte-1041.jpg",
      "sourceUrl": "https://www.nasa.gov/wp-content/uploads/2021/08/pia24801-s-seitah-rte-1041.jpg",
      "width": 1041,
      "height": 772,
      "credit": "NASA/JPL-Caltech",
      "kind": "Illustration · not a photograph"
    },
    {
      "id": "ingenuity-evidence-3-3-2",
      "title": "Raised ridges photographed from above",
      "alt": "Raised ridges photographed from above",
      "caption": "Raised ridges photographed from above.",
      "src": "https://www.nasa.gov/wp-content/uploads/2021/07/e2-pia24727-ingenuity-spots-raised-ridges-during-ninth-flight.jpg",
      "sourceUrl": "https://www.nasa.gov/wp-content/uploads/2021/07/e2-pia24727-ingenuity-spots-raised-ridges-during-ninth-flight.jpg",
      "width": 1041,
      "height": 772,
      "credit": "NASA/JPL-Caltech"
    }
  ],
  "3-4": [
    {
      "id": "ingenuity-evidence-3-4-1",
      "title": "Ingenuity by the numbers",
      "alt": "Ingenuity by the numbers",
      "caption": "Ingenuity by the numbers.",
      "src": "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/resources/detail_files/2/7/27896_ingenuity_numbers1.24_0R1-web.jpg?w=1200&h=675&fit=clip&crop=faces%2Cfocalpoint",
      "sourceUrl": "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/resources/detail_files/2/7/27896_ingenuity_numbers1.24_0R1-web.jpg?w=1200&h=675&fit=clip&crop=faces%2Cfocalpoint",
      "width": 1200,
      "height": 675,
      "credit": "NASA/JPL-Caltech",
      "kind": "Illustration · not a photograph"
    },
    {
      "id": "ingenuity-evidence-3-4-2",
      "title": "Map of the first flight zone",
      "alt": "Map of the first flight zone",
      "caption": "Map of the first flight zone.",
      "src": "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/resources/detail_files/2/5/25744_PIA24494-1200.jpg?w=1200&h=761&fit=clip&crop=faces%2Cfocalpoint",
      "sourceUrl": "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/resources/detail_files/2/5/25744_PIA24494-1200.jpg?w=1200&h=761&fit=clip&crop=faces%2Cfocalpoint",
      "width": 1200,
      "height": 761,
      "credit": "NASA/JPL-Caltech",
      "kind": "Illustration · not a photograph"
    },
    {
      "id": "ingenuity-evidence-3-4-3",
      "title": "The Ingenuity team celebrates",
      "alt": "The Ingenuity team celebrates",
      "caption": "The Ingenuity team celebrates.",
      "src": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9_STkzbWwCUhst_fVw6qErlSorz0urDAl9NvCZiCZZ1xR36p7XLVrmlE0&s=10",
      "sourceUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9_STkzbWwCUhst_fVw6qErlSorz0urDAl9NvCZiCZZ1xR36p7XLVrmlE0&s=10",
      "width": 678,
      "height": 452,
      "credit": "Image supplied in the Ingenuity PDF"
    }
  ],
  "4-1": [
    {
      "id": "ingenuity-evidence-4-1-1",
      "title": "How Ingenuity landed on Flight 72",
      "alt": "How Ingenuity landed on Flight 72",
      "caption": "How Ingenuity landed on Flight 72.",
      "src": "https://d2pn8kiwq2w21t.cloudfront.net/images/jpegPIA26482.width-1600.jpg",
      "sourceUrl": "https://d2pn8kiwq2w21t.cloudfront.net/images/jpegPIA26482.width-1600.jpg",
      "width": 1600,
      "height": 931,
      "credit": "NASA/JPL-Caltech",
      "kind": "Illustration · not a photograph"
    },
    {
      "id": "ingenuity-evidence-4-1-2",
      "title": "Sand ripples at Ingenuity’s final landing area",
      "alt": "Sand ripples at Ingenuity’s final landing area",
      "caption": "Sand ripples at Ingenuity’s final landing area.",
      "src": "https://d2pn8kiwq2w21t.cloudfront.net/images/PIA26238.width-1600.jpg",
      "sourceUrl": "https://d2pn8kiwq2w21t.cloudfront.net/images/PIA26238.width-1600.jpg",
      "width": 1600,
      "height": 495,
      "credit": "NASA/JPL-Caltech"
    }
  ],
  "4-2": [
    {
      "id": "ingenuity-evidence-4-2-1",
      "title": "Shadow of a damaged rotor blade",
      "alt": "Shadow of a damaged rotor blade",
      "caption": "Shadow of a damaged rotor blade.",
      "src": "https://d2pn8kiwq2w21t.cloudfront.net/images/e1-PIA26243-Ingenuity_Spots_the_Shadow_of_its.width-1600.jpg",
      "sourceUrl": "https://d2pn8kiwq2w21t.cloudfront.net/images/e1-PIA26243-Ingenuity_Spots_the_Shadow_of_its.width-1600.jpg",
      "width": 1600,
      "height": 1186,
      "credit": "NASA/JPL-Caltech"
    },
    {
      "id": "ingenuity-evidence-4-2-2",
      "title": "Ingenuity’s blade shadow after its final flight",
      "alt": "Ingenuity’s blade shadow after its final flight",
      "caption": "Ingenuity’s blade shadow after its final flight.",
      "src": "https://assets.science.nasa.gov/content/dam/science/psd/mars/resources/detail_files/27937_PIA26244-web.gif",
      "sourceUrl": "https://assets.science.nasa.gov/content/dam/science/psd/mars/resources/detail_files/27937_PIA26244-web.gif",
      "width": 640,
      "height": 480,
      "credit": "NASA/JPL-Caltech",
      "kind": "Video frame · actual mission footage"
    }
  ],
  "4-3": [
    {
      "id": "ingenuity-evidence-4-3-1",
      "title": "Skyfall helicopter concept",
      "alt": "Skyfall helicopter concept",
      "caption": "Skyfall helicopter concept.",
      "src": "https://d2pn8kiwq2w21t.cloudfront.net/images/PIA26760.width-1600.jpg",
      "sourceUrl": "https://d2pn8kiwq2w21t.cloudfront.net/images/PIA26760.width-1600.jpg",
      "width": 1600,
      "height": 900,
      "credit": "NASA/JPL-Caltech",
      "kind": "Illustration · not a photograph"
    },
    {
      "type": "youtube",
      "videoId": "qMbHE_VXI-8",
      "url": "https://youtu.be/qMbHE_VXI-8?si=Hqo5Qh81WmlGsGy8",
      "label": "Legacy of NASA’s Ingenuity Mars Helicopter"
    }
  ],
  "4-4": [
    {
      "id": "ingenuity-evidence-4-4-1",
      "title": "Ingenuity: Five Things to Know",
      "alt": "Ingenuity: Five Things to Know",
      "caption": "Ingenuity: Five Things to Know.",
      "src": "/images/ingenuity-opened-the-sky.png",
      "sourceUrl": "https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/",
      "width": 931,
      "height": 741,
      "credit": "Image supplied in the Ingenuity PDF",
      "kind": "Illustration · not a photograph"
    }
  ]
}
