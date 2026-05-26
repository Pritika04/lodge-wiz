import { pgEnum, pgTable, serial, text, integer, doublePrecision, boolean, timestamp, uuid, jsonb, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const propertyTypeEnum = pgEnum('property_types', ['house', 'apartment', 'guesthouse', 'hotel']);
export const statusEnum = pgEnum('listing_status', ['active', 'on_hold', 'archived']);

export const listings = pgTable('listings', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description').notNull(),
	location: text('location').notNull(),
	propertyType: propertyTypeEnum('property_type'),
	pricePerNight: integer('price_per_night').notNull(),
	maxGuests: integer('max_guests').notNull(),
	ratings: doublePrecision('ratings').notNull(),
	status: statusEnum('status').default('active').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}); 

export const amenities = pgTable('amenities', {
	id: serial('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	label: text('label').notNull(),
});

export const listingAmenities = pgTable('listing_amenities', {
	listingId: integer('listing_id').references(() => listings.id, { onDelete: 'cascade' }).notNull(),
	amenityId: integer('amenity_id').references(() => amenities.id, { onDelete: 'cascade' }).notNull(),
}, (table) => [
	primaryKey({ columns: [table.listingId, table.amenityId] })
]);

export const vibes = pgTable('vibes', {
	id: serial('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	label: text('label').notNull(),
});

export const listingVibes = pgTable('listing_vibes', {
	listingId: integer('listing_id').references(() => listings.id, { onDelete: 'cascade' }).notNull(),
	vibeId: integer('vibe_id').references(() => vibes.id, { onDelete: 'cascade' }).notNull(),
}, (table) => [
	primaryKey({ columns: [table.listingId, table.vibeId] })
]);

export const quizSessions = pgTable('quiz_sessions', {
	id: uuid('id').defaultRandom().primaryKey(),
	location: text('location').notNull(),
	propertyType: propertyTypeEnum('property_type'),
	maxBudget: integer('max_budget').notNull(),
	minBudget: integer('min_budget'),
	maxGuests: integer('max_guests').notNull(),
	minRating: doublePrecision('min_rating'),
	preferredAmenitySlugs: jsonb('preferred_amenity_slugs').$type<string[]>().notNull(),
	preferredVibeSlugs: jsonb('preferred_vibe_slugs').$type<string[]>().notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const recommendationListings = pgTable('recommendation_listings', {
	id: serial('id').primaryKey(),
	sessionId: uuid('session_id').references(() => quizSessions.id, { onDelete: 'cascade' }).notNull(),
	listingId: integer('listing_id').references(() => listings.id, { onDelete: 'set null' }), 
	matchScore: integer('match_score').notNull(),
	matchExplanation: text('match_explanation').notNull(),
	priceAtMatch: integer('price_at_match').notNull(),
	ratingAtMatch: doublePrecision('rating_at_match').notNull(),
	rank: integer('rank').notNull(), 
	isInvalidated: boolean('is_invalidated').default(false).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const listingsRelations = relations(listings, ({ many }) => ({
	listingAmenities: many(listingAmenities),
	listingVibes:     many(listingVibes),
	recommendations:  many(recommendationListings),
}));

export const amenitiesRelations = relations(amenities, ({ many }) => ({
	listingAmenities: many(listingAmenities),
}));

export const vibesRelations = relations(vibes, ({ many }) => ({
	listingVibes: many(listingVibes),
}));

export const listingAmenitiesRelations = relations(listingAmenities, ({ one }) => ({
	listing: one(listings, { fields: [listingAmenities.listingId], references: [listings.id] }),
	amenity: one(amenities, { fields: [listingAmenities.amenityId], references: [amenities.id] }),
}));

export const listingVibesRelations = relations(listingVibes, ({ one }) => ({
	listing: one(listings, { fields: [listingVibes.listingId], references: [listings.id] }),
	vibe:    one(vibes,    { fields: [listingVibes.vibeId],    references: [vibes.id] }),
}));

export const quizSessionsRelations = relations(quizSessions, ({ many }) => ({
	recommendationListings: many(recommendationListings),
}));

export const recommendationListingsRelations = relations(recommendationListings, ({ one }) => ({
	session: one(quizSessions, { fields: [recommendationListings.sessionId], references: [quizSessions.id] }),
	listing: one(listings,     { fields: [recommendationListings.listingId], references: [listings.id] }),
}));