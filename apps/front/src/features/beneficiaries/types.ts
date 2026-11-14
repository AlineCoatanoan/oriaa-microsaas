import type { Tone } from '@/components/ui/tones';
import type { Person } from '@/lib/types';

export const PATHWAY_STATUSES = [
  'En cours',
  'Préparation à la sortie',
  'Sortie',
] as const;

export type PathwayStatus = (typeof PATHWAY_STATUSES)[number];
export type Beneficiary = {
  id: number;
  lastName: string;
  firstName: string;
  email: string | null;
  dateOfBirth: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  phone: string | null;
  familyStatus: string | null;
  numberOfChildren: number | null;
  householdComposition: string | null;
  pathwayStatus: PathwayStatus;
  entryDate: string;
  exitDate: string | null;
  createdAt: string;
  archivedAt: string | null;
  referent: Person;
};

export const pathwayStatusTones: Record<PathwayStatus, Tone> = {
  'En cours': 'success',
  'Préparation à la sortie': 'warning',
  Sortie: 'info',
};
