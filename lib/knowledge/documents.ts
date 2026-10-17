export type ValidationStatus = 'validated' | 'pending'

export interface KnowledgeDocument {
  id: string
  title: string
  topic: 'crops' | 'livestock' | 'soil' | 'post-harvest' | 'safety'
  region: string
  source: string
  validatedBy: string
  validatedOn: string
  status: ValidationStatus
  tags: string[]
  body: string
}

/**
 * Seed knowledge base. Each entry is a placeholder for a locally verified
 * extension leaflet. Replace `source` / `validatedBy` with your real partner
 * organisation and reviewing officer before deployment. Only documents with
 * status "validated" are ever retrieved by the agent.
 */
export const documents: KnowledgeDocument[] = [
  {
    id: 'KB-MZ-FAW',
    title: 'Fall armyworm in maize: scouting and non-chemical control',
    topic: 'crops',
    region: 'Malawi (all districts)',
    source: 'Seed extension leaflet — replace with local DAES/partner leaflet',
    validatedBy: 'Demo reviewer (replace with extension officer)',
    validatedOn: '2026-03-02',
    status: 'validated',
    tags: ['maize', 'fall armyworm', 'pest', 'whorl', 'caterpillar'],
    body: `Fall armyworm caterpillars feed inside the maize whorl. Signs: ragged holes and "windowpane" patches on young leaves, and wet sawdust-like droppings (frass) in the funnel. The caterpillar has an upside-down Y mark on its head and four dark dots in a square near its tail.
Scout every week from emergence: check 10 plants in 5 places across the field (50 plants). Act early when many young plants show fresh damage.
Non-chemical control: crush egg masses and small caterpillars by hand; put a pinch of dry sand, soil or wood ash into the whorl of damaged plants; plant early with the first good rains so plants are older when pressure peaks; intercrop maize with beans or other legumes; keep field edges where natural enemies (ants, wasps, birds) live.
Chemical control must only follow advice from your extension officer or agro-dealer label. Never guess a dose.`,
  },
  {
    id: 'KB-MZ-PLANT',
    title: 'Maize planting: timing and spacing (one-seed-per-station)',
    topic: 'crops',
    region: 'Malawi (all districts)',
    source: 'Seed extension leaflet — replace with local DAES/partner leaflet',
    validatedBy: 'Demo reviewer (replace with extension officer)',
    validatedOn: '2026-02-11',
    status: 'validated',
    tags: ['maize', 'planting', 'spacing', 'rains', 'seed'],
    body: `Plant maize with the first good rains, once the soil is moist to about the depth of a hand. Planting late lowers yield and raises fall armyworm and drought risk.
Spacing: ridges about 75 cm apart, one seed per planting station, stations about 25 cm apart along the ridge. Plant 2 to 5 cm deep. This gives a dense, even stand.
Gap-fill missing stations within one week of emergence. Weed early: the first weeding within 2 to 3 weeks after emergence matters most.`,
  },
  {
    id: 'KB-GN-ROSETTE',
    title: 'Groundnut rosette disease: signs and prevention',
    topic: 'crops',
    region: 'Malawi (central & northern regions)',
    source: 'Seed extension leaflet — replace with local DAES/partner leaflet',
    validatedBy: 'Demo reviewer (replace with extension officer)',
    validatedOn: '2026-01-20',
    status: 'validated',
    tags: ['groundnut', 'rosette', 'virus', 'aphid', 'yellow leaves', 'stunted'],
    body: `Groundnut rosette is a virus carried by aphids. Signs: plants are stunted and bushy, leaves are small, bunched, and yellow or mottled green. Infected plants give few or no pods.
There is no cure once a plant is infected. Prevention: plant early with the first rains; plant closely and evenly (dense stands attract fewer aphids); use rosette-tolerant varieties recommended by your extension officer; pull out and bury infected plants early in the season.`,
  },
  {
    id: 'KB-CS-CMD',
    title: 'Cassava mosaic disease: clean cuttings and roguing',
    topic: 'crops',
    region: 'Malawi (lakeshore & southern regions)',
    source: 'Seed extension leaflet — replace with local DAES/partner leaflet',
    validatedBy: 'Demo reviewer (replace with extension officer)',
    validatedOn: '2026-02-28',
    status: 'validated',
    tags: ['cassava', 'mosaic', 'virus', 'whitefly', 'cuttings', 'yellow leaves'],
    body: `Cassava mosaic disease shows as yellow and green patches (mosaic) on leaves, with twisted or shrunken leaves and stunted plants. It spreads through infected cuttings and whiteflies.
Take cuttings only from healthy-looking plants. Pull out and destroy plants that show mosaic early, before they spread it. Ask your extension officer about tolerant varieties for your area. Do not share cuttings from sick fields.`,
  },
  {
    id: 'KB-LV-NCD',
    title: 'Newcastle disease in village chickens: signs and prevention',
    topic: 'livestock',
    region: 'Malawi (all districts)',
    source: 'Seed veterinary leaflet — replace with local DAHLD/partner leaflet',
    validatedBy: 'Demo reviewer (replace with veterinary officer)',
    validatedOn: '2026-03-15',
    status: 'validated',
    tags: ['chicken', 'poultry', 'newcastle', 'vaccine', 'sudden death', 'twisted neck'],
    body: `Newcastle disease kills many village chickens, often in the cold dry season. Signs: twisted neck, green watery droppings, gasping or noisy breathing, birds dull and not eating, many sudden deaths.
Prevention: vaccinate the whole flock regularly through your community vaccinator or veterinary assistant, who will tell you the schedule. Separate sick birds at once. Bury or burn dead birds; do not eat, sell or give away sick or dead birds. Keep new birds apart for two weeks before mixing.
Medicine and vaccine use must follow a veterinary worker's instructions.`,
  },
  {
    id: 'KB-SL-COMPOST',
    title: 'Making and using compost manure',
    topic: 'soil',
    region: 'Malawi (all districts)',
    source: 'Seed extension leaflet — replace with local DAES/partner leaflet',
    validatedBy: 'Demo reviewer (replace with extension officer)',
    validatedOn: '2026-01-08',
    status: 'validated',
    tags: ['soil', 'compost', 'manure', 'fertility', 'organic'],
    body: `Compost improves soil and helps fertilizer work better. Make a heap or pit with layers: dry plant material (maize stalks, grass), green material (fresh leaves), animal manure, and a little ash or topsoil. Keep it as moist as a squeezed cloth.
Turn the heap every 2 to 3 weeks. It is ready when dark, crumbly and no longer hot, usually after 2 to 3 months. Apply into planting stations or along ridges before planting. Rotating maize with legumes such as groundnut, soybean or pigeon pea also improves the soil.`,
  },
  {
    id: 'KB-PH-STORE',
    title: 'Safe grain storage and avoiding aflatoxin',
    topic: 'post-harvest',
    region: 'Malawi (all districts)',
    source: 'Seed extension leaflet — replace with local DAES/partner leaflet',
    validatedBy: 'Demo reviewer (replace with extension officer)',
    validatedOn: '2026-04-01',
    status: 'validated',
    tags: ['storage', 'maize', 'groundnut', 'aflatoxin', 'mould', 'weevils', 'bags'],
    body: `Dry grain well before storing: maize grain should rattle and crack cleanly when bitten. Store on a raised platform, off the floor, in a clean, dry place.
Hermetic (airtight) storage bags protect grain from weevils without chemicals when closed properly. Sort out and remove mouldy, shrivelled or discoloured grain and nuts: mould can carry aflatoxin, a poison. Do not eat or feed mouldy grain to animals.`,
  },
  {
    id: 'KB-SF-PEST',
    title: 'Pesticide handling safety (general)',
    topic: 'safety',
    region: 'Malawi (all districts)',
    source: 'Seed safety leaflet — replace with local DAES/partner leaflet',
    validatedBy: 'Demo reviewer (replace with extension officer)',
    validatedOn: '2026-03-20',
    status: 'validated',
    tags: ['pesticide', 'safety', 'spraying', 'children', 'storage'],
    body: `Only use pesticides bought from a registered agro-dealer, in the original labelled container. Ask the agro-dealer or extension officer to explain the label if you cannot read it.
Wear long sleeves, trousers, shoes and cover your face when spraying. Do not spray in wind or before rain. Never eat, drink or smoke while spraying. Wash hands and body after.
Keep pesticides locked away from children, food and water. Never put pesticides in drink bottles or food containers. Do not reuse empty containers.`,
  },
  {
    id: 'KB-MZ-STRIGA-DRAFT',
    title: 'Striga (witchweed) in maize — draft',
    topic: 'crops',
    region: 'Malawi (central region)',
    source: 'Draft — awaiting review',
    validatedBy: '—',
    validatedOn: '—',
    status: 'pending',
    tags: ['maize', 'striga', 'witchweed', 'weed'],
    body: `Draft content awaiting expert review. Not used for answers until validated.`,
  },
]

export const validatedDocuments = documents.filter((d) => d.status === 'validated')

export function getDocument(id: string) {
  return documents.find((d) => d.id === id)
}
