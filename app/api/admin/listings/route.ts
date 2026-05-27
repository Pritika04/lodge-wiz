import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db/index';
import { listings, listingAmenities, listingVibes } from '@/server/db/schema';

// GET — fetch all listings with their amenities and vibes
export async function GET() {
  try {
    const all = await db.query.listings.findMany({
      orderBy: (l, { desc }) => [desc(l.createdAt)],
      with: {
        listingAmenities: { with: { amenity: true } },
        listingVibes:     { with: { vibe: true } },
      },
    });

    return NextResponse.json(all);
  } catch (error) {
    console.error('Admin listings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

// POST — create a listing with amenities and vibes
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const [created] = await db
      .insert(listings)
      .values({
        name:          body.name,
        description:   body.description,
        location:      body.location,
        propertyType:  body.propertyType ?? null,
        pricePerNight: body.pricePerNight,
        maxGuests:     body.maxGuests,
        ratings:       body.ratings,
        status:        'active',
      })
      .returning();

    if (body.amenitySlugs?.length > 0) {
      const amenityRows = await db.query.amenities.findMany();
      const amenityMap = Object.fromEntries(amenityRows.map((a) => [a.slug, a.id]));
      await db.insert(listingAmenities).values(
        body.amenitySlugs.map((slug: string) => ({
          listingId: created.id,
          amenityId: amenityMap[slug],
        }))
      );
    }

    if (body.vibeSlugs?.length > 0) {
      const vibeRows = await db.query.vibes.findMany();
      const vibeMap = Object.fromEntries(vibeRows.map((v) => [v.slug, v.id]));
      await db.insert(listingVibes).values(
        body.vibeSlugs.map((slug: string) => ({
          listingId: created.id,
          vibeId: vibeMap[slug],
        }))
      );
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
	console.error('Admin create listing error:', error);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}