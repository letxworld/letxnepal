/**
 * Seed data: destinations, trails, adventures, and regions.
 *
 * COORDINATES ARE APPROXIMATE and intended for map placement and distance
 * estimation only. They are not survey-grade and must not be used for navigation.
 * Before launch each coordinate should be verified against an authoritative
 * source; the `verified` flag exists so that can be tracked.
 *
 * Selection policy: every province is represented, and the set is deliberately
 * weighted towards remote and under-visited places rather than the classic
 * Pokhara/Kathmandu/Annapurna circuit. That weighting is the product's mission.
 */

import {
  type AccessLevel,
  type Difficulty,
  type Remoteness,
  type VisitationLevel,
} from "@/lib/nepal";

export type SeedDestination = {
  slug: string;
  name: string;
  nepaliName: string;
  province: string;
  district: string;
  latitude: number;
  longitude: number;
  elevationM: number;
  remoteness: Remoteness;
  accessLevel: AccessLevel;
  visitationLevel: VisitationLevel;
  hiddenGem: boolean;
  permitRequired: boolean;
  bestSeason: string[];
  nearestSettlement: string;
  localCommunity: string;
  localHouseholdsSupported: number;
  whyHidden: string;
  summary: string;
  howToGetThere: string;
  coordinatesVerified: boolean;
  imageQuery: string;
};

export const DESTINATIONS: SeedDestination[] = [
  // ---------------------------------------------------------------- Gandaki
  {
    slug: "pokhara",
    name: "Pokhara",
    nepaliName: "पोखरा",
    province: "GANDAKI",
    district: "KASKI",
    latitude: 28.2096,
    longitude: 83.9856,
    elevationM: 822,
    remoteness: "easy",
    accessLevel: "road",
    visitationLevel: "iconic",
    hiddenGem: false,
    permitRequired: false,
    bestSeason: ["Sep", "Oct", "Nov", "Mar", "Apr"],
    nearestSettlement: "Pokhara city",
    localCommunity: " Lakeside and Old Town business associations",
    localHouseholdsSupported: 0,
    whyHidden:
      "Not hidden. Listed as the reference point against which the rest of this catalogue is measured.",
    summary:
      "Gateway to the Annapurna circuit, set on Phewa Tal with the Machhapuchhre range as backdrop. The transport and booking hub for the whole western region.",
    howToGetThere:
      "Six to seven hours by tourist bus from Kathmandu, or a 25-minute flight. The bus station and the lakeside are both walkable.",
    coordinatesVerified: true,
    imageQuery: "pokhara phewa lake annapurna panorama",
  },
  {
    slug: "mustang-lo manthang",
    name: "Lo Manthang, Upper Mustang",
    nepaliName: "लोमान्थाङ, मुस्ताङ",
    province: "GANDAKI",
    district: "MUSTANG",
    latitude: 29.1829,
    longitude: 83.956,
    elevationM: 3810,
    remoteness: "very_remote",
    accessLevel: "jeep",
    visitationLevel: "established",
    hiddenGem: false,
    permitRequired: true,
    bestSeason: ["May", "Jun", "Sep", "Oct"],
    nearestSettlement: "Jomsom",
    localCommunity: "Lo Manthang village development committee",
    localHouseholdsSupported: 700,
    whyHidden:
      "Restricted-area permit cost and the long approach keep numbers low relative to its significance.",
    summary:
      "Walled medieval capital of the former Kingdom of Lo. Monastic gompas, cave systems and a landscape that reads as high-altitude desert.",
    howToGetThere:
      "Fly Kathmandu to Jomsom (weather permitting), then a two-day jeep or trek approach along the Kali Gandaki. Permit arranged before travel.",
    coordinatesVerified: true,
    imageQuery: "lo manthang mustang monastery",
  },
  {
    slug: "tsum-valley",
    name: "Tsum Valley",
    nepaliName: "त्सुम उपत्यका",
    province: "GANDAKI",
    district: "GISSING",
    latitude: 28.55,
    longitude: 84.65,
    elevationM: 2600,
    remoteness: "very_remote",
    accessLevel: "trail",
    visitationLevel: "hidden",
    hiddenGem: true,
    permitRequired: true,
    bestSeason: ["Mar", "Apr", "Oct", "Nov"],
    nearestSettlement: "Arughat",
    localCommunity: "Tsum valley village committees",
    localHouseholdsSupported: 900,
    whyHidden:
      "Opened to trekkers only in 2008, reached by a long approach, and deliberately managed to protect its pilgrimage culture.",
    summary:
      "A secluded Himalayan valley of monasteries, mani walls and Milarepa meditation caves, with a distinct Tibetan Buddhist culture that predates the border.",
    howToGetThere:
      "Drive Kathmandu to Arughat (about seven hours), then a four to five day walk up the valley. Restricted permit required.",
    coordinatesVerified: false,
    imageQuery: "tsum valley nepal monastery",
  },
  {
    slug: "nar-phu",
    name: "Nar and Phu valleys",
    nepaliName: "नार र फु उपत्यका",
    province: "GANDAKI",
    district: "MANANG",
    latitude: 28.72,
    longitude: 84.25,
    elevationM: 4200,
    remoteness: "very_remote",
    accessLevel: "trail",
    visitationLevel: "hidden",
    hiddenGem: true,
    permitRequired: true,
    bestSeason: ["Sep", "Oct", "Nov"],
    nearestSettlement: "Koto",
    localCommunity: "Nar and Phu village development committees",
    localHouseholdsSupported: 350,
    whyHidden:
      "The least-visited section of the Annapurna circuit, bypassed by the main trail across the Thorong La.",
    summary:
      "Two parallel, nearly uninhabited valleys of eroded canyons, kyaker gompas and winter snow leopard habitat, directly under the Annapurna massif.",
    howToGetThere:
      "From Koto on the Annapurna Circuit trail, branch north for two to three days. Timing must allow for a restricted-area permit.",
    coordinatesVerified: false,
    imageQuery: "nar phu valley annapurna",
  },
  {
    slug: "madi-valley",
    name: "Madi Valley",
    nepaliName: "माडी उपत्यका",
    province: "GANDAKI",
    district: "KASKI",
    latitude: 28.3,
    longitude: 84.05,
    elevationM: 1800,
    remoteness: "moderate",
    accessLevel: "trail",
    visitationLevel: "hidden",
    hiddenGem: true,
    permitRequired: false,
    bestSeason: ["Oct", "Nov", "Mar", "Apr"],
    nearestSettlement: "Hemja",
    localCommunity: "Madi rural municipality homestay network",
    localHouseholdsSupported: 220,
    whyHidden:
      "Twenty minutes from Pokhara and almost entirely missed by visitors who stay on the lakeside.",
    summary:
      "A terraced farming valley of Gurung villages and community homestays, with a ridge walk giving a full Annapurna panorama without the crowds of Sarangkot.",
    howToGetThere:
      "Local bus or taxi from Pokhara to Hemja, then a two to three hour walk. Homestay bookings are arranged through the community network.",
    coordinatesVerified: false,
    imageQuery: "madi valley pokhara terraced fields",
  },

  // ---------------------------------------------------------------- Bagmati
  {
    slug: "kathmandu-valley",
    name: "Kathmandu Valley",
    nepaliName: "काठमाडौँ उपत्यका",
    province: "BAGMATI",
    district: "KATHMANDU",
    latitude: 27.7172,
    longitude: 85.324,
    elevationM: 1400,
    remoteness: "easy",
    accessLevel: "road",
    visitationLevel: "iconic",
    hiddenGem: false,
    permitRequired: false,
    bestSeason: ["Sep", "Oct", "Nov", "Feb", "Mar"],
    nearestSettlement: "Kathmandu",
    localCommunity: " Kathmandu Metropolitan City heritage wing",
    localHouseholdsSupported: 0,
    whyHidden:
      "Not hidden. Included because any national platform has to represent the capital honestly.",
    summary:
      "Three former royal cities holding seven UNESCO World Heritage monuments, living craft quarters, and the administrative centre of Nepali tourism.",
    howToGetThere:
      "Tribhuvan International Airport is in the valley. All domestic tourist buses radiate from Kathmandu.",
    coordinatesVerified: true,
    imageQuery: "kathmandu durbar square temple",
  },
  {
    slug: "rasuwa-gatlang",
    name: "Gatlang, Rasuwa",
    nepaliName: "गात्लाङ, रसुवा",
    province: "BAGMATI",
    district: "RASUWA",
    latitude: 28.15,
    longitude: 85.45,
    elevationM: 2200,
    remoteness: "moderate",
    accessLevel: "jeep",
    visitationLevel: "hidden",
    hiddenGem: true,
    permitRequired: false,
    bestSeason: ["Mar", "Apr", "Oct", "Nov"],
    nearestSettlement: "Syabrubesi",
    localCommunity: "Gatlang community homestay association",
    localHouseholdsSupported: 180,
    whyHidden:
      "Travellers drive through it on the way to Langtang and rarely stop overnight.",
    summary:
      "A Tamang hill settlement on the old Langtang trade route, with a chorten-lined ridge, millet terraces and views into Langtang Lirung.",
    howToGetThere:
      "From Kathmandu, take the road towards Syabrubesi (about six to seven hours) and stop at Gatlang before the trailhead.",
    coordinatesVerified: false,
    imageQuery: "gatlang rasuwa tamang village",
  },
  {
    slug: "dolakha-chankheli",
    name: "Chankheli, Dolakha",
    nepaliName: "चङ्खेली, दोलखा",
    province: "BAGMATI",
    district: "DOLAKHA",
    latitude: 27.85,
    longitude: 86.25,
    elevationM: 2700,
    remoteness: "remote",
    accessLevel: "trail",
    visitationLevel: "hidden",
    hiddenGem: true,
    permitRequired: false,
    bestSeason: ["Apr", "May", "Oct"],
    nearestSettlement: "Bedding",
    localCommunity: "Chankheli rural municipality",
    localHouseholdsSupported: 150,
    whyHidden:
      "A Khaling and Sherpa ridge area outside the Everest and Rolwaling corridors, with no organised tourism infrastructure.",
    summary:
      "High pasture country between the Rolwaling and Everest regions, known for medicinal plant collection, Gaurishankar views and a working forest commons.",
    howToGetThere:
      "Drive to Bedding from Kathmandu, then a two-day walk. There is no lodge circuit, so camping or homestay arrangements are needed.",
    coordinatesVerified: false,
    imageQuery: "dolakha nepal himalayan pasture",
  },

  // ------------------------------------------------------------- Lumbini
  {
    slug: "lumbini",
    name: "Lumbini",
    nepaliName: "लुम्बिनी",
    province: "LUMBINI",
    district: "RUPANDEHI",
    latitude: 27.4844,
    longitude: 83.2797,
    elevationM: 150,
    remoteness: "easy",
    accessLevel: "road",
    visitationLevel: "iconic",
    hiddenGem: false,
    permitRequired: false,
    bestSeason: ["Nov", "Dec", "Jan", "Feb"],
    nearestSettlement: "Bhairahawa",
    localCommunity: "Lumbini Development Trust",
    localHouseholdsSupported: 0,
    whyHidden:
      "Not hidden, and not remote. Included because it is one of the two anchor sites every visitor itinerary includes.",
    summary:
      "The birthplace of Siddhartha Gautama, with the Mayadevi temple, the Ashokan pillar and an international monastic zone built by Buddhist communities worldwide.",
    howToGetThere:
      "Bhairahawa airport has daily flights from Kathmandu; Lumbini is a short drive south of the airport.",
    coordinatesVerified: true,
    imageQuery: "lumbini mayadevi temple nepal",
  },
  {
    slug: "tansen-palpa",
    name: "Tansen, Palpa",
    nepaliName: "तानसेन, पाल्पा",
    province: "LUMBINI",
    district: "PALPA",
    latitude: 27.8675,
    longitude: 83.5486,
    elevationM: 1370,
    remoteness: "moderate",
    accessLevel: "road",
    visitationLevel: "emerging",
    hiddenGem: true,
    permitRequired: false,
    bestSeason: ["Oct", "Nov", "Feb", "Mar", "Apr"],
    nearestSettlement: "Tansen bazaar",
    localCommunity: "Tansen municipality heritage committee",
    localHouseholdsSupported: 260,
    whyHidden:
      "A Newar hill town of courtyards and metalwork that most visitors bypass on the Butwal road.",
    summary:
      "A preserved Newar merchant town on a ridgeline between the plains and the hills, with a palace museum, a working metalcraft tradition and views over the Kali Gandaki and Annapurna.",
    howToGetThere:
      "From Butwal, a winding hill road climbs to Tansen in about two hours. Buses run from Pokhara and Butwal.",
    coordinatesVerified: true,
    imageQuery: "tansen palpa nepal hill town",
  },
  {
    slug: "rolpa-thabang",
    name: "Thabang, Rolpa",
    nepaliName: "थबाङ, रोल्पा",
    province: "LUMBINI",
    district: "ROLPA",
    latitude: 28.45,
    longitude: 82.55,
    elevationM: 2200,
    remoteness: "remote",
    accessLevel: "jeep",
    visitationLevel: "hidden",
    hiddenGem: true,
    permitRequired: false,
    bestSeason: ["Mar", "Apr", "Oct", "Nov"],
    nearestSettlement: "Rolpa headquarters, Liwang",
    localCommunity: "Thabang rural municipality",
    localHouseholdsSupported: 300,
    whyHidden:
      "Poor road access and two decades of absence from the tourism map have left it off every international itinerary.",
    summary:
      "A Kham Magar hill centre in the Middle Hills, known for winter buckwheat harvests, a surviving forest commons and a two-day ridge walk to Libang.",
    howToGetThere:
      "From Kathmandu or Pokhara, drive to Liwang, then a rough road or a three to four day trek to Thabang.",
    coordinatesVerified: false,
    imageQuery: "rolpa nepal mid-hills terraces",
  },
  {
    slug: "rara-tal",
    name: "Rara Lake",
    nepaliName: "रारा ताल",
    province: "KARNALI",
    district: "MUGU",
    latitude: 29.5,
    longitude: 82.1,
    elevationM: 2990,
    remoteness: "very_remote",
    accessLevel: "trail",
    visitationLevel: "hidden",
    hiddenGem: true,
    permitRequired: false,
    bestSeason: ["Apr", "May", "Sep", "Oct"],
    nearestSettlement: "Gamgadhi",
    localCommunity: "Rara Buffer Zone management committee",
    localHouseholdsSupported: 400,
    whyHidden:
      "Nepal's largest lake, and most Nepalis have never been there. It takes days to reach.",
    summary:
      "A 10.8 square kilometre alpine lake inside Rara National Park, reflecting the 7,642 metre Saipal massif, with a shoreline of pine and rhododendron.",
    howToGetThere:
      "Fly Nepalgunj to Talcha or Jumla, then a two to three day walk. No road reaches the lake.",
    coordinatesVerified: true,
    imageQuery: "rara lake mugu nepal",
  },
  {
    slug: "shey-phoksundo",
    name: "Shey Phoksundo Lake",
    nepaliName: "शे फोक्सुण्डो ताल",
    province: "KARNALI",
    district: "DOLPA",
    latitude: 29.25,
    longitude: 82.85,
    elevationM: 3660,
    remoteness: "very_remote",
    accessLevel: "flight",
    visitationLevel: "established",
    hiddenGem: false,
    permitRequired: true,
    bestSeason: ["Jun", "Jul", "Aug", "Sep"],
    nearestSettlement: "Ringmo",
    localCommunity: "Phoksundo Buffer Zone committee",
    localHouseholdsSupported: 500,
    whyHidden:
      "Known among trekkers but protected by cost and distance: a restricted permit and a flight to reach it.",
    summary:
      "Nepal's deepest lake, an impossibly turquoise body below the Kanjiroba Himal, in Nepal's only trans-Himalayan national park, with Ringmo's Bon monastery on a spur.",
    howToGetThere:
      "Fly Nepalgunj to Juphal, then a two-day walk to the lake. Restricted-area permit for Upper Dolpo is required.",
    coordinatesVerified: true,
    imageQuery: "shey phoksundo lake dolpa",
  },
  {
    slug: "humla-jumla",
    name: "Jumla and the Karnali corridor",
    nepaliName: "जुम्ला र कर्णाली गलिच्छा",
    province: "KARNALI",
    district: "JUMLA",
    latitude: 29.28,
    longitude: 82.18,
    elevationM: 2300,
    remoteness: "very_remote",
    accessLevel: "flight",
    visitationLevel: "hidden",
    hiddenGem: true,
    permitRequired: false,
    bestSeason: ["Apr", "May", "Sep", "Oct"],
    nearestSettlement: "Jumla bazaar",
    localCommunity: "Jumla municipality and Chandannath temple trust",
    localHouseholdsSupported: 700,
    whyHidden:
      "The administrative centre of Nepal's largest and poorest province, with no road to the outside world until recently.",
    summary:
      "The ridgetop capital of Karnali, a medieval trade-route town with a 14th century Chandannath temple, apple orchards, and a working finger-millet economy.",
    howToGetThere:
      "Fly Nepalgunj to Jumla (about 35 minutes) or Surkhet to Jumla overland on a rough road. Road links to the south are improving but slow.",
    coordinatesVerified: false,
    imageQuery: "jumla karnali nepal",
  },

  // ---------------------------------------------------------- Sudurpashchim
  {
    slug: "khaptad-national-park",
    name: "Khaptad National Park",
    nepaliName: "खप्तड राष्ट्रिय निकुञ्ज",
    province: "SUDURPASHCHIM",
    district: "BAJURA",
    latitude: 29.45,
    longitude: 81.05,
    elevationM: 3000,
    remoteness: "very_remote",
    accessLevel: "trail",
    visitationLevel: "hidden",
    hiddenGem: true,
    permitRequired: false,
    bestSeason: ["Mar", "Apr", "Oct"],
    nearestSettlement: "Chainpur",
    localCommunity: "Khaptad Buffer Zone user committees",
    localHouseholdsSupported: 260,
    whyHidden:
      "A high-altitude meadow landscape of religious significance that sees a handful of foreign visitors a year.",
    summary:
      "Rolling alpine meadows and oak forest at 3,000 metres, with Khaptad Baba's hermitage, seasonal wildflower displays and a panorama from Saipal to Rara.",
    howToGetThere:
      "Fly or drive to Chainpur in Bajura, then a two to three day walk. No motorable road reaches the park boundary.",
    coordinatesVerified: false,
    imageQuery: "khaptad national park nepal meadow",
  },
  {
    slug: "api-himal",
    name: "Api Himal, Darchula",
    nepaliName: "अपि हिमाल, दार्चुला",
    province: "SUDURPASHCHIM",
    district: "DARCHULA",
    latitude: 29.85,
    longitude: 80.75,
    elevationM: 3700,
    remoteness: "very_remote",
    accessLevel: "trail",
    visitationLevel: "hidden",
    hiddenGem: true,
    permitRequired: true,
    bestSeason: ["Apr", "May", "Oct"],
    nearestSettlement: " Khalanga, Darchula headquarters",
    localCommunity: "Darchula Api Nampa conservation area committee",
    localHouseholdsSupported: 320,
    whyHidden:
      "The westernmost trekking region in Nepal, first opened to groups only in 2002, and still without lodge infrastructure.",
    summary:
      "The Api Nampa Conservation Area, where the 7,132 metre Api peak rises above Byans and Darchula, with a mix of Khas and Byansi culture and high pasture camps.",
    howToGetThere:
      "Drive Kathmandu to Dhangadhi, then north to Khalanga, then a four to five day walk. Conservation-area permit required.",
    coordinatesVerified: false,
    imageQuery: "api himal darchula nepal",
  },
  {
    slug: "shuklaphanta",
    name: "Shuklaphanta National Park",
    nepaliName: "शुक्लाफाँटा राष्ट्रिय निकुञ्ज",
    province: "SUDURPASHCHIM",
    district: "KANCHANPUR",
    latitude: 28.85,
    longitude: 80.25,
    elevationM: 180,
    remoteness: "moderate",
    accessLevel: "road",
    visitationLevel: "emerging",
    hiddenGem: true,
    permitRequired: false,
    bestSeason: ["Jan", "Feb", "Mar", "Dec"],
    nearestSettlement: "Bhimdatta (Mahendranagar)",
    localCommunity: "Shuklaphanta Buffer Zone user committee",
    localHouseholdsSupported: 380,
    whyHidden:
      "Nepal's best grassland wildlife viewing, eclipsed by Chitwan two hundred kilometres east.",
    summary:
    "The largest continuous grassland in Nepal, holding the world's largest swamp deer herd, Bengal florican, and elephant and tiger. A Mahakali river boundary with India.",
    howToGetThere:
      "Drive or fly to Bhimdatta, then a short drive to the park gate. Jeep safaris and walking safaris are arranged at the gate.",
    coordinatesVerified: false,
    imageQuery: "shuklaphanta grassland nepal deer",
  },

  // ------------------------------------------------------------------ Karnali extra
  {
    slug: "mugu-khalanga",
    name: "Khalanga and Pulu, Mugu",
    nepaliName: "खलाङ्गा र पुलु, मुगु",
    province: "KARNALI",
    district: "MUGU",
    latitude: 29.65,
    longitude: 82.35,
    elevationM: 2850,
    remoteness: "very_remote",
    accessLevel: "jeep",
    visitationLevel: "hidden",
    hiddenGem: true,
    permitRequired: false,
    bestSeason: ["Apr", "May", "Sep", "Oct"],
    nearestSettlement: "Gamgadhi",
    localCommunity: "Mugu district homestay network",
    localHouseholdsSupported: 240,
    whyHidden:
      "Mugu is Nepal's least-connected district outside Dolpa, and its ridge settlements are on almost no itinerary.",
    summary:
      "A high Himalayan border district of Tibetan Buddhist gompas, transhumance herding and the northern shore of Rara, with a road only recently reaching the headquarters.",
    howToGetThere:
      "Fly Nepalgunj to Talcha, or take the new road from Surkhet to Gamgadhi, then local transport. Expect a long day.",
    coordinatesVerified: false,
    imageQuery: "mugu nepal himalayan village",
  },

  // --------------------------------------------------------------------- Koshi
  {
    slug: "ilam",
    name: "Ilam",
    nepaliName: "इलाम",
    province: "KOSHI",
    district: "ILAM",
    latitude: 26.91,
    longitude: 87.92,
    elevationM: 1300,
    remoteness: "moderate",
    accessLevel: "road",
    visitationLevel: "emerging",
    hiddenGem: true,
    permitRequired: false,
    bestSeason: ["Sep", "Oct", "Nov", "Mar", "Apr"],
    nearestSettlement: "Ilam bazaar",
    localCommunity: "Ilam tea garden cooperatives",
    localHouseholdsSupported: 500,
    whyHidden:
      "Nepal's tea capital, better known to domestic tourists than to foreign visitors.",
    summary:
      "Rolling tea estates on the West Bengal border, the 1,167 step Antu Danda viewpoint, and a mixed Limbu, Rai and Brahmin hill culture.",
    howToGetThere:
      "About ten hours by bus from Kathmandu, or fly to Bhadrapur and drive two hours uphill.",
    coordinatesVerified: true,
    imageQuery: "ilam tea garden nepal",
  },
  {
    slug: "sankhuwasabha-makalu",
    name: "Makalu Base Camp, Sankhuwasabha",
    nepaliName: "मकालु बेसक्याम्प, सङ्खुवासभा",
    province: "KOSHI",
    district: "SANKHUWASABHA",
    latitude: 27.75,
    longitude: 87.3,
    elevationM: 4800,
    remoteness: "very_remote",
    accessLevel: "trail",
    visitationLevel: "hidden",
    hiddenGem: true,
    permitRequired: true,
    bestSeason: ["Apr", "May", "Oct", "Nov"],
    nearestSettlement: "Num",
    localCommunity: "Makalu Barun National Park buffer zone committees",
    localHouseholdsSupported: 600,
    whyHidden:
      "The fifth highest mountain on earth, and its base camp trek is a two-week commitment that almost nobody makes.",
    summary:
      "A two-week walk into the Makalu Barun National Park, from subtropical forest to a base camp beneath the 8,485 metre south face, with a recorded 3,000 plant species.",
    howToGetThere:
      "Fly Kathmandu to Tumlingtar, then a road and a three-day walk to Num. Conservation-area permit required.",
    coordinatesVerified: false,
    imageQuery: "makalu base camp nepal",
  },
  {
    slug: "solukhumbu-everest",
    name: "Solukhumbu and Namche",
    nepaliName: "सोलुखुम्बु र नाम्चे",
    province: "KOSHI",
    district: "SOLUKHUMBU",
    latitude: 27.8,
    longitude: 86.7,
    elevationM: 3440,
    remoteness: "remote",
    accessLevel: "flight",
    visitationLevel: "iconic",
    hiddenGem: false,
    permitRequired: true,
    bestSeason: ["Mar", "Apr", "Oct", "Nov"],
    nearestSettlement: "Namche Bazaar",
    localCommunity: "Khumbu Pasang Lhamu rural municipality",
    localHouseholdsSupported: 1200,
    whyHidden:
      "Not hidden. Included as the reference standard for what a fully developed destination looks like, and for contrast with the hidden gems.",
    summary:
      "Sherpa heartland and the gateway to Everest, with the weekly Namche market, the Tengboche monastery, and the Sagarmatha National Park visitor system.",
    howToGetThere:
      "Fly Lukla from Kathmandu (weather dependent) and walk two days to Namche, or take the newer road to Salleri.",
    coordinatesVerified: true,
    imageQuery: "namche bazaar everest nepal",
  },

  // ------------------------------------------------------------------ Madhesh
  {
    slug: "janakpur",
    name: "Janakpur",
    nepaliName: "जनकपुर",
    province: "MADHESH",
    district: "DHANUSA",
    latitude: 26.7272,
    longitude: 85.9167,
    elevationM: 70,
    remoteness: "easy",
    accessLevel: "road",
    visitationLevel: "established",
    hiddenGem: false,
    permitRequired: false,
    bestSeason: ["Nov", "Dec", "Jan", "Feb", "Mar"],
    nearestSettlement: "Janakpur city",
    localCommunity: "Janakpur Sub-Metropolitan heritage committee",
    localHouseholdsSupported: 0,
    whyHidden:
      "Not hidden. Included because Madhesh is under-represented in every hill-focused tourism product.",
    summary:
      "The city of Sita's birth in the Mithila region, with the Janaki temple, a living Maithili painting tradition, and the festival of Vivah Panchami.",
    howToGetThere:
      "About eight hours by bus from Kathmandu, or fly to Janakpur airport from Kathmandu.",
    coordinatesVerified: true,
    imageQuery: "janakpur janaki temple nepal",
  },
  {
    slug: "chitwan",
    name: "Chitwan National Park",
    nepaliName: "चितवन राष्ट्रिय निकुञ्ज",
    province: "BAGMATI",
    district: "CHITWAN",
    latitude: 27.5291,
    longitude: 84.3542,
    elevationM: 150,
    remoteness: "easy",
    accessLevel: "road",
    visitationLevel: "iconic",
    hiddenGem: false,
    permitRequired: false,
    bestSeason: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    nearestSettlement: "Sauraha",
    localCommunity: "Chitwan National Park buffer zone user committees",
    localHouseholdsSupported: 0,
    whyHidden:
      "Not hidden. Included as the reference for wildlife tourism and because it is a booking anchor.",
    summary:
      "Nepal's first national park, a UNESCO site holding Bengal tiger, one-horned rhinoceros and gharial, with Tharu cultural programmes in the buffer zone.",
    howToGetThere:
      "About five hours by bus from Kathmandu or Pokhara to Sauraha. Safaris are booked at the park gate or through lodges.",
    coordinatesVerified: true,
    imageQuery: "chitwan rhino nepal",
  },
];

export type SeedTrail = {
  slug: string;
  name: string;
  district: string;
  province: string;
  difficulty: Difficulty;
  distanceKm: number;
  durationDays: number;
  highestPointM: number;
  remote: boolean;
  summary: string;
};

export const TRAILS: SeedTrail[] = [
  {
    slug: "annapurna-base-camp",
    name: "Annapurna Base Camp",
    district: "KASKI",
    province: "GANDAKI",
    difficulty: "moderate",
    distanceKm: 115,
    durationDays: 12,
    highestPointM: 4130,
    remote: false,
    summary:
      "The classic amphitheatre approach through rhododendron forest and Gurung villages to the foot of Annapurna I.",
  },
  {
    slug: "tsum-valley-trek",
    name: "Tsum Valley Trek",
    district: "GISSING",
    province: "GANDAKI",
    difficulty: "hard",
    distanceKm: 160,
    durationDays: 18,
    highestPointM: 4100,
    remote: true,
    summary:
      "A long approach and high passes make this one of the least-travelled permitted treks in Nepal.",
  },
  {
    slug: "makalu-base-camp-trek",
    name: "Makalu Base Camp Trek",
    district: "SANKHUWASABHA",
    province: "KOSHI",
    difficulty: "expert",
    distanceKm: 210,
    durationDays: 20,
    highestPointM: 4800,
    remote: true,
    summary:
      "Two weeks of continuously varied terrain, from 300 metres to the base of the world's fifth highest peak.",
  },
  {
    slug: "khaptad-trek",
    name: "Khaptad Ridge Trek",
    district: "BAJURA",
    province: "SUDURPASHCHIM",
    difficulty: "hard",
    distanceKm: 90,
    durationDays: 8,
    highestPointM: 3300,
    remote: true,
    summary:
      "Meadow ridges in Nepal's far west, with a hermitage tradition and no lodge infrastructure.",
  },
  {
    slug: "rara-circuit",
    name: "Rara Lake Circuit",
    district: "MUGU",
    province: "KARNALI",
    difficulty: "moderate",
    distanceKm: 80,
    durationDays: 7,
    highestPointM: 3500,
    remote: true,
    summary:
      "A high trail around Nepal's largest lake, with a pass viewpoint over Saipal and the western Karnali Himal.",
  },
];

export type SeedAdventure = {
  slug: string;
  name: string;
  district: string;
  province: string;
  type: string;
  summary: string;
};

export const ADVENTURES: SeedAdventure[] = [
  {
    slug: "paragliding-pokhara",
    name: "Paragliding over Phewa Tal",
    district: "KASKI",
    province: "GANDAKI",
    type: "air",
    summary: "Tandem flights from Sarangkot with a lake landing, running most of the dry season.",
  },
  {
    slug: "bungee-kushma",
    name: "Bungee jump, Kushma",
    district: "PARBAT",
    province: "GANDAKI",
    type: "adrenaline",
    summary: "A 228 metre drop over the Modi gorge, claimed as the world's second highest commercial bungee.",
  },
  {
    slug: "rafting-seti",
    name: "Seti River rafting",
    district: "KASKI",
    province: "GANDAKI",
    type: "water",
    summary: "Grade two to three water within an hour of Pokhara, suitable for first-timers.",
  },
  {
    slug: "jungle-safari-chitwan",
    name: "Chitwan jungle and canoe safari",
    district: "CHITWAN",
    province: "BAGMATI",
    type: "wildlife",
    summary: "Canoe and walking safari in the grassland for rhinoceros, gharial and Bengal florican.",
  },
  {
    slug: "rock-climbing-pokhara",
    name: "Rock climbing at Peace Stupa crag",
    district: "KASKI",
    province: "GANDAKI",
    type: "climbing",
    summary: "Limestone sport routes above the lake, with local guiding services.",
  },
  {
    slug: "mountain-biking-mustang",
    name: "Mustang mountain biking",
    district: "MUSTANG",
    province: "GANDAKI",
    type: "cycling",
    summary: "High desert singletrack between Jomsom and Lo Manthang, above 3,000 metres for a week.",
  },
];

/** The four homepage rails required by the mission. */
export const HOME_SECTIONS = [
  {
    key: "popular",
    title: "Popular destinations",
    nepaliTitle: "लोकप्रिय गन्तव्य",
    description: "The places Nepal is already known for.",
    filter: { visitationLevel: ["iconic", "established"] },
  },
  {
    key: "hidden",
    title: "Hidden gems",
    nepaliTitle: "लुकेका रत्न",
    description: "Remote, under-visited places worth the effort.",
    filter: { hiddenGem: true },
  },
  {
    key: "adventures",
    title: "Adventures",
    nepaliTitle: "साहसिक क्रियाकलाप",
    description: "Ways to move through the country.",
    filter: {},
  },
  {
    key: "trails",
    title: "Popular trails",
    nepaliTitle: "लोकप्रिय ट्रेक",
    description: "Routes that reward multi-day walking.",
    filter: { remote: true },
  },
] as const;

export type HomeSectionKey = (typeof HOME_SECTIONS)[number]["key"];

export function destinationsBySection(key: HomeSectionKey): SeedDestination[] {
  switch (key) {
    case "popular":
      return DESTINATIONS.filter((d) => d.visitationLevel === "iconic" || d.visitationLevel === "established");
    case "hidden":
      return DESTINATIONS.filter((d) => d.hiddenGem);
    case "adventures":
      return DESTINATIONS.filter((d) => d.accessLevel === "trail" || d.remoteness === "very_remote");
    case "trails":
      return DESTINATIONS.filter((d) => d.remoteness === "very_remote" || d.remoteness === "remote");
    default:
      return [];
  }
}
