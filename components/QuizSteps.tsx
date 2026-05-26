'use client';

export type PropertyType = 'house' | 'apartment' | 'guesthouse' | 'hotel';

export const LOCATIONS = [
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
  'Miami, FL',
  'Seattle, WA',
  'Denver, CO',
  'Nashville, TN',
  'Boston, MA',
  'San Francisco, CA',
  'Scottsdale, AZ',
  'Savannah, GA',
  'New Orleans, LA',
  'Aspen, CO',
];

export const PROPERTY_TYPES: { value: PropertyType; label: string; emoji: string }[] = [
  { value: 'house',      label: 'House',      emoji: '🏡' },
  { value: 'apartment',  label: 'Apartment',  emoji: '🏢' },
  { value: 'guesthouse', label: 'Guesthouse', emoji: '🛖' },
  { value: 'hotel',      label: 'Hotel',      emoji: '🏨' },
];

export const AMENITIES = [
  { slug: 'wifi',        label: '📶 WiFi' },
  { slug: 'parking',     label: '🚗 Parking' },
  { slug: 'pet_friendly',label: '🐾 Pet-Friendly' },
  { slug: 'pool',        label: '🏊 Pool' },
  { slug: 'hot_tub',     label: '🛁 Hot Tub' },
  { slug: 'kitchen',     label: '🍳 Kitchen' },
  { slug: 'workspace',   label: '💻 Workspace' },
  { slug: 'gym',         label: '🏋️ Gym' },
  { slug: 'ev_charging', label: '⚡ EV Charging' },
  { slug: 'fireplace',   label: '🔥 Fireplace' },
];

export const VIBES = [
  { slug: 'cozy',        label: '🕯️ Cozy' },
  { slug: 'modern',      label: '🪟 Modern' },
  { slug: 'rustic',      label: '🪵 Rustic' },
  { slug: 'adventurous', label: '🧗 Adventurous' },
  { slug: 'luxurious',   label: '✨ Luxurious' },
  { slug: 'minimalist',  label: '🫧 Minimalist' },
  { slug: 'romantic',    label: '🌹 Romantic' },
  { slug: 'family',      label: '👨‍👩‍👧 Family' },
];

export const RATING_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: 'Any' },
  { value: 3.0,  label: '3.0+' },
  { value: 4.0,  label: '4.0+' },
  { value: 4.5,  label: '4.5+' },
  { value: 4.8,  label: '4.8+' },
];

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`chip ${selected ? 'selected' : ''}`}
    >
      {label}
    </button>
  );
}

export function StepLocation({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="step-body">
      <h2 className="step-question">Where are you headed?</h2>
      <select
        className="location-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>Select a city…</option>
        {LOCATIONS.map((city) => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>
    </div>
  );
}

export function StepGuestsAndType({
  guests,
  propertyType,
  onGuests,
  onType,
}: {
  guests: number;
  propertyType: PropertyType | null;
  onGuests: (v: number) => void;
  onType: (v: PropertyType | null) => void;
}) {
  return (
    <div className="step-body">
      <h2 className="step-question">Tell us about your trip</h2>

      <div style={{ marginBottom: '1.75rem' }}>
        <span className="step-sublabel">How many guests?</span>
        <div className="stepper-row">
          <button
            type="button"
            className="stepper-btn"
            onClick={() => onGuests(Math.max(1, guests - 1))}
            disabled={guests <= 1}
          >
            −
          </button>
          <span className="stepper-count">{guests}</span>
          <button
            type="button"
            className="stepper-btn"
            onClick={() => onGuests(Math.min(16, guests + 1))}
            disabled={guests >= 16}
          >
            +
          </button>
        </div>
      </div>

      <div>
        <span className="step-sublabel">Property type <span style={{ color: 'var(--text-secondary)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></span>
        <div className="chip-grid">
          {PROPERTY_TYPES.map(({ value, label, emoji }) => (
            <button
              key={value}
              type="button"
              onClick={() => onType(propertyType === value ? null : value)}
              className={`chip ${propertyType === value ? 'selected' : ''}`}
            >
              {emoji} {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const BUDGET_STEP = 25;
const BUDGET_MIN  = 0;
const BUDGET_MAX  = 1500;

export function StepBudget({
  minBudget,
  maxBudget,
  onMin,
  onMax,
}: {
  minBudget: number;
  maxBudget: number;
  onMin: (v: number) => void;
  onMax: (v: number) => void;
}) {
  const decreaseMin = () => onMin(Math.max(BUDGET_MIN, minBudget - BUDGET_STEP));
  const increaseMin = () => {
    const next = Math.min(maxBudget - BUDGET_STEP, minBudget + BUDGET_STEP);
    onMin(next);
  };
  const decreaseMax = () => {
    const next = Math.max(minBudget + BUDGET_STEP, maxBudget - BUDGET_STEP);
    onMax(next);
  };
  const increaseMax = () => onMax(Math.min(BUDGET_MAX, maxBudget + BUDGET_STEP));

  return (
    <div className="step-body">
      <h2 className="step-question">What's your nightly budget?</h2>
      <p className="step-sublabel" style={{ marginBottom: '1.25rem' }}>per night · USD</p>

      <div className="budget-row">
        <div className="budget-field">
          <label>Minimum</label>
          <div className="budget-stepper">
            <button type="button" className="budget-stepper-btn" onClick={decreaseMin} disabled={minBudget <= BUDGET_MIN}>−</button>
            <span className="budget-stepper-val">${minBudget}</span>
            <button type="button" className="budget-stepper-btn" onClick={increaseMin} disabled={minBudget >= maxBudget - BUDGET_STEP}>+</button>
          </div>
        </div>

        <div className="budget-field">
          <label>Maximum</label>
          <div className="budget-stepper">
            <button type="button" className="budget-stepper-btn" onClick={decreaseMax} disabled={maxBudget <= minBudget + BUDGET_STEP}>−</button>
            <span className="budget-stepper-val">${maxBudget}</span>
            <button type="button" className="budget-stepper-btn" onClick={increaseMax} disabled={maxBudget >= BUDGET_MAX}>+</button>
          </div>
        </div>
      </div>

      <p className="budget-note">Adjusts in $25 increments · max ${BUDGET_MAX}/night</p>
    </div>
  );
}

export function StepAmenities({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (slug: string) => void;
}) {
  return (
    <div className="step-body">
      <h2 className="step-question">What can't you live without?</h2>
      <p className="step-sublabel" style={{ marginBottom: '1rem' }}>Pick as many as you'd like</p>
      <div className="chip-grid">
        {AMENITIES.map(({ slug, label }) => (
          <Chip
            key={slug}
            label={label}
            selected={selected.includes(slug)}
            onClick={() => onToggle(slug)}
          />
        ))}
      </div>
    </div>
  );
}

export function StepVibeAndRating({
  selectedVibes,
  minRating,
  onToggleVibe,
  onRating,
}: {
  selectedVibes: string[];
  minRating: number | null;
  onToggleVibe: (slug: string) => void;
  onRating: (v: number | null) => void;
}) {
  return (
    <div className="step-body">
      <h2 className="step-question">What's your vibe?</h2>

      <div className="chip-grid" style={{ marginBottom: '1.75rem' }}>
        {VIBES.map(({ slug, label }) => (
          <Chip
            key={slug}
            label={label}
            selected={selectedVibes.includes(slug)}
            onClick={() => onToggleVibe(slug)}
          />
        ))}
      </div>

      <div>
        <span className="step-sublabel">Quality level <span style={{ color: 'var(--text-secondary)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></span>
        <div className="rating-options">
          {RATING_OPTIONS.map(({ value, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => onRating(value)}
              className={`rating-chip ${minRating === value ? 'selected' : ''} ${value === null ? 'any' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}