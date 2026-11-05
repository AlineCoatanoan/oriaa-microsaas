import type { Document } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { personSelect, toPerson } from '../lib/dto.js';
import type { Person } from '../lib/dto.js';
import { BadRequestError, NotFoundError } from '../errors/app-error.js';
import type {
  CreateDocumentInput,
  UpdateDocumentInput,
} from '../schemas/document.schema.js';
import {
  assertBeneficiaryActive,
  findBeneficiaryOrFail,
} from './beneficiary.service.js';

const ARCHIVED_DOCUMENTS_MESSAGE =
  "Les documents d'un dossier archivé ne peuvent pas être modifiés. Désarchivez-le d'abord.";

/** Signatures des formats acceptés : les premiers octets du fichier. */
const FILE_SIGNATURES = [
  { mimeType: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] },
  { mimeType: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { mimeType: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47] },
];

type DocumentSummary = Omit<Document, 'content'> & { user: Person };

/** Format renvoyé au front, jamais avec le contenu du fichier. */
function toDocumentDto(document: DocumentSummary) {
  return {
    id: document.document_id,
    title: document.title,
    fileName: document.file_name,
    category: document.category,
    mimeType: document.mime_type,
    sizeBytes: document.size_bytes,
    createdAt: document.created_at,
    addedBy: toPerson(document.user),
  };
}

/** Lit le vrai format dans le contenu, sans se fier à ce qu'annonce le client. */
function detectMimeType(content: Buffer) {
  const signature = FILE_SIGNATURES.find(({ bytes }) =>
    bytes.every((byte, index) => content[index] === byte),
  );
  if (!signature) {
    throw new BadRequestError(
      'Seuls les fichiers PDF, JPEG et PNG sont acceptés.',
    );
  }
  return signature.mimeType;
}

/** multer lit le nom en latin1 : on le relit en UTF-8, pour garder les accents. */
const toFileName = (originalName: string) =>
  Buffer.from(originalName, 'latin1').toString('utf8').slice(0, 255);

/** Réutilise le dossier existant : "santé" rejoint "Santé" sur une même fiche. */
async function resolveCategory(beneficiaryId: number, category: string) {
  const existing = await prisma.document.findFirst({
    where: {
      beneficiary_id: beneficiaryId,
      category: { equals: category, mode: 'insensitive' },
    },
    select: { category: true },
  });
  return existing?.category ?? category;
}

/** Vérifie que le document existe et appartient bien à ce bénéficiaire, sinon 404. */
async function assertDocumentExists(beneficiaryId: number, documentId: number) {
  const document = await prisma.document.findFirst({
    where: { document_id: documentId, beneficiary_id: beneficiaryId },
    select: { document_id: true },
  });
  if (!document) throw new NotFoundError('Document introuvable.');
}

/** Liste les documents d'un bénéficiaire, sans charger le contenu des fichiers. */
export async function findAllByBeneficiary(beneficiaryId: number) {
  await findBeneficiaryOrFail(beneficiaryId);

  const documents = await prisma.document.findMany({
    where: { beneficiary_id: beneficiaryId },
    omit: { content: true },
    include: { user: personSelect },
    orderBy: [{ category: 'asc' }, { title: 'asc' }],
  });

  return documents.map(toDocumentDto);
}

/** Ajoute un document à un dossier bénéficiaire. */
export async function create(
  beneficiaryId: number,
  data: CreateDocumentInput,
  file: Express.Multer.File | undefined,
  currentUserId: number,
) {
  await assertBeneficiaryActive(beneficiaryId, ARCHIVED_DOCUMENTS_MESSAGE);
  if (!file) throw new BadRequestError('Aucun fichier envoyé.');

  const document = await prisma.document.create({
    data: {
      title: data.title,
      file_name: toFileName(file.originalname),
      category: await resolveCategory(beneficiaryId, data.category),
      mime_type: detectMimeType(file.buffer),
      size_bytes: file.size,
      content: new Uint8Array(file.buffer),
      beneficiary_id: beneficiaryId,
      user_id: currentUserId,
    },
    omit: { content: true },
    include: { user: personSelect },
  });

  return toDocumentDto(document);
}

/** Renvoie le fichier à télécharger, ou une 404. */
export async function findFile(beneficiaryId: number, documentId: number) {
  const document = await prisma.document.findFirst({
    where: { document_id: documentId, beneficiary_id: beneficiaryId },
    select: { file_name: true, mime_type: true, content: true },
  });
  if (!document) throw new NotFoundError('Document introuvable.');
  return document;
}

/** Modifie le titre et/ou le dossier d'un document. */
export async function update(
  beneficiaryId: number,
  documentId: number,
  data: UpdateDocumentInput,
) {
  await assertBeneficiaryActive(beneficiaryId, ARCHIVED_DOCUMENTS_MESSAGE);
  await assertDocumentExists(beneficiaryId, documentId);

  const document = await prisma.document.update({
    where: { document_id: documentId },
    data: {
      title: data.title,
      category:
        data.category && (await resolveCategory(beneficiaryId, data.category)),
    },
    omit: { content: true },
    include: { user: personSelect },
  });

  return toDocumentDto(document);
}

/** Supprime un document. */
export async function remove(beneficiaryId: number, documentId: number) {
  await assertBeneficiaryActive(beneficiaryId, ARCHIVED_DOCUMENTS_MESSAGE);
  await assertDocumentExists(beneficiaryId, documentId);

  await prisma.document.delete({ where: { document_id: documentId } });
}
