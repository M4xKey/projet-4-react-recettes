import { useEffect, useState } from 'react'
import RecetteList from './components/RecetteList'
import RecetteForm from './components/RecetteForm'
import AuthForm from './components/AuthForm'
import { useAuth } from './context/AuthContext'
import './App.css'

const API_URL = 'http://localhost:3000/recettes'

function App() {
  const { token, user, logout } = useAuth()
  const [recettes, setRecettes] = useState([])
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then(setRecettes)
      .catch(() => setErreur("Impossible de charger les recettes. L'API est-elle démarrée ?"))
  }, [])

  function handleAdd(nouvelleRecette) {
    fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(nouvelleRecette),
    })
      .then((res) => {
        if (res.status === 401) {
          logout()
          throw new Error('Session expirée, reconnecte-toi.')
        }
        return res.json()
      })
      .then((recetteCreee) => setRecettes((prev) => [...prev, recetteCreee]))
      .catch((err) => setErreur(err.message || "Impossible d'ajouter la recette."))
  }

  function handleDelete(id) {
    fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          logout()
          throw new Error('Session expirée, reconnecte-toi.')
        }
        if (!res.ok) {
          throw new Error('Impossible de supprimer la recette.')
        }
        setRecettes((prev) => prev.filter((r) => r.id !== id))
      })
      .catch((err) => setErreur(err.message))
  }

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

      {user && <RecetteForm onAdd={handleAdd} />}
      <RecetteList recettes={recettes} onDelete={handleDelete} currentUserId={user?.id} />
    </main>
  )
}

export default App
