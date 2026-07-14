function RecetteItem({ recette, onDelete, peutSupprimer }) {
  return (
    <li>
      <h3>{recette.titre}</h3>
      <p>Temps de préparation : {recette.tempsPreparation} min</p>
      <ul>
        {recette.ingredients.map((ingredient) => (
          <li key={ingredient}>{ingredient}</li>
        ))}
      </ul>
      {peutSupprimer && (
        <button type="button" onClick={() => onDelete(recette.id)}>
          Supprimer
        </button>
      )}
    </li>
  )
}

export default RecetteItem
