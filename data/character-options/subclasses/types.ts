/**
 * D&D 5e Subclass Type Definitions
 */

export interface SubclassFeature {
  level: number
  name: string
  description: string
}

export interface Subclass {
  id: string
  name: string
  className: string
  description: string
  features: SubclassFeature[]
  source: 'SRD' | 'PHB' | 'custom'
}
