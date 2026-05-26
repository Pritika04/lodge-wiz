import { db } from '@/server/db/index';
import { listings, listingAmenities, listingVibes, quizSessions, recommendationListings } from '@/server/db/schema';
import { ListingWithRelations, UserPreferences } from '@/server/recommendations/types';
import { eq } from 'drizzle-orm';
import { scoreListings } from '@/server/recommendations/scorer';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
	try {
		const body = await req.json(); 
		const preferences: UserPreferences = body;

		const rawListings = await db.query.listings.findMany({
			where: eq(listings.status, 'active'),
			with: {
				listingAmenities: { with: { amenity: true } },
				listingVibes: { with: { vibe: true } }
			}
		});

		const listingsWithRelations: ListingWithRelations[] = rawListings.map((listing) => ({
			id: listing.id,
			name: listing.name,
			description: listing.description,
			location: listing.location,
			propertyType: listing.propertyType,
			pricePerNight: listing.pricePerNight,
			maxGuests: listing.maxGuests,
			ratings: listing.ratings,
			status: listing.status,
			amenitySlugs: listing.listingAmenities.map((la) => la.amenity.slug),
			vibeSlugs: listing.listingVibes.map((lv) => lv.vibe.slug),
		}));

		const scoredListings = scoreListings(preferences, listingsWithRelations);

		if (scoredListings.length === 0) {
			return NextResponse.json(
				{ error: 'No listings matched your preferences. Try adjusting your criteria.' },
				{ status: 404 }
			);
		}

		const [session] = await db
		.insert(quizSessions)
		.values({
			location: preferences.location,
			propertyType: preferences.propertyType,
			maxBudget: preferences.maxBudget,
			minBudget: preferences.minBudget,
			maxGuests: preferences.maxGuests,
			minRating: preferences.minRating,
			preferredAmenitySlugs: preferences.preferredAmenitySlugs,
			preferredVibeSlugs: preferences.preferredVibeSlugs,
		})
		.returning();
		
		await db.insert(recommendationListings).values(
			scoredListings.map((result) => ({
				sessionId: session.id,
				listingId: result.listing.id,
				matchScore: result.totalScore,
				matchExplanation: result.matchExplanation,
				priceAtMatch: result.listing.pricePerNight,
				ratingAtMatch: result.listing.ratings,
				rank: result.rank,
				isInvalidated: false,
			}))
		);

		return NextResponse.json({
			sessionId: session.id,
			results:   scoredListings,
		});

	} catch (error) {
		console.error('Recommendations error: ', error);
		return NextResponse.json(
			{ error: 'Something went wrong. Please try again.' },
			{ status: 500 }
		);
	}
}