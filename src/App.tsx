import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import RecetteList from './components/RecetteList'
import RecetteForm from './components/RecetteForm'
import AuthForm from './components/AuthForm'
import { useAuth } from './context/AuthContext'
import { creerRecette, fetchRecettes, SessionExpireeError, supprimerRecette } from './api/recettes'
import type { NouvelleRecette } from './types'
import './App.css'

function App() {
  const { token, user, logout } = useAuth()
  const queryClient = useQueryClient()

  // queryKey ['recettes'] identifie ce cache : toute mutation qui doit rafraîchir
  // la liste invalide cette même clé pour déclencher un refetch.
  const {
    data: recettes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['recettes'],
    queryFn: fetchRecettes,
  })

  function gererErreurSession(err: Error) {
    if (err instanceof SessionExpireeError) {
      logout()
    }
  }

  const ajouterRecette = useMutation({
    mutationFn: (nouvelleRecette: NouvelleRecette) => creerRecette(nouvelleRecette, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recettes'] })
      // Efface une éventuelle erreur laissée par l'autre mutation : sans ça,
      // un ancien message d'erreur de suppression resterait affiché après un ajout réussi.
      supprimerRecetteMutation.reset()
    },
    onError: gererErreurSession,
  })

  const supprimerRecetteMutation = useMutation({
    mutationFn: (id: number) => supprimerRecette(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recettes'] })
      ajouterRecette.reset()
    },
    onError: gererErreurSession,
  })

  const erreur = isError
    ? "Impossible de charger les recettes. L'API est-elle démarrée ?"
    : ajouterRecette.error?.message ?? supprimerRecetteMutation.error?.message

  return (
    <main>
      <h1>Mes recettes</h1>
      {erreur && <p style={{ color: 'red' }}>{erreur}</p>}

      {user ? (
        <p>
          Connecté en tant que {user.email}{' '}
          <button type="button" onClick={logout}>
            Se déconnecter
          </button>
        </p>
      ) : (
        <AuthForm />
      )}

      {user && <RecetteForm onAdd={(recette) => ajouterRecette.mutate(recette)} />}

      {isLoading ? (
        <p>Chargement des recettes…</p>
      ) : (
        <RecetteList
          recettes={recettes}
          onDelete={(id) => supprimerRecetteMutation.mutate(id)}
          currentUserId={user?.id}
        />
      )}
    </main>
  )
}

export default App
