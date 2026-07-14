import { useState } from 'react'

function RecetteForm({ onAdd }) {
  const [titre, setTitre] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [tempsPreparation, setTempsPreparation] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    onAdd({
      titre,
      ingredients: ingredients.split(',').map((i) => i.trim()).filter(Boolean),
      tempsPreparation: Number(tempsPreparation),
    })

    setTitre('')
    setIngredients('')
    setTempsPreparation('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="titre">Titre</label>
        <input
          id="titre"
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="ingredients">Ingrédients (séparés par des virgules)</label>
        <input
          id="ingredients"
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="tempsPreparation">Temps de préparation (min)</label>
        <input
          id="tempsPreparation"
          type="number"
          value={tempsPreparation}
          onChange={(e) => setTempsPreparation(e.target.value)}
          required
        />
      </div>
      <button type="submit">Ajouter</button>
    </form>
  )
}

export default RecetteForm
