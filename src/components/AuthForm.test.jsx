import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import AuthForm from './AuthForm'

function afficherAuthForm() {
  return render(
    <AuthProvider>
      <AuthForm />
    </AuthProvider>,
  )
}

describe('AuthForm', () => {
  it('affiche le formulaire de connexion par défaut', () => {
    afficherAuthForm()

    expect(screen.getByRole('heading', { name: 'Connexion' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument()
  })

  it("bascule vers le formulaire d'inscription", async () => {
    const user = userEvent.setup()
    afficherAuthForm()

    await user.click(screen.getByRole('button', { name: 'Pas de compte ? Inscris-toi' }))

    expect(screen.getByRole('heading', { name: 'Inscription' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: "S'inscrire" })).toBeInTheDocument()
  })

  it('affiche une erreur si le mot de passe simulé est incorrect', async () => {
    const user = userEvent.setup()
    afficherAuthForm()

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Mot de passe'), 'mauvaismotdepasse')
    await user.click(screen.getByRole('button', { name: 'Se connecter' }))

    expect(await screen.findByText('Email ou mot de passe incorrect')).toBeInTheDocument()
  })

  it('ne montre aucune erreur quand la connexion réussit', async () => {
    const user = userEvent.setup()
    afficherAuthForm()

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Mot de passe'), 'bonmotdepasse')
    await user.click(screen.getByRole('button', { name: 'Se connecter' }))

    await waitFor(() => {
      expect(screen.queryByText('Email ou mot de passe incorrect')).not.toBeInTheDocument()
    })
  })
})
