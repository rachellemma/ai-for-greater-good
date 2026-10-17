export type EntityType = 'crop' | 'animal' | 'pest' | 'disease' | 'symptom' | 'practice'

export interface Entity {
  id: string
  label: string
  type: EntityType
  aliases: string[]
}

export interface Relation {
  from: string
  rel: 'affected_by' | 'shows' | 'spread_by' | 'prevented_by' | 'controlled_by'
  to: string
  docId: string
}

export const entities: Entity[] = [
  { id: 'maize', label: 'Maize', type: 'crop', aliases: ['chimanga', 'corn'] },
  { id: 'groundnut', label: 'Groundnut', type: 'crop', aliases: ['mtedza', 'peanut'] },
  { id: 'cassava', label: 'Cassava', type: 'crop', aliases: ['chinangwa'] },
  { id: 'chicken', label: 'Village chicken', type: 'animal', aliases: ['nkhuku', 'poultry', 'hen'] },
  { id: 'faw', label: 'Fall armyworm', type: 'pest', aliases: ['mbozi', 'armyworm', 'caterpillar'] },
  { id: 'rosette', label: 'Groundnut rosette', type: 'disease', aliases: ['rosette'] },
  { id: 'cmd', label: 'Cassava mosaic disease', type: 'disease', aliases: ['mosaic'] },
  { id: 'ncd', label: 'Newcastle disease', type: 'disease', aliases: ['newcastle', 'chitopa'] },
  { id: 'aflatoxin', label: 'Aflatoxin (mould)', type: 'disease', aliases: ['mould', 'mold'] },
  { id: 'holes-leaves', label: 'Ragged holes in young leaves', type: 'symptom', aliases: [] },
  { id: 'frass', label: 'Sawdust-like droppings in whorl', type: 'symptom', aliases: [] },
  { id: 'stunted-yellow', label: 'Stunted, yellow bunched leaves', type: 'symptom', aliases: [] },
  { id: 'mosaic-leaves', label: 'Yellow-green mosaic leaves', type: 'symptom', aliases: [] },
  { id: 'twisted-neck', label: 'Twisted neck, green droppings', type: 'symptom', aliases: [] },
  { id: 'aphids', label: 'Aphids', type: 'pest', aliases: ['nsabwe'] },
  { id: 'whitefly', label: 'Whitefly', type: 'pest', aliases: [] },
  { id: 'scouting', label: 'Weekly scouting (50 plants)', type: 'practice', aliases: [] },
  { id: 'ash-whorl', label: 'Sand/ash in whorl', type: 'practice', aliases: [] },
  { id: 'early-planting', label: 'Plant with first good rains', type: 'practice', aliases: [] },
  { id: 'intercrop', label: 'Intercrop with legumes', type: 'practice', aliases: [] },
  { id: 'dense-stand', label: 'Close, even spacing', type: 'practice', aliases: [] },
  { id: 'roguing', label: 'Pull out infected plants', type: 'practice', aliases: [] },
  { id: 'clean-cuttings', label: 'Clean cuttings only', type: 'practice', aliases: [] },
  { id: 'vaccination', label: 'Flock vaccination (via vaccinator)', type: 'practice', aliases: [] },
  { id: 'isolate', label: 'Isolate sick birds', type: 'practice', aliases: [] },
  { id: 'dry-sort', label: 'Dry well & sort mouldy grain', type: 'practice', aliases: [] },
  { id: 'hermetic', label: 'Hermetic storage bags', type: 'practice', aliases: [] },
]

export const relations: Relation[] = [
  { from: 'maize', rel: 'affected_by', to: 'faw', docId: 'KB-MZ-FAW' },
  { from: 'faw', rel: 'shows', to: 'holes-leaves', docId: 'KB-MZ-FAW' },
  { from: 'faw', rel: 'shows', to: 'frass', docId: 'KB-MZ-FAW' },
  { from: 'faw', rel: 'controlled_by', to: 'scouting', docId: 'KB-MZ-FAW' },
  { from: 'faw', rel: 'controlled_by', to: 'ash-whorl', docId: 'KB-MZ-FAW' },
  { from: 'faw', rel: 'prevented_by', to: 'early-planting', docId: 'KB-MZ-FAW' },
  { from: 'faw', rel: 'prevented_by', to: 'intercrop', docId: 'KB-MZ-FAW' },
  { from: 'groundnut', rel: 'affected_by', to: 'rosette', docId: 'KB-GN-ROSETTE' },
  { from: 'rosette', rel: 'shows', to: 'stunted-yellow', docId: 'KB-GN-ROSETTE' },
  { from: 'rosette', rel: 'spread_by', to: 'aphids', docId: 'KB-GN-ROSETTE' },
  { from: 'rosette', rel: 'prevented_by', to: 'early-planting', docId: 'KB-GN-ROSETTE' },
  { from: 'rosette', rel: 'prevented_by', to: 'dense-stand', docId: 'KB-GN-ROSETTE' },
  { from: 'rosette', rel: 'controlled_by', to: 'roguing', docId: 'KB-GN-ROSETTE' },
  { from: 'cassava', rel: 'affected_by', to: 'cmd', docId: 'KB-CS-CMD' },
  { from: 'cmd', rel: 'shows', to: 'mosaic-leaves', docId: 'KB-CS-CMD' },
  { from: 'cmd', rel: 'spread_by', to: 'whitefly', docId: 'KB-CS-CMD' },
  { from: 'cmd', rel: 'prevented_by', to: 'clean-cuttings', docId: 'KB-CS-CMD' },
  { from: 'cmd', rel: 'controlled_by', to: 'roguing', docId: 'KB-CS-CMD' },
  { from: 'chicken', rel: 'affected_by', to: 'ncd', docId: 'KB-LV-NCD' },
  { from: 'ncd', rel: 'shows', to: 'twisted-neck', docId: 'KB-LV-NCD' },
  { from: 'ncd', rel: 'prevented_by', to: 'vaccination', docId: 'KB-LV-NCD' },
  { from: 'ncd', rel: 'controlled_by', to: 'isolate', docId: 'KB-LV-NCD' },
  { from: 'maize', rel: 'affected_by', to: 'aflatoxin', docId: 'KB-PH-STORE' },
  { from: 'groundnut', rel: 'affected_by', to: 'aflatoxin', docId: 'KB-PH-STORE' },
  { from: 'aflatoxin', rel: 'prevented_by', to: 'dry-sort', docId: 'KB-PH-STORE' },
  { from: 'aflatoxin', rel: 'prevented_by', to: 'hermetic', docId: 'KB-PH-STORE' },
]

const byId = new Map(entities.map((e) => [e.id, e]))

export function findEntity(term: string): Entity | undefined {
  const t = term.trim().toLowerCase()
  return entities.find(
    (e) =>
      e.id === t ||
      e.label.toLowerCase() === t ||
      e.label.toLowerCase().includes(t) ||
      e.aliases.some((a) => a === t),
  )
}

export interface GraphFact {
  subject: string
  relation: string
  object: string
  docId: string
}

/** Returns one-hop and two-hop facts around an entity, each tied to its source doc. */
export function neighbourhood(entityId: string, depth = 2): GraphFact[] {
  const seen = new Set<string>()
  const facts: GraphFact[] = []
  let frontier = [entityId]
  for (let d = 0; d < depth; d++) {
    const next: string[] = []
    for (const id of frontier) {
      for (const r of relations) {
        if (r.from !== id && r.to !== id) continue
        const key = `${r.from}-${r.rel}-${r.to}`
        if (seen.has(key)) continue
        seen.add(key)
        facts.push({
          subject: byId.get(r.from)?.label ?? r.from,
          relation: r.rel.replace('_', ' '),
          object: byId.get(r.to)?.label ?? r.to,
          docId: r.docId,
        })
        next.push(r.from === id ? r.to : r.from)
      }
    }
    frontier = next
  }
  return facts
}
