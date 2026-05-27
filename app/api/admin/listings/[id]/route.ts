import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db/index';
import { listings, listingAmenities, listingVibes, recommendationListings } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

// PATCH — update listing, replace amenities/vibes, handle on_hold invalidation
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listingId = parseInt(id);
    const body = await req.json();

    const [updated] = await db
      .update(listings)
      .set({
        ...(body.name          !== undefined && { name: body.name }),
        ...(body.description   !== undefined && { description: body.description }),
        ...(body.location      !== undefined && { location: body.location }),
        ...(body.propertyType  !== undefined && { propertyType: body.propertyType }),
        ...(body.pricePerNight !== undefined && { pricePerNight: body.pricePerNight }),
        ...(body.maxGuests     !== undefined && { maxGuests: body.maxGuests }),
        ...(body.ratings       !== undefined && { ratings: body.ratings }),
        ...(body.status        !== undefined && { status: body.status }),
      })
      .where(eq(listings.id, listingId))
      .returning();

    if (body.status === 'on_hold') {
      await db
        .update(recommendationListings)
        .set({ isInvalidated: true })
        .where(eq(recommendationListings.listingId, listingId));
    }

    if (body.amenitySlugs !== undefined) {
      await db.delete(listingAmenities).where(eq(listingAmenities.listingId, listingId));
      if (body.amenitySlugs.length > 0) {
        const amenityRows = await db.query.amenities.findMany();
        const amenityMap = Object.fromEntries(amenityRows.map((a) => [a.slug, a.id]));
        await db.insert(listingAmenities).values(
          body.amenitySlugs.map((slug: string) => ({
            listingId,
            amenityId: amenityMap[slug],
          }))
        );
      }
    }

    if (body.vibeSlugs !== undefined) {
      await db.delete(listingVibes).where(eq(listingVibes.listingId, listingId));
      if (body.vibeSlugs.length > 0) {
        const vibeRows = await db.query.vibes.findMany();
        const vibeMap = Object.fromEntries(vibeRows.map((v) => [v.slug, v.id]));
        await db.insert(listingVibes).values(
          body.vibeSlugs.map((slug: string) => ({
            listingId,
            vibeId: vibeMap[slug],
          }))
        );
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Admin update listing error:', error);
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
  }
}

// DELETE — remove listing (cascades to junction tables automatically)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(listings).where(eq(listings.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete listing error:', error);
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
  }
}