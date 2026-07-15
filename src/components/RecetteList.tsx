import type { Recette } from '../types'
import RecetteItem from './RecetteItem'
import { useFiltreStore } from '../store/useFiltreStore'

interface RecetteListProps {
  recettes: Recette[]
  onDelete: (id: number) => void
  currentUserId: number | undefined
}

function RecetteList({ recettes, onDelete, currentUserId }: RecetteListProps) {
  // Selector Zustand : le composant ne re-render que si `recherche` change,
  // pas à chaque changement d'un autre champ du store.
  const recherche = useFiltreStore((state) => state.recherche)
  const setRecherche = useFiltreStore((state) => state.setRecherche)

  const recettesFiltrees = recettes.filter((recette) =>
    recette.titre.toLowerCase().includes(recherche.toLowerCase()),
  )

  return (
    <div>
      <div>
        <label htmlFor="recherche">Rechercher une recette</label>
        <input
          id="recherche"
          type="text"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Titre de la recette..."
        />
      </div>

      {recettesFiltrees.length === 0 ? (
        <p>Aucune recette ne correspond à la recherche.</p>
      ) : (
        <ul>
          {recettesFiltrees.map((recette) => (
            <RecetteItem
              key={recette.id}
              recette={recette}
              onDelete={onDelete}
              peutSupprimer={currentUserId != null && recette.user_id === currentUserId}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

export default RecetteList
