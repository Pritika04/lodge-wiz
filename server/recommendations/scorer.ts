import { SCORING_WEIGHTS, TOP_K_RESULTS, MINIMUM_SCORE_THRESHOLD } from "./constants";
import type { UserPreferences, ListingWithRelations, ScoredListing, ScoreBreakdown } from "./types";

function scoreLocation(
	listing: ListingWithRelations,
	preferences: UserPreferences
): number {
	return listing.location === preferences.location ? 1 : 0;
}

function scoreBudget(
	listing: ListingWithRelations,
	preferences: UserPreferences
): number {
	const { pricePerNight } = listing; 
	const { minBudget, maxBudget } = preferences;

	if (pricePerNight > maxBudget) {
		return 0; 
	}

	const floor = minBudget ?? 0; 
	const range = maxBudget - floor; 

	if (range == 0) {
		return pricePerNight <= maxBudget ? 1 : 0; 
	}

	return 1 - (pricePerNight - floor)/range;
}

function scoreAmenities(
	listing: ListingWithRelations,
	preferences: UserPreferences
): number {
	const { preferredAmenitySlugs } = preferences; 

	if (preferredAmenitySlugs.length === 0) {
		return 1; 
	}

	const matchCount = preferredAmenitySlugs.filter((slug) => 
		listing.amenitySlugs.includes(slug)
	).length; 

	return matchCount / preferredAmenitySlugs.length; 
}

function scoreVibe(
	listing: ListingWithRelations,
	preferences: UserPreferences
): number {
	const { preferredVibeSlugs } = preferences; 

	if (preferredVibeSlugs.length === 0) {
		return 1; 
	}

	const matchCount = preferredVibeSlugs.filter((slug) => 
		listing.vibeSlugs.includes(slug)
	).length; 

	return matchCount / preferredVibeSlugs.length; 
}

function scorePropertyType(
	listing: ListingWithRelations,
	preferences: UserPreferences
): number {
	if (!preferences.propertyType) {
		return 1; 
	}

	return listing.propertyType === preferences.propertyType ? 1 : 0; 
}

function scoreRating(
  listing: ListingWithRelations,
  preferences: UserPreferences
): number {
	if (preferences.minRating && listing.ratings < preferences.minRating) {
		return 0;
	}
	
	return listing.ratings / 5.0;
}

function scoreGuests(
  listing: ListingWithRelations,
  preferences: UserPreferences
): number {
	return listing.maxGuests >= preferences.maxGuests ? 1 : 0;
}

function computeScoreBreakdown(
  listing: ListingWithRelations,
  preferences: UserPreferences
): ScoreBreakdown {
	return {
		location: scoreLocation(listing, preferences),
		budget: scoreBudget(listing, preferences),
		guests: scoreGuests(listing, preferences),
		amenities: scoreAmenities(listing, preferences),
		vibe: scoreVibe(listing, preferences),
		propertyType: scorePropertyType(listing, preferences),
		rating: scoreRating(listing, preferences),
  };
}

function computeTotalScore(breakdown: ScoreBreakdown): number {
	const raw = breakdown.location * SCORING_WEIGHTS.location +
		breakdown.budget * SCORING_WEIGHTS.budget +
		breakdown.guests * SCORING_WEIGHTS.guests +
		breakdown.amenities * SCORING_WEIGHTS.amenities +
		breakdown.vibe * SCORING_WEIGHTS.vibe +
		breakdown.propertyType * SCORING_WEIGHTS.propertyType +
		breakdown.rating * SCORING_WEIGHTS.rating;
	
	return Math.round(raw * 100);
}

function generateExplanation(
  listing: ListingWithRelations,
  preferences: UserPreferences,
  breakdown: ScoreBreakdown,
  totalScore: number
): string {
	const highlights: string[] = [];
	
	if (breakdown.location === 1) {
		highlights.push(`located in ${listing.location}`);
	}
	
	if (breakdown.budget > 0.7) {
		highlights.push(`great value at $${listing.pricePerNight}/night`);
	} else if (breakdown.budget > 0) {
		highlights.push(`fits your budget at $${listing.pricePerNight}/night`);
	}

	if (breakdown.guests === 1) {
		highlights.push(`allows max ${listing.maxGuests} guests`);
	}
	
	if (breakdown.amenities === 1 && preferences.preferredAmenitySlugs.length > 0) {
		highlights.push(`has all your must-have amenities`);
	} else if (breakdown.amenities > 0.5) {
		highlights.push(`has most of your preferred amenities`);
	}
	
	if (breakdown.vibe > 0.5 && preferences.preferredVibeSlugs.length > 0) {
		highlights.push(`matches your ${preferences.preferredVibeSlugs.join(" & ")} vibe`);
	}
  
	if (listing.ratings >= 4.8) {
		highlights.push(`highly rated at ${listing.ratings}★`);
	}
	
	const summary = highlights.length > 0 ? highlights.join(", ") : "a reasonable match for your preferences";
	
	return `${totalScore}% match — ${summary}.`;
}

export function scoreListings(
	preferences: UserPreferences,
	listings: ListingWithRelations[]
): ScoredListing[] {
	const scored = listings.map((listing) => {
		const breakdown = computeScoreBreakdown(listing, preferences);
		const totalScore = computeTotalScore(breakdown);
		const matchExplanation = generateExplanation(
			listing,
			preferences,
			breakdown,
			totalScore
		);

		return { 
			listing: listing, 
			totalScore: totalScore, 
			scoreBreakdown: breakdown, 
			matchExplanation: matchExplanation 
		};
	})
	.filter((result) => result.totalScore >= MINIMUM_SCORE_THRESHOLD)
	.sort((a,b) => {
		if (b.totalScore !== a.totalScore) {
			return b.totalScore - a.totalScore;
		} 

		return b.listing.ratings - a.listing.ratings; 
	})
	.slice(0, TOP_K_RESULTS)
	.map((result, index) => ({
      ...result,
      rank: index + 1,
    }));

	return scored;
}