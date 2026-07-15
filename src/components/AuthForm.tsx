import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'

function AuthForm() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErreur(null)

    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, password)
      }
      setEmail('')
      setPassword('')
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Une erreur est survenue")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{mode === 'login' ? 'Connexion' : 'Inscription'}</h2>
      {erreur && <p style={{ color: 'red' }}>{erreur}</p>}
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">{mode === 'login' ? 'Se connecter' : "S'inscrire"}</button>
      <button
        type="button"
        onClick={() => {
          setMode(mode === 'login' ? 'register' : 'login')
          setErreur(null)
        }}
      >
        {mode === 'login' ? 'Pas de compte ? Inscris-toi' : 'Déjà un compte ? Connecte-toi'}
      </button>
    </form>
  )
}

export default AuthForm
