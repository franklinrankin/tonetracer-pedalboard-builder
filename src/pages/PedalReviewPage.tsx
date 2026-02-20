import React, { useState, useMemo, useEffect } from 'react';
import { PEDALS as pedals } from '../data/pedals';
import { PedalImage } from '../components/PedalImage';
import { Pedal } from '../types';

const CATEGORY_ORDER = ['gain', 'modulation', 'delay', 'reverb', 'dynamics', 'filter', 'pitch', 'eq', 'volume', 'utility', 'amp', 'synth'];

interface FlaggedPedal {
  brand: string;
  model: string;
  category: string;
  currentSubtype: string;
  suggestedSubtype?: string;
}

const SUBTYPE_OPTIONS: Record<string, string[]> = {
  gain: [
    'Clean Boost', 'Mid Boost', 'Treble Boost',
    'Bluesbreaker-style', 'Tube Screamer-style', 'Klon-style', 'Transparent OD', 'Amp-like OD',
    'RAT-style', 'Marshall-style', 'Hard-Clipping Distortion', 'High-Gain / Metal Distortion',
    'Fuzz Face-style', 'Tone Bender-style', 'Muff-style', 'Gated Fuzz', 'Octave Fuzz'
  ],
  modulation: ['Chorus', 'Phaser', 'Flanger', 'Tremolo', 'Vibrato', 'Univibe / Rotary'],
  delay: ['Analog-style Delay', 'Tape-style Delay', 'Digital Delay', 'Multi / Experimental Delay'],
  reverb: ['Spring', 'Plate', 'Hall', 'Room', 'Ambient / Shimmer'],
  dynamics: ['Compressor', 'Noise Gate'],
  filter: ['Wah', 'Envelope Filter', 'Fixed Filter'],
  pitch: ['Octave', 'Harmony', 'Pitch Shift / Whammy'],
  eq: ['EQ'],
  volume: ['Volume', 'Expression'],
  amp: ['Preamp', 'Amp-in-a-Box', 'Cab Sim / IR Loader'],
  utility: ['Tuner', 'Buffer', 'Loop Switcher', 'A/B / A/B/Y', 'Splitter / Mixer', 'Mute'],
  synth: ['Synth', 'Ring Mod', 'Bitcrusher', 'Freeze / Sustain', 'Glitch / Granular'],
};

export const PedalReviewPage: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [subtypeFilter, setSubtypeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState<'all' | 'flagged' | 'unflagged'>('all');
  const [flaggedPedals, setFlaggedPedals] = useState<Record<string, FlaggedPedal>>({});

  // Load flagged pedals from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('flaggedPedalsForReview');
      if (saved) {
        setFlaggedPedals(JSON.parse(saved));
      }
    } catch (e) {
      // localStorage not available
    }
  }, []);

  // Save flagged pedals to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('flaggedPedalsForReview', JSON.stringify(flaggedPedals));
    } catch (e) {
      // localStorage not available
    }
  }, [flaggedPedals]);

  const categories = useMemo(() => 
    [...new Set(pedals.map(p => p.category))].sort(), 
  []);

  const subtypes = useMemo(() => {
    const filtered = categoryFilter === 'all' 
      ? pedals 
      : pedals.filter(p => p.category === categoryFilter);
    return [...new Set(filtered.map(p => p.subtype))].sort();
  }, [categoryFilter]);

  const filteredPedals = useMemo(() => {
    return pedals.filter(p => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (subtypeFilter !== 'all' && p.subtype !== subtypeFilter) return false;
      if (search && !`${p.brand} ${p.model}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (showFilter === 'flagged' && !flaggedPedals[p.id]) return false;
      if (showFilter === 'unflagged' && flaggedPedals[p.id]) return false;
      return true;
    });
  }, [categoryFilter, subtypeFilter, search, showFilter, flaggedPedals]);

  const grouped = useMemo(() => {
    const result: Record<string, Record<string, Pedal[]>> = {};
    for (const p of filteredPedals) {
      const subtype = p.subtype || 'Other';
      if (!result[p.category]) result[p.category] = {};
      if (!result[p.category][subtype]) result[p.category][subtype] = [];
      result[p.category][subtype].push(p);
    }
    return result;
  }, [filteredPedals]);

  const toggleFlag = (pedal: Pedal) => {
    setFlaggedPedals(prev => {
      const next = { ...prev };
      if (next[pedal.id]) {
        delete next[pedal.id];
      } else {
        next[pedal.id] = {
          brand: pedal.brand,
          model: pedal.model,
          category: pedal.category,
          currentSubtype: pedal.subtype || 'N/A',
        };
      }
      return next;
    });
  };

  const updateSuggestedSubtype = (pedalId: string, subtype: string) => {
    setFlaggedPedals(prev => ({
      ...prev,
      [pedalId]: {
        ...prev[pedalId],
        suggestedSubtype: subtype,
      },
    }));
  };

  const exportFlagged = () => {
    const entries = Object.entries(flaggedPedals);
    if (entries.length === 0) {
      alert('No pedals flagged for review!');
      return;
    }

    let text = '# Flagged Pedals for Subcategory Review\n\n';
    text += `Total flagged: ${entries.length}\n\n`;

    // Group by suggested correction
    const needsChange = entries.filter(([, data]) => data.suggestedSubtype);
    const needsReview = entries.filter(([, data]) => !data.suggestedSubtype);

    if (needsChange.length > 0) {
      text += '## Suggested Changes\n\n';
      needsChange.forEach(([id, data]) => {
        text += `- **${data.brand} ${data.model}** (${data.category})\n`;
        text += `  - Current: ${data.currentSubtype}\n`;
        text += `  - Suggested: ${data.suggestedSubtype}\n`;
        text += `  - ID: \`${id}\`\n\n`;
      });
    }

    if (needsReview.length > 0) {
      text += '## Needs Review (no suggestion)\n\n';
      needsReview.forEach(([id, data]) => {
        text += `- **${data.brand} ${data.model}** - Currently: ${data.currentSubtype} (${data.category}) - ID: \`${id}\`\n`;
      });
    }

    // Download
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flagged-pedals-review.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllFlags = () => {
    if (confirm('Clear all flagged pedals?')) {
      setFlaggedPedals({});
    }
  };

  const flaggedCount = Object.keys(flaggedPedals).length;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f5f5dc', 
      color: '#000',
      padding: '20px',
      fontFamily: "'Courier New', monospace"
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        marginBottom: '20px',
        fontSize: '28px',
        textTransform: 'uppercase',
        border: '4px solid #000',
        padding: '15px',
        background: '#fff'
      }}>
        PEDAL SUBCATEGORY REVIEW
      </h1>

      {/* Stats */}
      <div style={{
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
        marginBottom: '20px',
        padding: '15px',
        background: '#fff',
        border: '3px solid #000',
      }}>
        <div style={{ background: '#f0f0f0', padding: '10px 15px', border: '2px solid #000' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{pedals.length}</div>
          <div style={{ fontSize: '12px', textTransform: 'uppercase' }}>Total Pedals</div>
        </div>
        <div style={{ background: flaggedCount > 0 ? '#fff0f0' : '#f0f0f0', padding: '10px 15px', border: '2px solid #000' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{flaggedCount}</div>
          <div style={{ fontSize: '12px', textTransform: 'uppercase' }}>Flagged</div>
        </div>
        <div style={{ background: '#f0fff0', padding: '10px 15px', border: '2px solid #000' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{filteredPedals.length}</div>
          <div style={{ fontSize: '12px', textTransform: 'uppercase' }}>Visible</div>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: '#fff',
        padding: '15px',
        zIndex: 100,
        border: '3px solid #000',
        marginBottom: '20px',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div>
          <label style={{ fontWeight: 'bold', marginRight: '5px' }}>Category:</label>
          <select 
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setSubtypeFilter('all');
            }}
            style={{ padding: '8px', fontSize: '14px', border: '2px solid #000', fontFamily: 'inherit' }}
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontWeight: 'bold', marginRight: '5px' }}>Subtype:</label>
          <select 
            value={subtypeFilter}
            onChange={(e) => setSubtypeFilter(e.target.value)}
            style={{ padding: '8px', fontSize: '14px', border: '2px solid #000', fontFamily: 'inherit' }}
          >
            <option value="all">All Subtypes</option>
            {subtypes.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontWeight: 'bold', marginRight: '5px' }}>Search:</label>
          <input
            type="text"
            placeholder="Search pedals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px', fontSize: '14px', border: '2px solid #000', width: '150px', fontFamily: 'inherit' }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 'bold', marginRight: '5px' }}>Show:</label>
          <select
            value={showFilter}
            onChange={(e) => setShowFilter(e.target.value as any)}
            style={{ padding: '8px', fontSize: '14px', border: '2px solid #000', fontFamily: 'inherit' }}
          >
            <option value="all">All</option>
            <option value="flagged">Flagged Only</option>
            <option value="unflagged">Unflagged Only</option>
          </select>
        </div>

        <button
          onClick={exportFlagged}
          style={{
            padding: '10px 20px',
            border: '3px solid #000',
            background: '#4dabf7',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontFamily: 'inherit',
            textTransform: 'uppercase',
          }}
        >
          Export Flagged
        </button>

        <button
          onClick={clearAllFlags}
          style={{
            padding: '10px 20px',
            border: '3px solid #000',
            background: '#ff6b6b',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontFamily: 'inherit',
            textTransform: 'uppercase',
          }}
        >
          Clear All
        </button>
      </div>

      {/* Flagged List Summary */}
      {flaggedCount > 0 && (
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          background: '#fff0f0',
          border: '3px solid #ff0000',
        }}>
          <h3 style={{ marginBottom: '10px', fontWeight: 'bold' }}>Flagged Pedals ({flaggedCount}):</h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {Object.entries(flaggedPedals).map(([id, data]) => (
              <div key={id} style={{ 
                padding: '5px 10px', 
                borderBottom: '1px solid #fcc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span>
                  <strong>{data.brand} {data.model}</strong> - {data.currentSubtype}
                  {data.suggestedSubtype && (
                    <span style={{ color: '#228be6' }}> → {data.suggestedSubtype}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {CATEGORY_ORDER.map(cat => {
        if (!grouped[cat]) return null;
        return (
          <div key={cat} style={{ marginBottom: '40px' }}>
            <div style={{ 
              background: '#000',
              color: '#fff',
              padding: '15px',
              fontSize: '24px',
              textTransform: 'uppercase',
              marginBottom: '10px'
            }}>
              {cat}
            </div>

            {Object.keys(grouped[cat]).sort().map(subtype => {
              const pedalsInSubtype = grouped[cat][subtype].sort((a, b) => 
                a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model)
              );

              return (
                <div key={subtype} style={{ 
                  marginBottom: '30px',
                  padding: '15px',
                  background: '#fff',
                  border: '3px solid #000'
                }}>
                  <div style={{ 
                    fontSize: '18px',
                    fontWeight: 'bold',
                    marginBottom: '15px',
                    padding: '10px',
                    background: '#e8e8e8',
                    border: '2px solid #000',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>{subtype}</span>
                    <span style={{ background: '#ffd700', padding: '5px 10px', fontSize: '14px' }}>
                      {pedalsInSubtype.length} pedals
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '15px'
                  }}>
                    {pedalsInSubtype.map(pedal => {
                      const isFlagged = flaggedPedals[pedal.id];
                      return (
                        <div 
                          key={pedal.id}
                          style={{
                            border: `3px solid ${isFlagged ? '#ff0000' : '#000'}`,
                            background: isFlagged ? '#fff0f0' : '#fff',
                            padding: '10px',
                            textAlign: 'center',
                          }}
                        >
                          {isFlagged && (
                            <div style={{
                              background: '#ff0000',
                              color: '#fff',
                              padding: '5px',
                              margin: '-10px -10px 10px -10px',
                              fontWeight: 'bold',
                              fontSize: '12px',
                            }}>
                              FLAGGED
                            </div>
                          )}
                          
                          <div style={{
                            width: '100%',
                            height: '140px',
                            margin: '0 auto 10px',
                            background: '#f0f0f0',
                            border: '2px solid #ddd',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                          }}>
                            <PedalImage pedalId={pedal.id} category={pedal.category} size="lg" />
                          </div>
                          <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                            {pedal.brand}
                          </div>
                          <div style={{ 
                            fontSize: '13px', 
                            fontWeight: 'bold', 
                            margin: '5px 0',
                            minHeight: '36px'
                          }}>
                            {pedal.model}
                          </div>
                          <div style={{ 
                            fontSize: '10px', 
                            background: '#e8e8e8',
                            padding: '3px 8px',
                            display: 'inline-block'
                          }}>
                            {pedal.subtype}
                          </div>
                          <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
                            Rating: {pedal.categoryRating}/10
                          </div>

                          {/* Suggested subtype dropdown when flagged */}
                          {isFlagged && (
                            <div style={{ marginTop: '10px' }}>
                              <select
                                value={flaggedPedals[pedal.id]?.suggestedSubtype || ''}
                                onChange={(e) => updateSuggestedSubtype(pedal.id, e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '5px',
                                  fontSize: '11px',
                                  border: '2px solid #000',
                                  fontFamily: 'inherit',
                                }}
                              >
                                <option value="">Select correct subtype...</option>
                                {(SUBTYPE_OPTIONS[pedal.category] || []).map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>
                          )}

                          <div style={{ marginTop: '10px' }}>
                            <button
                              onClick={() => toggleFlag(pedal)}
                              style={{
                                padding: '8px 12px',
                                fontSize: '11px',
                                border: '2px solid #000',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                background: isFlagged ? '#69db7c' : '#ff6b6b',
                                fontWeight: 'bold',
                              }}
                            >
                              {isFlagged ? 'UNFLAG' : 'FLAG'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
