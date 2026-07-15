import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { recettesDeTest } from './test/mocks/handlers'

function afficherApp() {
  // Un QueryClient neuf par rendu, avec retry désactivé : sinon un test qui
  // vérifie un cas d'erreur attendrait les tentatives de retry avant d'échouer.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>,
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
