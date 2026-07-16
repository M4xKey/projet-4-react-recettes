// Recette n'est plus définie ici : le schéma Zod (schemas/recette.ts) est la
// source de vérité unique, à la fois pour la validation runtime et pour le
// type TS (via z.infer). On l'importe pour pouvoir l'utiliser ci-dessous
// (Omit) et on la réexporte pour ne pas casser les imports existants
// (`import type { Recette } from '../types'`).
import type { Recette } from './schemas/recette'
export type { Recette } from './schemas/recette'

export type NouvelleRecette = Omit<Recette, 'id' | 'userId'>

export interface Utilisateur {
  id: number
  email: string
}
