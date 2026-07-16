import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import RecetteList from './RecetteList'
import { useFiltreStore } from '../store/useFiltreStore'
import type { Recette } from '../types'

// Props fixes passées directement au composant : pas besoin de MSW ni de
// QueryClient ici, RecetteList ne fait aucun appel réseau lui-même.
const recettes: Recette[] = [
  { id: 1, titre: 'Tarte aux pommes', tempsPreparation: 45, ingredients: ['pommes'], userId: 1 },
  { id: 2, titre: 'Salade César', tempsPreparation: 15, ingredients: ['salade'], userId: 2 },
]

describe('RecetteList', () => {
  // RecetteList lit le champ de recherche dans le store Zustand global : sans
  // reset, la saisie d'un test resterait active pour le suivant.
  afterEach(() => {
    useFiltreStore.setState({ recherche: '' })
  })

  it('affiche toutes les recettes quand la recherche est vide', () => {
    render(<RecetteList recettes={recettes} onDelete={() => {}} currentUserId={1} />)

    expect(screen.getByText('Tarte aux pommes')).toBeInTheDocument()
    expect(screen.getByText('Salade César')).toBeInTheDocument()
  })

  it('filtre la liste affichée selon la saisie dans le champ de recherche', async () => {
    const user = userEvent.setup()
    render(<RecetteList recettes={recettes} onDelete={() => {}} currentUserId={1} />)

    await user.type(screen.getByLabelText('Rechercher une recette'), 'tarte')

    expect(screen.getByText('Tarte aux pommes')).toBeInTheDocument()
    expect(screen.queryByText('Salade César')).not.toBeInTheDocument()
  })
})
