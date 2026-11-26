import type { Person } from '@/lib/types';

export type Note = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: Person;
  beneficiaryId: number;
};
