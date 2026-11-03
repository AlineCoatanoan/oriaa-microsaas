import type { seedBeneficiaries } from './beneficiaries.seed.js';
import type { seedRoles } from './roles.seed.js';
import type { seedTasks } from './tasks.seed.js';
import type { seedUsers } from './users.seed.js';

export type SeedRoles = Awaited<ReturnType<typeof seedRoles>>;
export type SeedUsers = Awaited<ReturnType<typeof seedUsers>>;
export type SeedBeneficiaries = Awaited<ReturnType<typeof seedBeneficiaries>>;
export type SeedTasks = Awaited<ReturnType<typeof seedTasks>>;
