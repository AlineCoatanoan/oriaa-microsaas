import prisma from '../lib/prisma.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../errors/app-error.js';
import {
  COMPLETED_TASK_STATUS,
  DEFAULT_TASK_PRIORITY,
  DEFAULT_TASK_STATUS,
  URGENT_TASK_PRIORITY,
} from '../schemas/task.schema.js';
import type {
  CreateTaskInput,
  UpdateTaskInput,
} from '../schemas/task.schema.js';
import type { Prisma } from '@prisma/client';
import { formatDate, toDate, toDateOnly } from '../lib/dates.js';
import { authorSelect, toAuthorName, toSubtaskDto } from '../lib/dto.js';

/** Données liées à récupérer avec chaque tâche. */
const taskInclude = {
  subtasks: { orderBy: { subtask_id: 'asc' } },
  created_by: authorSelect,
  assignees: {
    include: {
      user: { select: { ...authorSelect.select, user_id: true } },
    },
  },
  beneficiaries: {
    include: {
      beneficiary: {
        select: {
          beneficiary_id: true,
          first_name: true,
          last_name: true,
          archived_at: true,
        },
      },
    },
  },
} satisfies Prisma.TaskInclude;

type TaskWithRelations = Prisma.TaskGetPayload<{
  include: typeof taskInclude;
}>;

/** Une tâche est archivée si elle a des bénéficiaires et qu'ils sont tous archivés. */
const archivedTaskWhere = {
  beneficiaries: {
    some: {},
    every: { beneficiary: { archived_at: { not: null } } },
  },
} satisfies Prisma.TaskWhereInput;

const isArchived = (task: TaskWithRelations) =>
  task.beneficiaries.length > 0 &&
  task.beneficiaries.every((link) => link.beneficiary.archived_at !== null);

const isCompleted = (task: TaskWithRelations) =>
  task.status === COMPLETED_TASK_STATUS;

/** En retard : échéance passée et tâche non terminée. */
function isOverdue(task: TaskWithRelations) {
  const dueDate = toDateOnly(task.due_date);
  return (
    dueDate !== null && dueDate < formatDate(new Date()) && !isCompleted(task)
  );
}

/** Format renvoyé au front. */
function toTaskDto(task: TaskWithRelations) {
  return {
    id: task.task_id,
    title: task.title,
    description: task.description,
    dueDate: toDateOnly(task.due_date),
    status: task.status,
    priority: task.priority,
    isOverdue: isOverdue(task),
    isUrgent: task.priority === URGENT_TASK_PRIORITY && !isCompleted(task),
    isArchived: isArchived(task),
    createdAt: task.created_at,
    updatedAt: task.updated_at,
    createdBy: toAuthorName(task.created_by),
    assignees: task.assignees.map(({ user }) => ({
      id: user.user_id,
      name: toAuthorName(user),
    })),
    beneficiaries: task.beneficiaries.map(({ beneficiary }) => ({
      id: beneficiary.beneficiary_id,
      firstName: beneficiary.first_name,
      lastName: beneficiary.last_name,
    })),
    subtasks: task.subtasks.map(toSubtaskDto),
  };
}

/** Enlève les doublons d'une liste d'identifiants. */
const unique = (ids: number[]) => [...new Set(ids)];

/** Les responsables ajoutés doivent exister et être actifs. */
async function assertActiveAssignees(ids: number[]) {
  const count = await prisma.user.count({
    where: { user_id: { in: ids }, archived_at: null },
  });
  if (count !== ids.length)
    throw new BadRequestError('Responsable introuvable.');
}

/** Les bénéficiaires ajoutés doivent exister et ne pas être archivés. */
async function assertActiveBeneficiaries(ids: number[]) {
  const count = await prisma.beneficiary.count({
    where: { beneficiary_id: { in: ids }, archived_at: null },
  });
  if (count !== ids.length) {
    throw new BadRequestError('Bénéficiaire introuvable ou archivé.');
  }
}

/** Renvoie la tâche avec ses liens, ou une 404. */
async function findExistingOrFail(id: number) {
  const task = await prisma.task.findUnique({
    where: { task_id: id },
    include: taskInclude,
  });
  if (!task) throw new NotFoundError('Tâche introuvable.');
  return task;
}

/** Règle métier : une tâche archivée est en lecture seule. */
function assertNotArchived(task: TaskWithRelations) {
  if (isArchived(task)) {
    throw new ConflictError(
      "Une tâche archivée ne peut pas être modifiée. Désarchivez d'abord un de ses bénéficiaires.",
    );
  }
}

/** Vérifie que la tâche existe et qu'elle est modifiable. */
export async function assertTaskEditable(id: number) {
  assertNotArchived(await findExistingOrFail(id));
}

/**
 * Liste les tâches, de l'échéance la plus proche à la plus lointaine.
 * Avec beneficiaryId (onglet de la fiche) : toutes les tâches de ce bénéficiaire.
 * Sinon : les tâches courantes, ou les archivées avec archived.
 */
export async function findAll(options: {
  archived: boolean;
  beneficiaryId?: number;
}) {
  const { archived, beneficiaryId } = options;

  let where: Prisma.TaskWhereInput;
  if (beneficiaryId) {
    where = { beneficiaries: { some: { beneficiary_id: beneficiaryId } } };
  } else {
    where = archived ? archivedTaskWhere : { NOT: archivedTaskWhere };
  }

  const tasks = await prisma.task.findMany({
    where,
    include: taskInclude,
    orderBy: { due_date: { sort: 'asc', nulls: 'last' } },
  });

  return tasks.map(toTaskDto);
}

/** Renvoie une tâche, ou une 404. */
export async function findById(id: number) {
  return toTaskDto(await findExistingOrFail(id));
}

/** Crée une tâche. Par défaut, la personne connectée en est responsable. */
export async function create(data: CreateTaskInput, currentUserId: number) {
  const assigneeIds = unique(data.assigneeIds ?? [currentUserId]);
  const beneficiaryIds = unique(data.beneficiaryIds ?? []);

  await assertActiveAssignees(assigneeIds);
  await assertActiveBeneficiaries(beneficiaryIds);

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      due_date: toDate(data.dueDate),
      status: DEFAULT_TASK_STATUS,
      priority: data.priority ?? DEFAULT_TASK_PRIORITY,
      user_id_created_by: currentUserId,
      assignees: { create: assigneeIds.map((user_id) => ({ user_id })) },
      beneficiaries: {
        create: beneficiaryIds.map((beneficiary_id) => ({ beneficiary_id })),
      },
    },
    include: taskInclude,
  });

  return toTaskDto(task);
}

/**
 * Modifie une tâche. Seuls les champs envoyés sont modifiés.
 * Seuls les liens ajoutés sont vérifiés : un lien existant vers un bénéficiaire
 * archivé ou un collègue parti peut être conservé.
 */
export async function update(id: number, data: UpdateTaskInput) {
  const existing = await findExistingOrFail(id);
  assertNotArchived(existing);

  const assigneeIds = data.assigneeIds && unique(data.assigneeIds);
  const beneficiaryIds = data.beneficiaryIds && unique(data.beneficiaryIds);

  if (assigneeIds) {
    const current = existing.assignees.map((link) => link.user_id);
    await assertActiveAssignees(
      assigneeIds.filter((userId) => !current.includes(userId)),
    );
  }
  if (beneficiaryIds) {
    const current = existing.beneficiaries.map((link) => link.beneficiary_id);
    await assertActiveBeneficiaries(
      beneficiaryIds.filter(
        (beneficiaryId) => !current.includes(beneficiaryId),
      ),
    );
  }

  const task = await prisma.task.update({
    where: { task_id: id },
    data: {
      title: data.title,
      description: data.description,
      due_date: toDate(data.dueDate),
      status: data.status,
      priority: data.priority,
      assignees: assigneeIds && {
        deleteMany: {},
        create: assigneeIds.map((user_id) => ({ user_id })),
      },
      beneficiaries: beneficiaryIds && {
        deleteMany: {},
        create: beneficiaryIds.map((beneficiary_id) => ({ beneficiary_id })),
      },
    },
    include: taskInclude,
  });

  return toTaskDto(task);
}

/** Supprime une tâche. Ses liens et ses sous-tâches sont supprimés en cascade. */
export async function remove(id: number) {
  await assertTaskEditable(id);

  await prisma.task.delete({ where: { task_id: id } });
}
