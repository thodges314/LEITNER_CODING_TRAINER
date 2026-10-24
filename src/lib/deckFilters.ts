export type CatalogSortOption =
  | 'track-asc'
  | 'track-desc'
  | 'difficulty-asc'
  | 'difficulty-desc'
  | 'streak-desc'
  | 'streak-asc'
  | 'box-desc'
  | 'box-asc'
  | 'title-asc'
  | 'title-desc'
  | 'due-asc'
  | 'due-desc'
  | 'status-asc'
  | 'status-desc';

export type CatalogStatusFilter =
  | 'all'
  | 'attempted'
  | 'unattempted'
  | 'unlocked'
  | 'active'
  | 'locked'
  | 'deactivated'
  | 'due'
  | 'scheduled'
  | 'mastered';

export interface DeckCatalogPreferences {
  selectedTracks: string[];
  selectedBox: number | number[] | 'all';
  selectedStatus: CatalogStatusFilter;
  selectedDifficulty: number | 'all';
  sortOption: CatalogSortOption;
  searchQuery: string;
}

export const DEFAULT_DECK_CATALOG_PREFERENCES: DeckCatalogPreferences = {
  selectedTracks: ['all'],
  selectedBox: 'all',
  selectedStatus: 'all',
  selectedDifficulty: 'all',
  sortOption: 'track-asc',
  searchQuery: '',
};

export const DECK_CATALOG_STORAGE_KEY = 'leitner_deck_catalog_preferences';

const VALID_STATUSES: readonly CatalogStatusFilter[] = [
  'all',
  'attempted',
  'unattempted',
  'unlocked',
  'active',
  'locked',
  'deactivated',
  'due',
  'scheduled',
  'mastered',
];

const VALID_SORT_OPTIONS: readonly CatalogSortOption[] = [
  'track-asc',
  'track-desc',
  'difficulty-asc',
  'difficulty-desc',
  'streak-desc',
  'streak-asc',
  'box-desc',
  'box-asc',
  'title-asc',
  'title-desc',
  'due-asc',
  'due-desc',
  'status-asc',
  'status-desc',
];

export function loadDeckCatalogPreferences(storage?: Storage): DeckCatalogPreferences {
  try {
    const store = storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);
    if (!store) return { ...DEFAULT_DECK_CATALOG_PREFERENCES };

    const raw = store.getItem(DECK_CATALOG_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DECK_CATALOG_PREFERENCES };

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_DECK_CATALOG_PREFERENCES };

    // Validate selectedTracks
    let selectedTracks: string[] = ['all'];
    if (
      Array.isArray(parsed.selectedTracks) &&
      parsed.selectedTracks.every((t: unknown) => typeof t === 'string' && t.trim().length > 0)
    ) {
      selectedTracks = parsed.selectedTracks.length > 0 ? parsed.selectedTracks : ['all'];
    }

    // Validate selectedBox
    let selectedBox: number | number[] | 'all' = 'all';
    if (parsed.selectedBox === 'all') {
      selectedBox = 'all';
    } else if (
      typeof parsed.selectedBox === 'number' &&
      Number.isInteger(parsed.selectedBox) &&
      parsed.selectedBox > 0
    ) {
      selectedBox = parsed.selectedBox;
    } else if (
      Array.isArray(parsed.selectedBox) &&
      parsed.selectedBox.every(
        (b: unknown) => typeof b === 'number' && Number.isInteger(b) && b > 0
      )
    ) {
      selectedBox = parsed.selectedBox.length > 0 ? parsed.selectedBox : 'all';
    }

    // Validate selectedStatus
    const selectedStatus: CatalogStatusFilter = VALID_STATUSES.includes(parsed.selectedStatus)
      ? parsed.selectedStatus
      : 'all';

    // Validate selectedDifficulty
    let selectedDifficulty: number | 'all' = 'all';
    if (parsed.selectedDifficulty === 'all') {
      selectedDifficulty = 'all';
    } else if (
      typeof parsed.selectedDifficulty === 'number' &&
      Number.isInteger(parsed.selectedDifficulty) &&
      parsed.selectedDifficulty >= 1 &&
      parsed.selectedDifficulty <= 5
    ) {
      selectedDifficulty = parsed.selectedDifficulty;
    }

    // Validate sortOption
    const sortOption: CatalogSortOption = VALID_SORT_OPTIONS.includes(parsed.sortOption)
      ? parsed.sortOption
      : 'track-asc';

    // Validate searchQuery
    const searchQuery = typeof parsed.searchQuery === 'string' ? parsed.searchQuery : '';

    return {
      selectedTracks,
      selectedBox,
      selectedStatus,
      selectedDifficulty,
      sortOption,
      searchQuery,
    };
  } catch {
    return { ...DEFAULT_DECK_CATALOG_PREFERENCES };
  }
}

export function saveDeckCatalogPreferences(
  prefs: DeckCatalogPreferences,
  storage?: Storage
): void {
  try {
    const store = storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);
    if (!store) return;
    store.setItem(DECK_CATALOG_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Gracefully ignore quota exceptions or disabled storage
  }
}

export function clearDeckCatalogPreferences(storage?: Storage): void {
  try {
    const store = storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);
    if (!store) return;
    store.removeItem(DECK_CATALOG_STORAGE_KEY);
  } catch {
    // Gracefully ignore storage exceptions
  }
}
