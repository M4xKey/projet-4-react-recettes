import { afterEach, describe, expect, it } from 'vitest'
import { useFiltreStore } from './useFiltreStore'

describe('useFiltreStore', () => {
  // Un store Zustand est un singleton (le même objet est partagé par tous les
  // tests de tous les fichiers qui l'importent) : sans ce reset, la valeur de
  // `recherche` laissée par un test fuiterait vers les tests suivants.
  afterEach(() => {
    useFiltreStore.setState({ recherche: '' })
  })

  it("a une recherche vide par défaut", () => {
    expect(useFiltreStore.getState().recherche).toBe('')
  })

  it('met à jour la recherche via setRecherche', () => {
    useFiltreStore.getState().setRecherche('tarte')

    expect(useFiltreStore.getState().recherche).toBe('tarte')
  })

  it("n'affecte pas les autres tests grâce au reset entre chaque test", () => {
    // Si le afterEach précédent ne fonctionnait pas, ce test verrait 'tarte'
    // ici (valeur laissée par le test précédent) au lieu d'une chaîne vide.
    expect(useFiltreStore.getState().recherche).toBe('')
  })
})
