import type { BeneficiarySummary, Person } from '@/lib/types';

export type Appointment = {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  startAt: string;
  endAt: string;
  isArchived: boolean;
  user: Person;
  beneficiaries: BeneficiarySummary[];
};
