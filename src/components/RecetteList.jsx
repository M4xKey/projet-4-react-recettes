import RecetteItem from './RecetteItem'

function RecetteList({ recettes, onDelete, currentUserId }) {
  if (recettes.length === 0) {
    return <p>Aucune recette pour le moment.</p>
  }

  return (
    <ul>
      {recettes.map((recette) => (
        <RecetteItem
          key={recette.id}
          recette={recette}
          onDelete={onDelete}
          peutSupprimer={currentUserId != null && recette.user_id === currentUserId}
        />
      ))}
    </ul>
  )
}

export default RecetteList
