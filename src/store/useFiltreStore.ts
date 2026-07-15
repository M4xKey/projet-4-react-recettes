import { create } from 'zustand'

// État UI pur (pas de données serveur ici) : le texte tapé dans le champ de recherche.
// Un store Zustand plutôt qu'un useState dans App, pour que n'importe quel composant
// (ici RecetteList) puisse lire/écrire ce filtre sans passer par des props.
interface FiltreStore {
  recherche: string
  setRecherche: (recherche: string) => void
}

export const useFiltreStore = create<FiltreStore>((set) => ({
  recherche: '',
  setRecherche: (recherche) => set({ recherche }),
}))
