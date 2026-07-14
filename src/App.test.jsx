import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { recettesDeTest } from './test/mocks/handlers'

function afficherApp() {
  return render(
    <AuthProvider>
      <App />
    </AuthProvider>,
  )
}

describe('App', () => {
  it('affiche la liste des recettes renvoyées par l\'API simulée', async () => {
    afficherApp()

    for (const recette of recettesDeTest) {
      expect(await screen.findByText(recette.titre)).toBeInTheDocument()
    }
  })

  it("masque le formulaire d'ajout de recette quand l'utilisateur n'est pas connecté", async () => {
    afficherApp()

    await screen.findByText(recettesDeTest[0].titre)

    expect(screen.queryByLabelText('Titre')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Connexion' })).toBeInTheDocument()
  })

  it("affiche le formulaire d'ajout de recette une fois connecté", async () => {
    const user = userEvent.setup()
    afficherApp()

    await screen.findByText(recettesDeTest[0].titre)

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Mot de passe'), 'bonmotdepasse')
    await user.click(screen.getByRole('button', { name: 'Se connecter' }))

    expect(await screen.findByLabelText('Titre')).toBeInTheDocument()
  })
})
