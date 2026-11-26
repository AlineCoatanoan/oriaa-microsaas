import type { CSSProperties } from 'react';

/** Rendez-vous d'un dossier archivé : grisé, quelle que soit la personne. */
export const ARCHIVED_COLOR = 'border-muted bg-page text-muted';

/**
 * Angle d'or (≈ 137,5°) : en tournant de cet angle sur le cercle des
 * couleurs à chaque nouveau compte, la teinte ne retombe jamais exactement
 * sur une teinte déjà prise, et les suivantes se placent toujours dans
 * les plus grands écarts restants.
 */
const GOLDEN_ANGLE = 137.508;

/**
 * Couleur d'une personne, calculée à partir de son identifiant : chaque
 * nouveau compte a la sienne dès sa création, sans rien enregistrer, et
 * tout le monde voit les mêmes couleurs.
 * Seule la teinte change ; la clarté est fixe : texte foncé sur fond très
 * clair (contraste supérieur à 8:1 quelle que soit la teinte, RGAA).
 */
export function colorOf(personId: number): CSSProperties {
  const hue = Math.round((personId * GOLDEN_ANGLE) % 360);
  return {
    backgroundColor: `hsl(${hue} 75% 92%)`,
    borderColor: `hsl(${hue} 60% 32%)`,
    color: `hsl(${hue} 65% 18%)`,
  };
}
