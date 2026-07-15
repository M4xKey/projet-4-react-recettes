export interface Recette {
  id: number
  titre: string
  tempsPreparation: number
  ingredients: string[]
  user_id: number
}

export type NouvelleRecette = Omit<Recette, 'id' | 'user_id'>

export interface Utilisateur {
  id: number
  email: string
}
