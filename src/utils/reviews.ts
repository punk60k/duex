export type ReviewRating = {
  designQuality: number; // 1-5
  projectManagement: number; // 1-5
  timeliness: number; // 1-5
  budgetAdherence: number; // 1-5
  aftercareService: number; // 1-5
};

export type ReviewFlags = {
  green?: string[]; // e.g., ["Transparent pricing", "Great communication"]
  red?: string[]; // e.g., ["Hidden costs", "Poor workmanship"]
};

export type ReviewVerification = {
  hasProof: boolean;
  docIds?: string[]; // placeholder for uploaded doc references
};

export type ReviewVisibility = 'pending_moderation' | 'published' | 'rejected';

export type Review = {
  id: string;
  companyId: string;
  authorId?: string | null; // null for anonymous
  authorDisplayName?: string | null;
  isAnonymous: boolean;
  ratings: ReviewRating;
  text: string;
  photos?: string[]; // URLs or storage keys
  videos?: string[];
  flags?: ReviewFlags;
  verification?: ReviewVerification;
  upvotes: number;
  downvotes: number;
  status: ReviewVisibility;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
};

export type CreateReviewInput = {
  companyId: string;
  authorId?: string | null;
  authorDisplayName?: string | null;
  isAnonymous?: boolean;
  ratings: ReviewRating;
  text: string;
  photos?: string[];
  videos?: string[];
  flags?: ReviewFlags;
  verification?: ReviewVerification;
};

export type UpdateReviewInput = Partial<Omit<CreateReviewInput, 'companyId' | 'authorId'>> & {
  status?: ReviewVisibility;
};

function nowIso() {
  return new Date().toISOString();
}

function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

const reviews: Map<string, Review> = new Map();

export function listReviews(): Review[] {
  return Array.from(reviews.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listCompanyReviews(companyId: string): Review[] {
  return listReviews().filter((r) => r.companyId === companyId);
}

export function getReviewById(id: string): Review | undefined {
  return reviews.get(id);
}

export function createReview(input: CreateReviewInput): Review {
  const id = generateId();
  const isAnonymous = input.isAnonymous ?? false;
  const created: Review = {
    id,
    companyId: input.companyId,
    authorId: isAnonymous ? null : input.authorId ?? null,
    authorDisplayName: isAnonymous ? null : input.authorDisplayName ?? null,
    isAnonymous,
    ratings: input.ratings,
    text: input.text,
    photos: input.photos ?? [],
    videos: input.videos ?? [],
    flags: input.flags,
    verification: input.verification ?? { hasProof: false },
    upvotes: 0,
    downvotes: 0,
    status: 'pending_moderation',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  reviews.set(id, created);
  return created;
}

export function updateReview(id: string, input: UpdateReviewInput): Review | undefined {
  const existing = reviews.get(id);
  if (!existing) return undefined;
  const updated: Review = {
    ...existing,
    ...input,
    ratings: input.ratings ? { ...existing.ratings, ...input.ratings } : existing.ratings,
    flags: input.flags ? { ...existing.flags, ...input.flags } : existing.flags,
    verification: input.verification ? { ...existing.verification, ...input.verification } : existing.verification,
    isAnonymous: input.isAnonymous ?? existing.isAnonymous,
    text: input.text ?? existing.text,
    photos: input.photos ?? existing.photos,
    videos: input.videos ?? existing.videos,
    status: input.status ?? existing.status,
    updatedAt: nowIso(),
  };
  reviews.set(id, updated);
  return updated;
}

export function deleteReview(id: string): boolean {
  return reviews.delete(id);
}

export function voteReview(id: string, delta: 1 | -1): Review | undefined {
  const existing = reviews.get(id);
  if (!existing) return undefined;
  if (delta === 1) existing.upvotes += 1;
  else existing.downvotes += 1;
  existing.updatedAt = nowIso();
  reviews.set(id, existing);
  return existing;
}

export function setReviewFlags(id: string, flags: ReviewFlags): Review | undefined {
  const existing = reviews.get(id);
  if (!existing) return undefined;
  existing.flags = flags;
  existing.updatedAt = nowIso();
  reviews.set(id, existing);
  return existing;
}

export type ModerationAction = 'approve' | 'reject';

export function moderateReview(id: string, action: ModerationAction): Review | undefined {
  const existing = reviews.get(id);
  if (!existing) return undefined;
  existing.status = action === 'approve' ? 'published' : 'rejected';
  existing.updatedAt = nowIso();
  reviews.set(id, existing);
  return existing;
}