'use client';

import { useEffect, useState } from 'react';

// ── Types ──────────────────────────────────────────────────
interface Listing {
  id: number;
  name: string;
  description: string;
  location: string;
  propertyType: string | null;
  pricePerNight: number;
  maxGuests: number;
  ratings: number;
  status: 'active' | 'on_hold' | 'archived';
  listingAmenities: { amenity: { slug: string; label: string } }[];
  listingVibes:     { vibe:    { slug: string; label: string } }[];
}

// ── Static options (mirrors QuizSteps.tsx) ─────────────────
const AMENITY_OPTIONS = [
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

const VIBE_OPTIONS = [
  { slug: 'cozy',        label: '🕯️ Cozy' },
  { slug: 'modern',      label: '🪟 Modern' },
  { slug: 'rustic',      label: '🪵 Rustic' },
  { slug: 'adventurous', label: '🧗 Adventurous' },
  { slug: 'luxurious',   label: '✨ Luxurious' },
  { slug: 'minimalist',  label: '🫧 Minimalist' },
  { slug: 'romantic',    label: '🌹 Romantic' },
  { slug: 'family',      label: '👨‍👩‍👧 Family' },
];

const STATUS_OPTIONS = [
  { value: 'active',   label: 'Active (Visible to users)' },
  { value: 'on_hold',  label: 'On Hold (Hidden / Under maintenance)' },
  { value: 'archived', label: 'Archived (Deactivated)' },
];

const EMPTY_FORM = {
  name:          '',
  description:   '',
  location:      '',
  propertyType:  '' as string,
  pricePerNight: 100,
  maxGuests:     2,
  ratings:       4.5,
  status:        'active' as 'active' | 'on_hold' | 'archived',
  amenitySlugs:  [] as string[],
  vibeSlugs:     [] as string[],
};

// ── Status badge ───────────────────────────────────────────
function StatusBadge({ status }: { status: Listing['status'] }) {
  const config = {
    active:   { bg: '#dcfce7', color: '#166534', label: 'Active' },
    on_hold:  { bg: '#fef9c3', color: '#854d0e', label: 'On Hold' },
    archived: { bg: '#f3f4f6', color: '#6b7280', label: 'Archived' },
  }[status];

  return (
    <span style={{
      background: config.bg,
      color: config.color,
      padding: '3px 10px',
      borderRadius: '99px',
      fontSize: '0.75rem',
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      {config.label}
    </span>
  );
}

// ── Pill toggle ────────────────────────────────────────────
function PillToggle({
  options,
  selected,
  onToggle,
}: {
  options: { slug: string; label: string }[];
  selected: string[];
  onToggle: (slug: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {options.map(({ slug, label }) => {
        const isSelected = selected.includes(slug);
        return (
          <button
            key={slug}
            type="button"
            onClick={() => onToggle(slug)}
            style={{
              padding: '6px 14px',
              borderRadius: '99px',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              border: isSelected ? '1.5px solid #0f172a' : '1.5px solid #e2e8f0',
              background: isSelected ? '#0f172a' : 'white',
              color: isSelected ? 'white' : '#64748b',
              transition: 'all 0.12s ease',
              fontFamily: 'system-ui',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────
export default function AdminPage() {
  const [listings,    setListings]    = useState<Listing[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [editTarget,  setEditTarget]  = useState<Listing | null>(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);
  const [hoveredRow,  setHoveredRow]  = useState<number | null>(null);

  // ── Fetch ──
  const fetchListings = async () => {
    const res  = await fetch('/api/admin/listings');
    const data = await res.json();
    setListings(data);
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, []);

  // ── Open create ──
  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  // ── Open edit ──
  const openEdit = (listing: Listing) => {
    setEditTarget(listing);
    setForm({
      name:          listing.name,
      description:   listing.description,
      location:      listing.location,
      propertyType:  listing.propertyType ?? '',
      pricePerNight: listing.pricePerNight,
      maxGuests:     listing.maxGuests,
      ratings:       listing.ratings,
      status:        listing.status,
      amenitySlugs:  listing.listingAmenities.map((la) => la.amenity.slug),
      vibeSlugs:     listing.listingVibes.map((lv) => lv.vibe.slug),
    });
    setShowForm(true);
  };

  // ── Toggle a slug in amenities or vibes ──
  const toggleSlug = (key: 'amenitySlugs' | 'vibeSlugs', slug: string) => {
    setForm((prev) => {
      const list = prev[key];
      return {
        ...prev,
        [key]: list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug],
      };
    });
  };

  // ── Save ──
  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      propertyType:  form.propertyType || null,
      pricePerNight: Number(form.pricePerNight),
      maxGuests:     Number(form.maxGuests),
      ratings:       Number(form.ratings),
    };

    if (editTarget) {
      await fetch(`/api/admin/listings/${editTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/admin/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    setSaving(false);
    setShowForm(false);
    fetchListings();
  };

  // ── Delete ──
  const handleDelete = async (listing: Listing) => {
    if (!window.confirm(`Delete "${listing.name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/listings/${listing.id}`, { method: 'DELETE' });
    fetchListings();
  };

  // ── Inline styles ──────────────────────────────────────
  const s = {
    root:    { minHeight: '100vh', background: '#f8fafc', padding: '2rem', fontFamily: 'system-ui, sans-serif' } as React.CSSProperties,
    header:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' } as React.CSSProperties,
    title:   { fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' } as React.CSSProperties,
    btnPrimary: { background: '#0f172a', color: 'white', border: 'none', padding: '9px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'system-ui' } as React.CSSProperties,
    btnDanger:  { background: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 } as React.CSSProperties,
    btnEdit:    { background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 } as React.CSSProperties,
    table:   { width: '100%', borderCollapse: 'collapse' as const, background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
    th:      { padding: '12px 16px', textAlign: 'left' as const, fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' as const },
    td:      { padding: '12px 16px', fontSize: '0.875rem', color: '#334155', borderBottom: '1px solid #f8fafc', verticalAlign: 'middle' as const },
    overlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
    modal:   { background: 'white', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' as const },
    label:   { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.06em' } as React.CSSProperties,
    input:   { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', fontFamily: 'system-ui', outline: 'none', boxSizing: 'border-box' as const },
    section: { marginBottom: '16px' } as React.CSSProperties,
    divider: { border: 'none', borderTop: '1px solid #f1f5f9', margin: '20px 0' } as React.CSSProperties,
  };

  const activeCount   = listings.filter((l) => l.status === 'active').length;
  const onHoldCount   = listings.filter((l) => l.status === 'on_hold').length;
  const archivedCount = listings.filter((l) => l.status === 'archived').length;

  return (
    <div style={s.root}>

      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>🏠 Lodge Wiz — Admin</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
            Manage all property listings
          </p>
        </div>
        <button style={s.btnPrimary} onClick={openCreate}>+ Add listing</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Active',   count: activeCount,   bg: '#dcfce7', color: '#166534' },
          { label: 'On Hold',  count: onHoldCount,   bg: '#fef9c3', color: '#854d0e' },
          { label: 'Archived', count: archivedCount, bg: '#f3f4f6', color: '#6b7280' },
        ].map(({ label, count, bg, color }) => (
          <div key={label} style={{ background: 'white', borderRadius: '10px', padding: '10px 18px', fontSize: '0.85rem', color: '#64748b', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: bg, color, padding: '2px 8px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700 }}>{count}</span>
            {label}
          </div>
        ))}
        <div style={{ background: 'white', borderRadius: '10px', padding: '10px 18px', fontSize: '0.85rem', color: '#64748b', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>{listings.length}</span> total
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: '#64748b' }}>Loading listings…</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={s.table}>
            <thead>
              <tr>
                {['Name', 'Location', 'Type', 'Price / night', 'Guests', 'Rating', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr
                  key={listing.id}
                  onMouseEnter={() => setHoveredRow(listing.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    background: hoveredRow === listing.id ? '#f8fafc' : 'white',
                    opacity: listing.status === 'archived' ? 0.5 : 1,
                    transition: 'background 0.1s ease',
                  }}
                >
                  <td style={s.td}><strong>{listing.name}</strong></td>
                  <td style={s.td}>{listing.location}</td>
                  <td style={s.td}>{listing.propertyType ?? '—'}</td>
                  <td style={s.td}>${listing.pricePerNight}</td>
                  <td style={s.td}>{listing.maxGuests}</td>
                  <td style={s.td}>⭐ {listing.ratings}</td>
                  <td style={s.td}><StatusBadge status={listing.status} /></td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button style={s.btnEdit}   onClick={() => openEdit(listing)}>Edit</button>
                      <button style={s.btnDanger} onClick={() => handleDelete(listing)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div style={s.overlay} onClick={() => setShowForm(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', color: '#0f172a' }}>
              {editTarget ? `Editing — ${editTarget.name}` : 'Add new listing'}
            </h2>

            {/* Name */}
            <div style={s.section}>
              <label style={s.label}>Listing name</label>
              <input style={s.input} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. The Pine Loft" />
            </div>

            {/* Description */}
            <div style={s.section}>
              <label style={s.label}>Description</label>
              <textarea
                style={{ ...s.input, minHeight: '80px', resize: 'vertical' }}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe the property…"
              />
            </div>

            {/* Location + Property type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={s.label}>Location</label>
                <input style={s.input} value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Chicago, IL" />
              </div>
              <div>
                <label style={s.label}>Property type</label>
                <select style={s.input} value={form.propertyType} onChange={(e) => setForm((f) => ({ ...f, propertyType: e.target.value }))}>
                  <option value="">— None —</option>
                  <option value="house">🏡 House</option>
                  <option value="apartment">🏢 Apartment</option>
                  <option value="guesthouse">🛖 Guesthouse</option>
                  <option value="hotel">🏨 Hotel</option>
                </select>
              </div>
            </div>

            {/* Price + Guests */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={s.label}>Price per night (USD)</label>
                <input style={s.input} type="number" min={0} value={form.pricePerNight} onChange={(e) => setForm((f) => ({ ...f, pricePerNight: Number(e.target.value) }))} />
              </div>
              <div>
                <label style={s.label}>Max guests</label>
                <input style={s.input} type="number" min={1} max={20} value={form.maxGuests} onChange={(e) => setForm((f) => ({ ...f, maxGuests: Number(e.target.value) }))} />
              </div>
            </div>

            {/* Rating — range input with live label */}
            <div style={s.section}>
              <label style={s.label}>
                Rating — <span style={{ color: '#0f172a', fontWeight: 700 }}>{Number(form.ratings).toFixed(1)} ⭐</span>
              </label>
              <input
                type="range"
                min={1} max={5} step={0.1}
                value={form.ratings}
                onChange={(e) => setForm((f) => ({ ...f, ratings: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: '#0f172a' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                <span>1.0 — Poor</span>
                <span>3.0 — Good</span>
                <span>5.0 — Exceptional</span>
              </div>
            </div>

            {/* Status — only show when editing */}
            {editTarget && (
              <div style={s.section}>
                <label style={s.label}>Listing status</label>
                <select
                  style={s.input}
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as typeof form.status }))}
                >
                  {STATUS_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {form.status === 'on_hold' && form.status !== editTarget.status && (
                  <p style={{ fontSize: '0.78rem', color: '#854d0e', background: '#fef9c3', padding: '6px 10px', borderRadius: '6px', marginTop: '6px' }}>
                    ⚠️ Saving with this status will invalidate all past recommendations that included this listing.
                  </p>
                )}
              </div>
            )}

            <hr style={s.divider} />

            {/* Amenities */}
            <div style={s.section}>
              <label style={s.label}>Amenities</label>
              <PillToggle
                options={AMENITY_OPTIONS}
                selected={form.amenitySlugs}
                onToggle={(slug) => toggleSlug('amenitySlugs', slug)}
              />
            </div>

            {/* Vibes */}
            <div style={s.section}>
              <label style={s.label}>Vibes</label>
              <PillToggle
                options={VIBE_OPTIONS}
                selected={form.vibeSlugs}
                onToggle={(slug) => toggleSlug('vibeSlugs', slug)}
              />
            </div>

            <hr style={s.divider} />

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                style={{ ...s.btnPrimary, background: '#f1f5f9', color: '#64748b' }}
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                style={s.btnPrimary}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving…' : editTarget ? 'Save changes' : 'Create listing'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}