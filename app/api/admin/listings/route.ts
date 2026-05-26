import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db/index';
import { listings } from '@/server/db/schema';

// GET — fetch all listings
export async function GET() {
  try {
    const all = await db.select().from(listings).orderBy(listings.createdAt);
    return NextResponse.json(all);
  } catch (error) {
    console.error('Admin listings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

// POST - create a new listing
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
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Admin create listing error:', error);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}