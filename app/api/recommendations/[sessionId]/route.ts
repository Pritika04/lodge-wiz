import { db } from '@/server/db/index';
import { quizSessions, recommendationListings } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
	req: NextRequest, 
	{ params }: { params: { sessionId: string } }
) {
	try {
		const { sessionId } = params; 

		const session = await db.query.quizSessions.findFirst({
			where: eq(quizSessions.id, sessionId),
		});

		if (!session) {
			return NextResponse.json({ error: 'Quiz session not found'}, { status: 404 });
		}

		const results = await db.query.recommendationListings.findMany({
			where: eq(recommendationListings.sessionId, sessionId),
			with: {
				listing: {
					with: {
						listingAmenities: { with: { amenity: true } },
						listingVibes: { with: { vibe: true } }
					},
				},
			},
			orderBy: (rec, { asc }) => [asc(rec.rank)],
		});

		return NextResponse.json({ session, results });

	} catch(error) {
		console.error('Results fetch error: ', error);
		return NextResponse.json(
			{ error: 'Something went wrong.' },
			{ status: 500 }
		);
	}
}