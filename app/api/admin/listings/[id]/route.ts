import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db/index';
import { listings, recommendationListings } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

// PATCH — update listing fields or toggle on_hold
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

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Admin update listing error:', error);
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
  }
}

// DELETE — remove a listing entirely
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listingId = parseInt(id);

    await db
      .delete(listings)
      .where(eq(listings.id, listingId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete listing error:', error);
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
  }
}