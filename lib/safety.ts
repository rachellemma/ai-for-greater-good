export type RiskCategory = 'pesticide-dosage' | 'veterinary-drug' | 'human-health' | null

interface RiskRule {
  category: Exclude<RiskCategory, null>
  pattern: RegExp
}

const rules: RiskRule[] = [
  {
    category: 'pesticide-dosage',
    pattern:
      /\b(how much|how many|dose|dosage|ml|millilit|litre|liter|grams?|kg|mix|mixing|concentration|per (knapsack|tank|litre|liter|hectare|acre)|zingati|kuchuluka)\b.*\b(pesticide|insecticide|herbicide|fungicide|spray|chemical|poison|mankhwala|emamectin|cypermethrin|lambda|chlorpyrifos|glyphosate|mancozeb|ampligo|belt)\b|\b(pesticide|insecticide|herbicide|fungicide|spray|chemical|mankhwala|emamectin|cypermethrin|lambda|chlorpyrifos|glyphosate|mancozeb)\b.*\b(how much|dose|dosage|ml|litre|liter|grams?|mix|zingati|kuchuluka)\b/i,
  },
  {
    category: 'veterinary-drug',
    pattern:
      /\b(antibiotic|oxytetracycline|tetracycline|ivermectin|dewormer|deworm|injection|inject|jakisoni|tablet|vet(erinary)? (drug|medicine)|vaccine dose|how much (medicine|vaccine))\b/i,
  },
  {
    category: 'human-health',
    pattern: /\b(swallowed|drank|poisoned|ingested|in (my|his|her|the child'?s?) eyes?|anamwa|wamwa)\b/i,
  },
]

export interface RiskAssessment {
  highStakes: boolean
  category: RiskCategory
  reason: string | null
}

/**
 * Deterministic pre-screen. Runs before the model so high-stakes questions
 * are always escalated, regardless of what the model decides.
 */
export function assessRisk(text: string): RiskAssessment {
  for (const rule of rules) {
    if (rule.pattern.test(text)) {
      return {
        highStakes: true,
        category: rule.category,
        reason: `Matched high-stakes rule: ${rule.category}`,
      }
    }
  }
  return { highStakes: false, category: null, reason: null }
}
