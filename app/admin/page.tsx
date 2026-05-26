'use client';

import { useEffect, useState } from 'react';

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
}

const EMPTY_FORM = {
  name: '',
  description: '',
  location: '',
  propertyType: '',
  pricePerNight: 100,
  maxGuests: 2,
  ratings: 4.5,
};

function StatusBadge({ status }: { status: Listing['status'] }) {
  const styles: Record<string, string> = {
    active:   'background:#dcfce7; color:#166534;',
    on_hold:  'background:#fef9c3; color:#854d0e;',
    archived: 'background:#f3f4f6; color:#6b7280;',
  };
  return (
    <span style={{
      ...Object.fromEntries(styles[status].split(';').filter(Boolean).map(s => s.split(':'))),
      padding: '2px 10px',
      borderRadius: '99px',
      fontSize: '0.75rem',
      fontWeight: 600,
    }}>
      {status.replace('_', ' ')}
    </span>
  );
}

export default function AdminPage() {
  const [listings,    setListings]    = useState<Listing[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [editTarget,  setEditTarget]  = useState<Listing | null>(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);

  const fetchListings = async () => {
    const res = await fetch('/api/admin/listings');
    const data = await res.json();
    setListings(data);
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

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
    });
    setShowForm(true);
  };

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

  const toggleHold = async (listing: Listing) => {
    const newStatus = listing.status === 'on_hold' ? 'active' : 'on_hold';
    const confirm = window.confirm(
      newStatus === 'on_hold'
        ? `Put "${listing.name}" on hold?`
        : `Reactivate "${listing.name}"?`
    );
    if (!confirm) return;

    await fetch(`/api/admin/listings/${listing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchListings();
  };

  const handleDelete = async (listing: Listing) => {
    if (!window.confirm(`Delete "${listing.name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/listings/${listing.id}`, { method: 'DELETE' });
    fetchListings();
  };

  const s = {
    root:    { minHeight: '100vh', background: '#f8fafc', padding: '2rem', fontFamily: 'system-ui, sans-serif' } as React.CSSProperties,
    header:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' } as React.CSSProperties,
    title:   { fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' } as React.CSSProperties,
    btnPrimary: { background: '#0f172a', color: 'white', border: 'none', padding: '9px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 } as React.CSSProperties,
    btnDanger:  { background: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 } as React.CSSProperties,
    btnHold:    { background: '#fef9c3', color: '#854d0e', border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 } as React.CSSProperties,
    btnEdit:    { background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 } as React.CSSProperties,
    table:   { width: '100%', borderCollapse: 'collapse' as const, background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
    th:      { padding: '12px 16px', textAlign: 'left' as const, fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' },
    td:      { padding: '12px 16px', fontSize: '0.875rem', color: '#334155', borderBottom: '1px solid #f8fafc', verticalAlign: 'middle' as const },
    overlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
    modal:   { background: 'white', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' as const },
    label:   { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
    input:   { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', fontFamily: 'system-ui', outline: 'none' },
    row:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } as React.CSSProperties,
  };

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <h1 style={s.title}>🏠 Lodge Wiz — Admin</h1>
        <button style={s.btnPrimary} onClick={openCreate}>+ Add listing</button>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem' }}>
        {(['active', 'on_hold', 'archived'] as const).map((status) => {
          const count = listings.filter((l) => l.status === status).length;
          return (
            <div key={status} style={{ background: 'white', borderRadius: '10px', padding: '10px 18px', fontSize: '0.85rem', color: '#64748b', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
              <strong style={{ color: '#0f172a' }}>{count}</strong> {status.replace('_', ' ')}
            </div>
          );
        })}
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: '#64748b' }}>Loading listings…</p>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              {['Name', 'Location', 'Type', 'Price/night', 'Guests', 'Rating', 'Status', 'Actions'].map((h) => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing.id} style={{ opacity: listing.status === 'archived' ? 0.5 : 1 }}>
                <td style={s.td}><strong>{listing.name}</strong></td>
                <td style={s.td}>{listing.location}</td>
                <td style={s.td}>{listing.propertyType ?? '—'}</td>
                <td style={s.td}>${listing.pricePerNight}</td>
                <td style={s.td}>{listing.maxGuests}</td>
                <td style={s.td}>⭐ {listing.ratings}</td>
                <td style={s.td}><StatusBadge status={listing.status} /></td>
                <td style={s.td}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button style={s.btnEdit} onClick={() => openEdit(listing)}>Edit</button>
                    <button style={s.btnHold} onClick={() => toggleHold(listing)}>
                      {listing.status === 'on_hold' ? 'Reactivate' : 'Hold'}
                    </button>
                    <button style={s.btnDanger} onClick={() => handleDelete(listing)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div style={s.overlay} onClick={() => setShowForm(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', color: '#0f172a' }}>
              {editTarget ? `Edit — ${editTarget.name}` : 'Add new listing'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Name */}
              <div>
                <label style={s.label}>Name</label>
                <input style={s.input} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="The Pine Loft" />
              </div>

              <div>
                <label style={s.label}>Description</label>
                <textarea
                  style={{ ...s.input, minHeight: '80px', resize: 'vertical' }}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="A warm cabin tucked in the woods…"
                />
              </div>

              <div style={s.row}>
                <div>
                  <label style={s.label}>Location</label>
                  <input style={s.input} value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Chicago, IL" />
                </div>
                <div>
                  <label style={s.label}>Property type</label>
                  <select style={s.input} value={form.propertyType} onChange={(e) => setForm((f) => ({ ...f, propertyType: e.target.value }))}>
                    <option value="">— None —</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="guesthouse">Guesthouse</option>
                    <option value="hotel">Hotel</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={s.label}>Price/night ($)</label>
                  <input style={s.input} type="number" value={form.pricePerNight} onChange={(e) => setForm((f) => ({ ...f, pricePerNight: Number(e.target.value) }))} />
                </div>
                <div>
                  <label style={s.label}>Max guests</label>
                  <input style={s.input} type="number" value={form.maxGuests} onChange={(e) => setForm((f) => ({ ...f, maxGuests: Number(e.target.value) }))} />
                </div>
                <div>
                  <label style={s.label}>Rating</label>
                  <input style={s.input} type="number" step="0.1" min="0" max="5" value={form.ratings} onChange={(e) => setForm((f) => ({ ...f, ratings: Number(e.target.value) }))} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1.75rem' }}>
              <button style={{ ...s.btnPrimary, background: '#f1f5f9', color: '#64748b' }} onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button style={s.btnPrimary} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editTarget ? 'Save changes' : 'Create listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}