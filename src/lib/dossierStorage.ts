import { STORAGE_KEYS, safeGetJson, safeSetJson, safeRemoveItem } from './storage';
import type { InterviewPrepDossier } from './interviewPrep';

export const INTERVIEW_DOSSIERS_STORAGE_KEY = STORAGE_KEYS.INTERVIEW_DOSSIERS;

export function loadAllInterviewDossiers(): Record<string, InterviewPrepDossier> {
  if (typeof window === 'undefined') return {};
  const parsed = safeGetJson<Record<string, InterviewPrepDossier> | null>(
    INTERVIEW_DOSSIERS_STORAGE_KEY,
    null
  );
  if (!parsed || typeof parsed !== 'object') return {};

  let mutated = false;
  for (const key of Object.keys(parsed)) {
    const item = parsed[key];
    if (!item || typeof item !== 'object') {
      delete parsed[key];
      mutated = true;
      continue;
    }
    if (!item.id) {
      item.id = key.startsWith('dossier_')
        ? key
        : `dossier_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
      mutated = true;
    }
  }
  if (mutated) {
    safeSetJson(INTERVIEW_DOSSIERS_STORAGE_KEY, parsed);
  }
  return parsed;
}

export function saveInterviewDossier(deckOrDossierId: string, dossier: InterviewPrepDossier): void {
  if (typeof window === 'undefined') return;
  const all = loadAllInterviewDossiers();
  if (!dossier.id) {
    dossier.id = deckOrDossierId.startsWith('dossier_')
      ? deckOrDossierId
      : `dossier_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  }
  all[deckOrDossierId] = dossier;
  if (dossier.id && dossier.id !== deckOrDossierId) {
    all[dossier.id] = dossier;
  }
  safeSetJson(INTERVIEW_DOSSIERS_STORAGE_KEY, all);
}

export function getInterviewDossier(deckOrDossierId: string): InterviewPrepDossier | null {
  const all = loadAllInterviewDossiers();
  return all[deckOrDossierId] || null;
}

export function getAllSavedDossiers(): InterviewPrepDossier[] {
  const all = loadAllInterviewDossiers();
  const list = Object.values(all);
  const map = new Map<string, InterviewPrepDossier>();
  for (const d of list) {
    if (!d) continue;
    const key = d.id || `${d.company || 'briefing'}_${d.role || 'prep'}_${d.generatedAt || 0}`;
    if (!map.has(key) || (map.get(key)!.generatedAt || 0) < (d.generatedAt || 0)) {
      map.set(key, d);
    }
  }
  return Array.from(map.values()).sort((a, b) => (b.generatedAt || 0) - (a.generatedAt || 0));
}

export function deleteInterviewDossier(target: string | Partial<InterviewPrepDossier>): void {
  if (typeof window === 'undefined') return;
  const all = loadAllInterviewDossiers();

  const targetStr = typeof target === 'string' ? target.trim() : '';
  const targetObj = typeof target === 'object' && target !== null ? target : undefined;

  let targetId = targetStr || targetObj?.id || '';
  let targetCompany = targetObj?.company;
  let targetRole = targetObj?.role;
  let targetGeneratedAt = targetObj?.generatedAt;
  let targetDeckName = targetObj?.deckName;

  if (targetStr && all[targetStr]) {
    const item = all[targetStr];
    targetId = targetId || item.id || targetStr;
    targetCompany = targetCompany || item.company;
    targetRole = targetRole || item.role;
    targetGeneratedAt = targetGeneratedAt || item.generatedAt;
    targetDeckName = targetDeckName || item.deckName;
  }

  // Also check if any dossier in `all` matches targetId
  if (targetId) {
    for (const item of Object.values(all)) {
      if (item && item.id === targetId) {
        targetCompany = targetCompany || item.company;
        targetRole = targetRole || item.role;
        targetGeneratedAt = targetGeneratedAt || item.generatedAt;
        targetDeckName = targetDeckName || item.deckName;
        break;
      }
    }
  }

  for (const key of Object.keys(all)) {
    const item = all[key];
    const matchesTargetStr = Boolean(targetStr && key === targetStr);
    const matchesId = Boolean(targetId && (key === targetId || item?.id === targetId));
    const matchesMeta = Boolean(
      targetCompany &&
        item?.company &&
        item.company.toLowerCase() === targetCompany.toLowerCase() &&
        (!targetRole || !item?.role || item.role.toLowerCase() === targetRole.toLowerCase()) &&
        (!targetGeneratedAt ||
          !item?.generatedAt ||
          Math.abs(item.generatedAt - targetGeneratedAt) < 60000)
    );
    const matchesDeck = Boolean(
      targetDeckName &&
        item?.deckName &&
        item.deckName.trim().toLowerCase() === targetDeckName.trim().toLowerCase()
    );
    const matchesTimestamp = Boolean(
      targetGeneratedAt && item?.generatedAt && item.generatedAt === targetGeneratedAt
    );

    if (matchesTargetStr || matchesId || matchesMeta || matchesDeck || matchesTimestamp) {
      delete all[key];
    }
  }

  // Fallback: If only 1 dossier exists in storage and delete was invoked, delete it
  if (Object.keys(all).length === 1 && !targetStr && !targetId && !targetCompany) {
    for (const key of Object.keys(all)) {
      delete all[key];
    }
  }

  safeSetJson(INTERVIEW_DOSSIERS_STORAGE_KEY, all);
}

export function clearAllInterviewDossiers(): void {
  if (typeof window === 'undefined') return;
  safeRemoveItem(INTERVIEW_DOSSIERS_STORAGE_KEY);
}

