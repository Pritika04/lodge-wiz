'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Amenity  { slug: string; label: string; }
interface Vibe     { slug: string; label: string; }

interface LiveListing {
  id: number;
  name: string;
  description: string;
  location: string;
  propertyType: string | null;
  pricePerNight: number;
  maxGuests: number;
  ratings: number;
  status: string;
  listingAmenities: { amenity: Amenity }[];
  listingVibes:     { vibe: Vibe }[];
}

interface RecommendationResult {
  id: number;
  rank: number;
  matchScore: number;
  matchExplanation: string;
  priceAtMatch: number;
  ratingAtMatch: number;
  isInvalidated: boolean;
  listing: LiveListing | null;
}

interface Session {
  location: string;
  maxBudget: number;
}

function scoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

function PriceTag({ priceAtMatch, currentPrice }: { priceAtMatch: number; currentPrice: number }) {
  const changed = priceAtMatch !== currentPrice;
  return (
    <div className="res-price-row">
      <span className="res-price">${currentPrice}<span className="res-price-unit">/night</span></span>
      {changed && (
        <span className="res-price-changed" title={`Was $${priceAtMatch} when matched`}>
          was ${priceAtMatch}
        </span>
      )}
    </div>
  );
}

function ListingCard({ result }: { result: RecommendationResult }) {
  const { listing, matchScore, matchExplanation, priceAtMatch, isInvalidated } = result;

  if (!listing) {
    return (
      <div className="res-card res-card-deleted">
        <p className="res-unavailable">This listing is no longer available.</p>
      </div>
    );
  }

  const amenities = listing.listingAmenities.map((la) => la.amenity);
  const vibes     = listing.listingVibes.map((lv) => lv.vibe);
  const isOnHold  = listing.status === 'on_hold' || isInvalidated;

  return (
    <div className={`res-card ${isOnHold ? 'res-card-hold' : ''}`}>
      <div className="res-rank">#{result.rank}</div>

      {isOnHold && (
        <div className="res-hold-banner">⚠️ No longer available</div>
      )}

      <div className="res-card-header">
        <div className="res-card-title-row">
          <h3 className="res-name">{listing.name}</h3>
          <div className="res-score-badge" style={{ background: scoreColor(matchScore) }}>
            {matchScore}%
          </div>
        </div>

        <div className="res-meta">
          <span>📍 {listing.location}</span>
          {listing.propertyType && <span>· {listing.propertyType}</span>}
          <span>· up to {listing.maxGuests} guests</span>
          <span>· ⭐ {listing.ratings}</span>
        </div>
      </div>

      <PriceTag priceAtMatch={priceAtMatch} currentPrice={listing.pricePerNight} />

      <p className="res-description">{listing.description}</p>

      <div className="res-explanation">
        <span className="res-explanation-icon">🔮</span>
        <span>{matchExplanation}</span>
      </div>

      {vibes.length > 0 && (
        <div className="res-tags">
          {vibes.map((v) => (
            <span key={v.slug} className="res-tag res-tag-vibe">{v.label}</span>
          ))}
        </div>
      )}

      {amenities.length > 0 && (
        <div className="res-tags">
          {amenities.map((a) => (
            <span key={a.slug} className="res-tag res-tag-amenity">{a.label}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const sessionId    = searchParams.get('sessionId');

  const [results,  setResults]  = useState<RecommendationResult[]>([]);
  const [session,  setSession]  = useState<Session | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) { router.push('/'); return; }

    fetch(`/api/recommendations/${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setSession(data.session);
        setResults(data.results);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId, router]);

  if (loading) {
    return (
      <div className="res-root">
        <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
        <div className="res-loading">
          <div className="wizard-bounce" style={{ fontSize: '3rem' }}>🧙</div>
          <p style={{ fontFamily: 'Fraunces, serif', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            Loading your results…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="res-root">
        <div className="blob blob-1" /><div className="blob blob-2" />
        <div className="res-empty">
          <p className="res-empty-icon">😕</p>
          <h2 className="res-empty-title">Something went wrong</h2>
          <p className="res-empty-sub">{error}</p>
          <button className="btn-retake" onClick={() => router.push('/')}>← Try again</button>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="res-root">
        <div className="blob blob-1" /><div className="blob blob-2" />
        <div className="res-empty">
          <p className="res-empty-icon">🔍</p>
          <h2 className="res-empty-title">No matches found</h2>
          <p className="res-empty-sub">Try loosening your preferences — wider budget or fewer amenities.</p>
          <button className="btn-retake" onClick={() => router.push('/')}>← Retake quiz</button>
        </div>
      </div>
    );
  }

  return (
    <div className="res-root">
      <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />

      <div className="res-container">
        {/* Header */}
        <div className="res-header">
          <h1 className="res-title">🔮 Your perfect stays</h1>
          {session && (
            <p className="res-subtitle">
              {results.length} match{results.length !== 1 ? 'es' : ''} in {session.location} · up to ${session.maxBudget}/night
            </p>
          )}
        </div>

        <div className="res-list">
          {results.map((result) => (
            <ListingCard key={result.id} result={result} />
          ))}
        </div>

        <div className="res-footer">
          <button className="btn-retake" onClick={() => router.push('/')}>
            ← Retake quiz
          </button>
        </div>
      </div>
    </div>
  );
}