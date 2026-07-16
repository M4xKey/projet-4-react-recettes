import { http, HttpResponse } from 'msw'
import type { NouvelleRecette, Recette } from '../../types'
import { creerFauxToken } from './token'

const API_URL = 'http://localhost:3000'

export const recettesDeTest: Recette[] = [
  {
    id: 1,
    titre: 'Tarte aux pommes',
    tempsPreparation: 45,
    ingredients: ['pommes', 'pâte brisée', 'sucre'],
    userId: 1,
  },
  {
    id: 2,
    titre: 'Salade César',
    tempsPreparation: 15,
    ingredients: ['salade', 'poulet', 'parmesan'],
    userId: 2,
  },
]

export const handlers = [
  http.get(`${API_URL}/recettes`, () => {
    return HttpResponse.json(recettesDeTest)
  }),

  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const { email, password } = (await request.json()) as { email: string; password: string }

    if (password !== 'bonmotdepasse') {
      return HttpResponse.json({ message: 'Email ou mot de passe incorrect' }, { status: 401 })
    }

    return HttpResponse.json({
      token: creerFauxToken({ id: 1, email }),
    })
  }),

  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const { email } = (await request.json()) as { email: string }

    return HttpResponse.json({
      token: creerFauxToken({ id: 1, email }),
    })
  }),

  http.post(`${API_URL}/recettes`, async ({ request }) => {
    const nouvelleRecette = (await request.json()) as NouvelleRecette
    return HttpResponse.json({ id: 3, userId: 1, ...nouvelleRecette })
  }),

  http.delete(`${API_URL}/recettes/:id`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
