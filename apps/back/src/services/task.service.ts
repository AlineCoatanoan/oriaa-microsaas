import type { Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { formatDate, toDate, toDateOnly } from '../lib/dates.js';
import {
  noteLinksInclude,
  personSelect,
  toNoteLinks,
  toNoteSummary,
  toPerson,
  toSubtaskDto,
} from '../lib/dto.js';
import { assertNotesExist } from './note.service.js';
import { ConflictError, NotFoundError } from '../errors/app-error.js';
import {
  COMPLETED_TASK_STATUS,
  DEFAULT_TASK_PRIORITY,
  DEFAULT_TASK_STATUS,
  URGENT_TASK_PRIORITY,
} from '../schemas/task.schema.js';
import type {
  CreateTaskInput,
  ListTasksQuery,
  UpdateTaskInput,
} from '../schemas/task.schema.js';
import { assertActiveUsers } from './auth.service.js';
import {
  allBeneficiariesArchivedWhere,
  areAllBeneficiariesArchived,
  beneficiaryLinksInclude,
  newIds,
  toBeneficiaryLinks,
  toBeneficiarySummary,
  unique,
} from '../lib/beneficiary-links.js';
import { assertActiveBeneficiaries } from './beneficiary.service.js';

const UNKNOWN_ASSIGNEE_MESSAGE = 'Responsable introuvable.';

/** Données liées à récupérer avec chaque tâche. */
const taskInclude = {
  subtasks: { orderBy: { subtask_id: 'asc' } },
  created_by: personSelect,
  assignees: { include: { user: personSelect } },
  beneficiaries: beneficiaryLinksInclude,
  notes: noteLinksInclude,
} satisfies Prisma.TaskInclude;

type TaskWithRelations = Prisma.TaskGetPayload<{
  include: typeof taskInclude;
}>;

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
    isArchived: areAllBeneficiariesArchived(task.beneficiaries),
    createdAt: task.created_at,
    updatedAt: task.updated_at,
    createdBy: toPerson(task.created_by),
    assignees: task.assignees.map(({ user }) => toPerson(user)),
    beneficiaries: task.beneficiaries.map(toBeneficiarySummary),
    notes: task.notes.map(toNoteSummary),
    subtasks: task.subtasks.map(toSubtaskDto),
  };
}

const toAssigneeLinks = (ids: number[]) => ids.map((user_id) => ({ user_id }));

/** Renvoie la tâche avec ses liens, ou une 404. */
async function findTaskOrFail(id: number) {
  const task = await prisma.task.findUnique({
    where: { task_id: id },
    include: taskInclude,
  });
  if (!task) throw new NotFoundError('Tâche introuvable.');
  return task;
}

/** Règle métier : une tâche archivée est en lecture seule. Renvoie la tâche. */
export async function assertTaskEditable(id: number) {
  const task = await findTaskOrFail(id);
  if (areAllBeneficiariesArchived(task.beneficiaries)) {
    throw new ConflictError(
      "Une tâche archivée ne peut pas être modifiée. Désarchivez d'abord un de ses bénéficiaires.",
    );
  }
  return task;
}

/** Liste les tâches filtrées, de l'échéance la plus proche à la plus lointaine. */
export async function findAll(filters: ListTasksQuery) {
  const { beneficiaryId, assigneeId, status, priority } = filters;

  const tasks = await prisma.task.findMany({
    where: {
      status,
      priority,
      assignees: assigneeId ? { some: { user_id: assigneeId } } : undefined,
      ...(beneficiaryId
        ? { beneficiaries: { some: { beneficiary_id: beneficiaryId } } }
        : { NOT: allBeneficiariesArchivedWhere }),
    },
    include: taskInclude,
    orderBy: { due_date: { sort: 'asc', nulls: 'last' } },
  });

  return tasks.map(toTaskDto);
}

/** Renvoie une tâche, ou une 404. */
export async function findById(id: number) {
  return toTaskDto(await findTaskOrFail(id));
}

/** Crée une tâche. Par défaut, la personne connectée en est responsable. */
export async function create(data: CreateTaskInput, currentUserId: number) {
  const assigneeIds = unique(data.assigneeIds ?? [currentUserId]);
  const beneficiaryIds = unique(data.beneficiaryIds ?? []);
  const noteIds = unique(data.noteIds ?? []);

  await assertActiveUsers(assigneeIds, UNKNOWN_ASSIGNEE_MESSAGE);
  await assertActiveBeneficiaries(beneficiaryIds);
  await assertNotesExist(noteIds);

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      due_date: toDate(data.dueDate),
      status: DEFAULT_TASK_STATUS,
      priority: data.priority ?? DEFAULT_TASK_PRIORITY,
      user_id_created_by: currentUserId,
      assignees: { create: toAssigneeLinks(assigneeIds) },
      beneficiaries: { create: toBeneficiaryLinks(beneficiaryIds) },
      notes: { create: toNoteLinks(noteIds) },
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
  const existing = await assertTaskEditable(id);
  const assigneeIds = data.assigneeIds && unique(data.assigneeIds);
  const beneficiaryIds = data.beneficiaryIds && unique(data.beneficiaryIds);
  const noteIds = data.noteIds && unique(data.noteIds);

  if (assigneeIds) {
    await assertActiveUsers(
      newIds(
        assigneeIds,
        existing.assignees.map((link) => link.user_id),
      ),
      UNKNOWN_ASSIGNEE_MESSAGE,
    );
  }
  if (beneficiaryIds) {
    await assertActiveBeneficiaries(
      newIds(
        beneficiaryIds,
        existing.beneficiaries.map((link) => link.beneficiary_id),
      ),
    );
  }
  if (noteIds) await assertNotesExist(noteIds);

  const task = await prisma.task.update({
    where: { task_id: id },
    data: {
      title: data.title,
      description: data.description,
      due_date: toDate(data.dueDate),
      status: data.status,
      priority: data.priority,
      // deleteMany + create : la liste envoyée remplace l'ancienne
      assignees: assigneeIds && {
        deleteMany: {},
        create: toAssigneeLinks(assigneeIds),
      },
      beneficiaries: beneficiaryIds && {
        deleteMany: {},
        create: toBeneficiaryLinks(beneficiaryIds),
      },
      notes: noteIds && {
        deleteMany: {},
        create: toNoteLinks(noteIds),
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
