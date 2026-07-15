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

export function fetchRecettes(): Promise<Recette[]> {
  return fetch(API_URL).then((res) => {
    if (!res.ok) {
      throw new Error('Impossible de charger les recettes.')
    }
    return res.json()
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
  }).then((res) => {
    if (res.status === 401) {
      throw new SessionExpireeError()
    }
    if (!res.ok) {
      throw new Error("Impossible d'ajouter la recette.")
    }
    return res.json()
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
