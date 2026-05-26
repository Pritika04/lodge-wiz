import type { InferSelectModel } from 'drizzle-orm';
import { listings, quizSessions } from '../db/schema';

type ListingRow = InferSelectModel<typeof listings>;
type QuizSessionRow = InferSelectModel<typeof quizSessions>;

// Preferences collected from the quiz
// Omit DB-managed fields — everything else is a quiz input
export type UserPreferences = Omit<QuizSessionRow, 'id' | 'createdAt'>;

// A listing with its amenities and vibes already joined and flattened
// Omit createdAt — not needed for scoring or display
export type ListingWithRelations = Omit<ListingRow, 'createdAt'> & {
	amenitySlugs: string[];
	vibeSlugs: string[];
};

// Score breakdown by category — makes scoring logic transparent
export type ScoreBreakdown = {
	location: number;
	budget: number;
	guests: number;
	amenities: number;
	vibe: number;
	propertyType: number;
	rating: number;
};

// Final output for a single listing
export type ScoredListing = {
	listing: ListingWithRelations;
	totalScore: number;
	rank: number;
	scoreBreakdown: ScoreBreakdown;
	matchExplanation: string;
};