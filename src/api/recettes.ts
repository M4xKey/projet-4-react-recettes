import { z } from 'zod'
import { RecetteSchema } from '../schemas/recette'
import type { NouvelleRecette, Recette } from '../types'

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/recettes`

// Erreur dédiée pour repérer un 401 (token expiré) dans le onError des mutations,
// sans avoir à parser le message ou le status ailleurs.
export class SessionExpireeError extends Error {
  constructor() {
    super('Session expirée, reconnecte-toi.')
    this.name = 'SessionExpireeError'
  }
}

// Erreur dédiée pour le cas où la réponse de l'API ne correspond pas au schéma
// attendu (même modèle que SessionExpireeError) : les composants reçoivent un
// message clair plutôt qu'une ZodError brute, dont le format n'est pas fait
// pour être affiché tel quel à un utilisateur.
export class ReponseInvalideError extends Error {
  constructor() {
    super("La réponse de l'API ne correspond pas au format attendu.")
    this.name = 'ReponseInvalideError'
  }
}

export function fetchRecettes(): Promise<Recette[]> {
  return fetch(API_URL)
    .then((res) => {
      if (!res.ok) {
        throw new Error('Impossible de charger les recettes.')
      }
      return res.json()
    })
    .then((donneesBrutes) => {
      // On valide la donnée brute (issue de res.json(), typée `any`) avant
      // qu'elle ne circule ailleurs dans l'app : c'est exactement ce
      // parsing qui aurait détecté le bug user_id/userId au runtime, avant
      // même d'arriver jusqu'à RecetteList.
      const resultat = z.array(RecetteSchema).safeParse(donneesBrutes)
      if (!resultat.success) {
        throw new ReponseInvalideError()
      }
      return resultat.data
    })
}

export function creerRecette(nouvelleRecette: NouvelleRecette, token: string | null): Promise<Recette> {
  return fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(nouvelleRecette),
  })
    .then((res) => {
      if (res.status === 401) {
        throw new SessionExpireeError()
      }
      if (!res.ok) {
        throw new Error("Impossible d'ajouter la recette.")
      }
      return res.json()
    })
    .then((donneesBrutes) => {
      const resultat = RecetteSchema.safeParse(donneesBrutes)
      if (!resultat.success) {
        throw new ReponseInvalideError()
      }
      return resultat.data
    })
}

export function supprimerRecette(id: number, token: string | null): Promise<void> {
  return fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => {
    if (res.status === 401) {
      throw new SessionExpireeError()
    }
    if (!res.ok) {
      throw new Error('Impossible de supprimer la recette.')
    }
  })
}
