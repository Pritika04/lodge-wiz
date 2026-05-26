import { db } from './index';
import { listings, amenities, vibes, listingAmenities, listingVibes } from './schema';

const AMENITIES = [
  { slug: 'wifi',             label: 'WiFi' },
  { slug: 'parking',          label: 'Free parking' },
  { slug: 'pet_friendly',     label: 'Pet friendly' },
  { slug: 'pool',             label: 'Pool' },
  { slug: 'hot_tub',          label: 'Hot tub' },
  { slug: 'kitchen',          label: 'Full kitchen' },
  { slug: 'workspace',        label: 'Dedicated workspace' },
  { slug: 'gym',              label: 'Gym' },
  { slug: 'ev_charging',      label: 'EV charging' },
  { slug: 'fireplace',        label: 'Fireplace' },
];

const VIBES = [
  { slug: 'cozy',        label: 'Cozy' },
  { slug: 'modern',      label: 'Modern' },
  { slug: 'rustic',      label: 'Rustic' },
  { slug: 'adventurous', label: 'Adventurous' },
  { slug: 'romantic',    label: 'Romantic' },
  { slug: 'family',      label: 'Family friendly' },
  { slug: 'luxurious',   label: 'Luxurious' },
  { slug: 'minimalist',  label: 'Minimalist' },
];

const LISTINGS = [
  // Seattle, WA
  {
    name: 'The Pine Loft',
    description: 'A warm cabin tucked in the woods with floor-to-ceiling windows and a wood-burning fireplace. Perfect for couples or solo travelers seeking quiet.',
    location: 'Seattle, WA',
    propertyType: 'house' as const,
    pricePerNight: 120,
    maxGuests: 4,
    ratings: 4.8,
    amenitySlugs: ['wifi', 'parking', 'fireplace', 'kitchen'],
    vibeSlugs: ['cozy', 'rustic'],
  },
  {
    name: 'Treehouse Retreat',
    description: 'Sleep among the treetops in this stunning elevated cabin. Rope bridge entry, panoramic forest views, and zero light pollution for stargazing.',
    location: 'Seattle, WA',
    propertyType: 'house' as const,
    pricePerNight: 195,
    maxGuests: 2,
    ratings: 4.9,
    amenitySlugs: ['wifi', 'kitchen', 'fireplace'],
    vibeSlugs: ['adventurous', 'romantic', 'rustic'],
  },
  {
    name: 'Capitol Hill Artist Loft',
    description: 'Bright industrial loft in Seattle\'s most vibrant neighborhood. Exposed brick, local art, walking distance to the best coffee in America.',
    location: 'Seattle, WA',
    propertyType: 'apartment' as const,
    pricePerNight: 135,
    maxGuests: 3,
    ratings: 4.6,
    amenitySlugs: ['wifi', 'workspace', 'parking'],
    vibeSlugs: ['modern', 'cozy'],
  },

  // New York, NY
  {
    name: 'SoHo Container Suite',
    description: 'A converted shipping container turned ultra-modern studio in the heart of SoHo. Exposed steel, smart lighting, and a rooftop terrace.',
    location: 'New York, NY',
    propertyType: 'apartment' as const,
    pricePerNight: 210,
    maxGuests: 2,
    ratings: 4.7,
    amenitySlugs: ['wifi', 'workspace', 'gym'],
    vibeSlugs: ['modern', 'minimalist'],
  },
  {
    name: 'Brooklyn Brownstone',
    description: 'Classic pre-war brownstone in Park Slope with original hardwood floors, bay windows, and a private garden. Walking distance to Prospect Park.',
    location: 'New York, NY',
    propertyType: 'house' as const,
    pricePerNight: 275,
    maxGuests: 6,
    ratings: 4.8,
    amenitySlugs: ['wifi', 'kitchen', 'workspace', 'pet_friendly'],
    vibeSlugs: ['cozy', 'family'],
  },
  {
    name: 'Manhattan Micro Loft',
    description: 'Ingeniously designed 400sqft micro loft in Midtown. Every inch optimized. Murphy bed, fold-out desk, and city views from every window.',
    location: 'New York, NY',
    propertyType: 'apartment' as const,
    pricePerNight: 155,
    maxGuests: 2,
    ratings: 4.5,
    amenitySlugs: ['wifi', 'workspace', 'gym'],
    vibeSlugs: ['modern', 'minimalist'],
  },
  {
    name: 'Harlem Jazz Apartment',
    description: 'Soulful and vibrant apartment above a historic jazz club. Art-filled walls, vintage furniture, and the best live music on weekends.',
    location: 'New York, NY',
    propertyType: 'apartment' as const,
    pricePerNight: 130,
    maxGuests: 3,
    ratings: 4.6,
    amenitySlugs: ['wifi', 'kitchen'],
    vibeSlugs: ['cozy', 'modern'],
  },

  // Scottsdale, AZ
  {
    name: 'Desert Modern Villa',
    description: 'Architect-designed desert home with a negative-edge pool, outdoor shower, and unobstructed Sonoran Desert views. A visual masterpiece.',
    location: 'Scottsdale, AZ',
    propertyType: 'house' as const,
    pricePerNight: 385,
    maxGuests: 8,
    ratings: 4.9,
    amenitySlugs: ['wifi', 'pool', 'parking', 'kitchen', 'ev_charging'],
    vibeSlugs: ['luxurious', 'modern'],
  },
  {
    name: 'Scottsdale Casita',
    description: 'Charming adobe casita with a private courtyard, citrus trees, and a fire pit. Warm terracotta walls, handmade tile, total peace and quiet.',
    location: 'Scottsdale, AZ',
    propertyType: 'guesthouse' as const,
    pricePerNight: 115,
    maxGuests: 2,
    ratings: 4.7,
    amenitySlugs: ['wifi', 'parking', 'kitchen', 'pool'],
    vibeSlugs: ['romantic', 'rustic', 'cozy'],
  },

  // Nashville, TN
  {
    name: 'Nashville Music Row Loft',
    description: 'Industrial loft above a recording studio on Music Row. Vintage guitars on the walls, soundproofed bedroom, rooftop with skyline views.',
    location: 'Nashville, TN',
    propertyType: 'apartment' as const,
    pricePerNight: 175,
    maxGuests: 4,
    ratings: 4.7,
    amenitySlugs: ['wifi', 'workspace', 'parking'],
    vibeSlugs: ['modern', 'adventurous'],
  },
  {
    name: 'East Nashville Bungalow',
    description: 'Bright craftsman bungalow in the hippest part of Nashville. Front porch, fig tree in the yard, walkable to every great restaurant in town.',
    location: 'Nashville, TN',
    propertyType: 'house' as const,
    pricePerNight: 145,
    maxGuests: 5,
    ratings: 4.8,
    amenitySlugs: ['wifi', 'parking', 'kitchen', 'pet_friendly'],
    vibeSlugs: ['cozy', 'rustic', 'family'],
  },

  // Savannah, GA
  {
    name: 'Savannah Garden Suite',
    description: 'Ground floor suite in a historic Savannah mansion. Private entrance through a walled garden, original 1840s millwork, four-poster bed.',
    location: 'Savannah, GA',
    propertyType: 'guesthouse' as const,
    pricePerNight: 145,
    maxGuests: 2,
    ratings: 4.9,
    amenitySlugs: ['wifi', 'parking', 'kitchen'],
    vibeSlugs: ['romantic', 'cozy', 'rustic'],
  },

  // Chicago, IL
  {
    name: 'Lake Michigan Glass House',
    description: 'Three walls of floor-to-ceiling glass facing Lake Michigan. Watch storms roll in from the comfort of a designer sofa. Stunning year-round.',
    location: 'Chicago, IL',
    propertyType: 'house' as const,
    pricePerNight: 320,
    maxGuests: 6,
    ratings: 4.9,
    amenitySlugs: ['wifi', 'parking', 'kitchen', 'fireplace', 'ev_charging'],
    vibeSlugs: ['luxurious', 'modern', 'romantic'],
  },
  {
    name: 'Chicago River Studio',
    description: 'Compact and perfectly designed studio overlooking the Chicago River. Floor-to-ceiling windows, Aesop toiletries, blackout blinds.',
    location: 'Chicago, IL',
    propertyType: 'apartment' as const,
    pricePerNight: 140,
    maxGuests: 2,
    ratings: 4.6,
    amenitySlugs: ['wifi', 'workspace', 'gym'],
    vibeSlugs: ['modern', 'minimalist'],
  },
  {
    name: 'Wicker Park Greystone',
    description: 'Gorgeous three-flat greystone in Wicker Park with original stained glass and a chef\'s kitchen. Walk to the best bars in Chicago.',
    location: 'Chicago, IL',
    propertyType: 'apartment' as const,
    pricePerNight: 185,
    maxGuests: 6,
    ratings: 4.8,
    amenitySlugs: ['wifi', 'parking', 'kitchen', 'pet_friendly'],
    vibeSlugs: ['cozy', 'rustic', 'family'],
  },

  // Denver, CO
  {
    name: 'Boulder Climbing Cottage',
    description: 'Simple, clean cottage minutes from Flatirons climbing. Gear wash station, chalk bag hooks, and a menu of local climbing beta on the fridge.',
    location: 'Denver, CO',
    propertyType: 'guesthouse' as const,
    pricePerNight: 90,
    maxGuests: 3,
    ratings: 4.7,
    amenitySlugs: ['wifi', 'parking', 'kitchen', 'pet_friendly'],
    vibeSlugs: ['adventurous', 'minimalist'],
  },
  {
    name: 'Denver Design District Flat',
    description: 'Curated apartment in RiNo with original art, a turntable and vinyl collection, and walking distance to 40 craft breweries.',
    location: 'Denver, CO',
    propertyType: 'apartment' as const,
    pricePerNight: 125,
    maxGuests: 3,
    ratings: 4.6,
    amenitySlugs: ['wifi', 'workspace', 'parking', 'ev_charging'],
    vibeSlugs: ['modern', 'minimalist', 'cozy'],
  },

  // Aspen, CO
  {
    name: 'Aspen Ski Chalet',
    description: 'Slope-side chalet with ski-in/ski-out access, a hot tub on the deck, and a boot warmer by the door. Sleep 8 in total luxury.',
    location: 'Aspen, CO',
    propertyType: 'house' as const,
    pricePerNight: 595,
    maxGuests: 8,
    ratings: 4.9,
    amenitySlugs: ['wifi', 'parking', 'hot_tub', 'kitchen', 'fireplace'],
    vibeSlugs: ['luxurious', 'adventurous', 'cozy'],
  },
  {
    name: 'Telluride Luxury Lodge',
    description: 'Cathedral ceilings, a grand stone fireplace, and panoramic San Juan Mountain views. Private hot tub, gourmet kitchen, concierge service.',
    location: 'Aspen, CO',
    propertyType: 'house' as const,
    pricePerNight: 750,
    maxGuests: 10,
    ratings: 5.0,
    amenitySlugs: ['wifi', 'parking', 'hot_tub', 'kitchen', 'fireplace', 'gym'],
    vibeSlugs: ['luxurious', 'romantic', 'cozy'],
  },

  // San Francisco, CA
  {
    name: 'San Francisco Victorian',
    description: 'Authentic Painted Lady Victorian in Alamo Square. Period details intact: clawfoot tub, bay windows, ornate plasterwork. Walk to everything.',
    location: 'San Francisco, CA',
    propertyType: 'house' as const,
    pricePerNight: 230,
    maxGuests: 5,
    ratings: 4.7,
    amenitySlugs: ['wifi', 'kitchen', 'workspace', 'pet_friendly'],
    vibeSlugs: ['cozy', 'rustic', 'family'],
  },
  {
    name: 'Mission District Flat',
    description: 'Sun-drenched flat in the Mission with a rooftop garden, murals visible from every window, and the best tacos in the city downstairs.',
    location: 'San Francisco, CA',
    propertyType: 'apartment' as const,
    pricePerNight: 175,
    maxGuests: 3,
    ratings: 4.6,
    amenitySlugs: ['wifi', 'workspace', 'kitchen'],
    vibeSlugs: ['modern', 'cozy', 'minimalist'],
  },

  // Los Angeles, CA
  {
    name: 'Malibu Surf Shack',
    description: 'Steps from the sand, boards in the garage, and a deck built for golden hour. Unpretentious, salty, and completely perfect.',
    location: 'Los Angeles, CA',
    propertyType: 'house' as const,
    pricePerNight: 285,
    maxGuests: 4,
    ratings: 4.8,
    amenitySlugs: ['wifi', 'parking', 'kitchen', 'pet_friendly'],
    vibeSlugs: ['adventurous', 'rustic', 'cozy'],
  },
  {
    name: 'Santa Monica Remote Work Haven',
    description: 'Bright, airy apartment two blocks from the beach, optimized for remote workers. Ultrafast WiFi, standing desk, monitor, and ergonomic chair.',
    location: 'Los Angeles, CA',
    propertyType: 'apartment' as const,
    pricePerNight: 195,
    maxGuests: 2,
    ratings: 4.8,
    amenitySlugs: ['wifi', 'workspace', 'gym', 'ev_charging'],
    vibeSlugs: ['modern', 'minimalist'],
  },
  {
    name: 'Silver Lake Bungalow',
    description: 'Quintessential LA bungalow with a lemon tree, a hammock, and a hot tub under the stars. Walkable, creative, effortlessly cool.',
    location: 'Los Angeles, CA',
    propertyType: 'house' as const,
    pricePerNight: 220,
    maxGuests: 4,
    ratings: 4.7,
    amenitySlugs: ['wifi', 'parking', 'hot_tub', 'kitchen', 'pet_friendly'],
    vibeSlugs: ['cozy', 'rustic', 'romantic'],
  },

  // Boston, MA
  {
    name: 'Boston Beacon Hill Flat',
    description: 'Third floor walk-up on a gas-lit cobblestone street in Beacon Hill. Crown moulding, a working fireplace, and the Common two minutes away.',
    location: 'Boston, MA',
    propertyType: 'apartment' as const,
    pricePerNight: 160,
    maxGuests: 3,
    ratings: 4.7,
    amenitySlugs: ['wifi', 'workspace', 'kitchen'],
    vibeSlugs: ['cozy', 'rustic', 'modern'],
  },
  {
    name: 'Cambridge Scholar Suite',
    description: 'Elegant suite near Harvard Square with a private library, leather armchairs, and a garden. Walk to MIT, the river, and the best bookshops.',
    location: 'Boston, MA',
    propertyType: 'guesthouse' as const,
    pricePerNight: 195,
    maxGuests: 2,
    ratings: 4.8,
    amenitySlugs: ['wifi', 'workspace', 'kitchen', 'parking'],
    vibeSlugs: ['cozy', 'minimalist', 'romantic'],
  },

  // New Orleans, LA
  {
    name: 'New Orleans Garden District Manor',
    description: 'Sprawling antebellum manor with wrap-around balconies dripping in Spanish moss. A private pool, and the best street in America outside.',
    location: 'New Orleans, LA',
    propertyType: 'house' as const,
    pricePerNight: 420,
    maxGuests: 10,
    ratings: 4.8,
    amenitySlugs: ['wifi', 'parking', 'pool', 'kitchen'],
    vibeSlugs: ['luxurious', 'rustic', 'romantic'],
  },
  {
    name: 'Frenchmen Street Shotgun',
    description: 'Classic New Orleans shotgun house one block from the best live music street in the world. Ceiling fans, creaky floors, and a front porch for people watching.',
    location: 'New Orleans, LA',
    propertyType: 'house' as const,
    pricePerNight: 135,
    maxGuests: 4,
    ratings: 4.7,
    amenitySlugs: ['wifi', 'kitchen', 'parking', 'pet_friendly'],
    vibeSlugs: ['rustic', 'cozy', 'adventurous'],
  },

  // Miami, FL
  {
    name: 'South Beach Art Deco Suite',
    description: 'Restored 1930s Art Deco building half a block from the ocean. Terrazzo floors, original fixtures, a rooftop pool, and Miami energy at your door.',
    location: 'Miami, FL',
    propertyType: 'apartment' as const,
    pricePerNight: 255,
    maxGuests: 3,
    ratings: 4.7,
    amenitySlugs: ['wifi', 'pool', 'gym', 'workspace'],
    vibeSlugs: ['luxurious', 'modern', 'adventurous'],
  },
  {
    name: 'Wynwood Design Loft',
    description: 'Dramatic loft in the heart of Wynwood with floor-to-ceiling murals, a private terrace, and Art Basel energy year-round.',
    location: 'Miami, FL',
    propertyType: 'apartment' as const,
    pricePerNight: 190,
    maxGuests: 4,
    ratings: 4.6,
    amenitySlugs: ['wifi', 'workspace', 'gym', 'ev_charging'],
    vibeSlugs: ['modern', 'minimalist', 'adventurous'],
  },
];

async function seed() {
  console.log('Seeding database...');

  console.log('Clearing existing data...');
  await db.delete(listingVibes);
  await db.delete(listingAmenities);
  await db.delete(listings);
  await db.delete(amenities);
  await db.delete(vibes);

  console.log('Seeding amenities...');
  const insertedAmenities = await db
    .insert(amenities)
    .values(AMENITIES)
    .returning();

  const amenityMap = Object.fromEntries(
    insertedAmenities.map((a) => [a.slug, a.id])
  );

  console.log('Seeding vibes...');
  const insertedVibes = await db
    .insert(vibes)
    .values(VIBES)
    .returning();

  const vibeMap = Object.fromEntries(
    insertedVibes.map((v) => [v.slug, v.id])
  );

  console.log('Seeding listings...');
  for (const listing of LISTINGS) {
    const { amenitySlugs, vibeSlugs, ...listingData } = listing;

    const [inserted] = await db
      .insert(listings)
      .values(listingData)
      .returning();

    if (amenitySlugs.length > 0) {
      await db.insert(listingAmenities).values(
        amenitySlugs.map((slug) => ({
          listingId: inserted.id,
          amenityId: amenityMap[slug],
        }))
      );
    }

    if (vibeSlugs.length > 0) {
      await db.insert(listingVibes).values(
        vibeSlugs.map((slug) => ({
          listingId: inserted.id,
          vibeId: vibeMap[slug],
        }))
      );
    }
  }

  console.log(`Done! Seeded:`);
  console.log(`${AMENITIES.length} amenities`);
  console.log(`${VIBES.length} vibes`);
  console.log(`${LISTINGS.length} listings`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});