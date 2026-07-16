import { z } from 'zod'

// Schéma Zod = source de vérité unique pour la forme d'une Recette côté front.
// Contrairement à une interface TS (qui ne vérifie rien à l'exécution), ce
// schéma permet de valider les données à la frontière réseau : si l'API change
// de contrat sans qu'on s'en aperçoive (comme le bug user_id/userId corrigé
// dans ce module), on obtient une erreur explicite au lieu d'un `undefined`
// silencieux qui plante un composant plus loin dans l'app.
//
// Note : l'API réelle (GET /recettes) renvoie aussi `categories` et `tags`
// (relations Prisma incluses), que ce schéma ne modélise pas volontairement.
// Par défaut Zod ignore silencieusement les clés en trop (pas de `.strict()`),
// donc ces champs supplémentaires ne font pas échouer le parsing.
export const RecetteSchema = z.object({
  id: z.number(),
  titre: z.string(),
  tempsPreparation: z.number(),
  ingredients: z.array(z.string()),
  userId: z.number(),
})

// z.infer déduit le type TS directement du schéma : une seule définition à
// maintenir, le type et la validation runtime ne peuvent plus diverger.
export type Recette = z.infer<typeof RecetteSchema>
