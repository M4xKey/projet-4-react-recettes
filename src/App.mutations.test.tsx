import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { recettesDeTest } from './test/mocks/handlers'
import { server } from './test/mocks/server'
import type { Recette } from './types'

const API_URL = 'http://localhost:3000'

// Fichier séparé de App.test.tsx : celui-ci couvre les mutations (créer/supprimer
// une recette) et la régression directe sur le bug userId/user_id, plutôt que
// l'affichage de base déjà couvert ailleurs.

function afficherApp() {
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

// Le faux token JWT généré par le mock MSW encode toujours { id: 1, email }
// (voir test/mocks/handlers.ts) : l'utilisateur connecté en test a donc id: 1.
const currentUserId = 1

async function seConnecter(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByText(recettesDeTest[0].titre)

  await user.type(screen.getByLabelText('Email'), 'test@example.com')
  await user.type(screen.getByLabelText('Mot de passe'), 'bonmotdepasse')
  await user.click(screen.getByRole('button', { name: 'Se connecter' }))

  // On attend que le formulaire de recette apparaisse : signe que le contexte
  // d'auth a bien basculé côté connecté avant de continuer le test.
  await screen.findByLabelText('Titre')
}

describe('App - mutations', () => {
  // AuthProvider lit le token dans sessionStorage au montage : sans ce nettoyage,
  // le login effectué par un test précédent resterait actif pour les suivants
  // (sessionStorage n'est pas réinitialisé automatiquement entre les tests d'un
  // même fichier), et les appels à seConnecter échoueraient car AuthForm ne
  // serait plus affiché.
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('permet de se connecter via le formulaire de connexion', async () => {
    const user = userEvent.setup()
    afficherApp()

    await seConnecter(user)

    expect(screen.getByText(/Connecté en tant que/)).toBeInTheDocument()
  })

  it('affiche la nouvelle recette après soumission du formulaire', async () => {
    // Les handlers globaux (handlers.ts) sont volontairement statiques : le POST
    // ne modifie pas la liste que renvoie le GET. Ici on a besoin que le refetch
    // déclenché par invalidateQueries voie la recette ajoutée, donc on surcharge
    // localement les deux handlers avec un état partagé. server.resetHandlers()
    // (appelé en afterEach dans test/setup.ts) annule cette surcharge après le test.
    let recettesActuelles: Recette[] = [...recettesDeTest]
    server.use(
      http.get(`${API_URL}/recettes`, () => HttpResponse.json(recettesActuelles)),
      http.post(`${API_URL}/recettes`, async ({ request }) => {
        const nouvelleRecette = (await request.json()) as Omit<Recette, 'id' | 'userId'>
        const recetteCreee: Recette = { id: 3, userId: currentUserId, ...nouvelleRecette }
        recettesActuelles = [...recettesActuelles, recetteCreee]
        return HttpResponse.json(recetteCreee)
      }),
    )

    const user = userEvent.setup()
    afficherApp()

    await seConnecter(user)

    await user.type(screen.getByLabelText('Titre'), 'Soupe au potiron')
    await user.type(screen.getByLabelText(/Ingrédients/), 'potiron, crème')
    await user.type(screen.getByLabelText(/Temps de préparation/), '30')
    await user.click(screen.getByRole('button', { name: 'Ajouter' }))

    // findByText attend le refetch déclenché par invalidateQueries après le
    // succès de la mutation POST, pas juste le rendu optimiste.
    expect(await screen.findByText('Soupe au potiron')).toBeInTheDocument()
  })

  it('affiche le bouton Supprimer uniquement pour les recettes de l\'utilisateur connecté', async () => {
    const user = userEvent.setup()
    afficherApp()

    await seConnecter(user)

    // Non-régression directe sur le bug user_id/userId : recettesDeTest[0] a
    // userId: 1 (== currentUserId), recettesDeTest[1] a userId: 2 (différent).
    expect(recettesDeTest[0].userId).toBe(currentUserId)
    expect(recettesDeTest[1].userId).not.toBe(currentUserId)

    const items = screen.getAllByRole('listitem')
    const itemDeLUtilisateur = items.find((item) =>
      item.textContent?.includes(recettesDeTest[0].titre),
    )
    const itemDunAutreUtilisateur = items.find((item) =>
      item.textContent?.includes(recettesDeTest[1].titre),
    )

    expect(itemDeLUtilisateur).toBeDefined()
    expect(itemDunAutreUtilisateur).toBeDefined()

    expect(
      itemDeLUtilisateur!.querySelector('button')?.textContent,
    ).toBe('Supprimer')
    // Aucun bouton Supprimer dans l'item d'un autre utilisateur : avec le bug
    // (user_id au lieu de userId), ce test échouait car recette.user_id était
    // toujours undefined, donc peutSupprimer était toujours false y compris
    // pour l'utilisateur propriétaire.
    expect(itemDunAutreUtilisateur!.querySelector('button')).toBeNull()
  })

  it('supprime la recette de la liste après clic sur Supprimer', async () => {
    // Même remarque que pour le test de création : on rend le DELETE stateful
    // localement pour que le refetch post-invalidation reflète la suppression.
    let recettesActuelles: Recette[] = [...recettesDeTest]
    server.use(
      http.get(`${API_URL}/recettes`, () => HttpResponse.json(recettesActuelles)),
      http.delete(`${API_URL}/recettes/:id`, ({ params }) => {
        recettesActuelles = recettesActuelles.filter((r) => r.id !== Number(params.id))
        return new HttpResponse(null, { status: 204 })
      }),
    )

    const user = userEvent.setup()
    afficherApp()

    await seConnecter(user)

    await screen.findByText(recettesDeTest[0].titre)
    await user.click(screen.getByRole('button', { name: 'Supprimer' }))

    // waitFor plutôt que setTimeout : on attend l'invalidation React Query
    // et le refetch qui en découle, sans dépendre d'une durée arbitraire.
    await waitFor(() => {
      expect(screen.queryByText(recettesDeTest[0].titre)).not.toBeInTheDocument()
    })
  })
})
