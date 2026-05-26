// Scoring weights: sum to 1
export const SCORING_WEIGHTS = {
	location:     0.25,
	budget:       0.25,
	guests:       0.20,
	amenities:    0.15,
	vibe:         0.10,
	propertyType: 0.03,
	rating:       0.02,
} as const;

// How many results to return to the user
export const TOP_K_RESULTS = 5;

// Minimum score a listing must have to appear in results
// Prevents completely irrelevant listings from showing up
export const MINIMUM_SCORE_THRESHOLD = 10;