import React, { useState, useMemo } from 'react';
import encyclopediaData from '../data/encyclopedia.json';
import { Search, User, MapPin, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface Entry {
  id: string;
  name: string;
  title?: string;
  type: string;
  factions?: string[];
  description: string;
  details: string;
  revealChapter?: number;
  spoilerLevel?: string;
}

export const Encyclopedia: React.FC<{ isFullWidth?: boolean }> = ({ isFullWidth = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'character' | 'region'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Combine data into a single list
  const entries = useMemo(() => {
    const combined: Entry[] = [
      ...encyclopediaData.characters,
      ...encyclopediaData.regions
    ];
    return combined;
  }, []);

  // Filter entries based on search query and category tab
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (e.title && e.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (e.factions && e.factions.some(f => f.toLowerCase().includes(searchQuery.toLowerCase())));
      
      const matchesFilter = filterType === 'all' || e.type.toLowerCase() === filterType;
      
      return matchesSearch && matchesFilter;
    });
  }, [entries, searchQuery, filterType]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div style={{ padding: isFullWidth ? '0' : '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', width: '100%' }}>
      {!isFullWidth && (
        <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1rem', color: 'var(--reader-muted-color)', borderBottom: '1px solid var(--reader-border-color)', paddingBottom: '0.5rem', fontFamily: 'var(--font-ui)', fontWeight: 600 }}>
          Encyclopedia
        </h3>
      )}

      {/* Search Input & Filter Tabs container */}
      <div className={`encyclopedia-search-row ${isFullWidth ? 'full-width' : ''}`}>
        {/* Search Input */}
        <div className="encyclopedia-search-input-wrapper">
          <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--reader-muted-color)' }} />
          <input
            type="text"
            aria-label="Search encyclopedia"
            placeholder="Search characters, regions, factions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 0.6rem 0.6rem 2.25rem',
              fontSize: '0.8rem',
              borderRadius: '6px',
              border: '1px solid var(--reader-border-color)',
              backgroundColor: 'var(--reader-bg)',
              color: 'var(--reader-color)',
              fontFamily: 'var(--font-ui)',
              outline: 'none'
            }}
          />
        </div>

        {/* Filter Tabs */}
        <div className="encyclopedia-filter-tabs-wrapper">
          {(['all', 'character', 'region'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              aria-pressed={filterType === type}
              style={{
                padding: '0.4rem 0',
                fontSize: '0.75rem',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: filterType === type ? 'var(--reader-panel-bg)' : 'transparent',
                color: filterType === type ? 'var(--color-crimson)' : 'var(--reader-muted-color)',
                fontWeight: filterType === type ? 600 : 400,
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontFamily: 'var(--font-ui)',
                transition: 'background-color 0.2s ease, color 0.2s ease'
              }}
            >
              {type === 'all' ? 'All' : type === 'character' ? 'Casts' : 'Regions'}
            </button>
          ))}
        </div>
      </div>

      {/* List items */}
      <div style={{
        display: isFullWidth ? 'grid' : 'flex',
        gridTemplateColumns: isFullWidth ? 'repeat(auto-fill, minmax(320px, 1fr))' : undefined,
        flexDirection: isFullWidth ? undefined : 'column',
        gap: isFullWidth ? '1rem' : '0.5rem',
        overflowY: 'auto',
        flex: 1,
        paddingRight: '2px'
      }}>
        {filteredEntries.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--reader-muted-color)', fontSize: '0.8rem', fontStyle: 'italic', fontFamily: 'var(--font-ui)' }}>
            No entries found matching search query.
          </div>
        ) : (
          filteredEntries.map((e) => {
            const isExpanded = expandedId === e.id;
            return (
              <div
                key={e.id}
                style={{
                  border: '1px solid var(--reader-border-color)',
                  borderRadius: '6px',
                  backgroundColor: isExpanded ? 'var(--reader-bg)' : 'transparent',
                  overflow: 'hidden',
                  transition: 'background-color 0.2s ease',
                  flexShrink: 0
                }}
              >
                {/* Header */}
                <button
                  onClick={() => toggleExpand(e.id)}
                  aria-expanded={isExpanded}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'var(--reader-color)',
                    fontFamily: 'var(--font-ui)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {e.type === 'Character' ? (
                      <User style={{ width: '0.95rem', height: '0.95rem', color: 'var(--color-crimson)' }} />
                    ) : (
                      <MapPin style={{ width: '0.95rem', height: '0.95rem', color: 'var(--color-crimson)' }} />
                    )}
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{e.name}</div>
                      {e.title && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--reader-muted-color)', marginTop: '2px' }}>
                          {e.title}
                        </div>
                      )}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp style={{ width: '0.95rem', height: '0.95rem', color: 'var(--reader-muted-color)' }} />
                  ) : (
                    <ChevronDown style={{ width: '0.95rem', height: '0.95rem', color: 'var(--reader-muted-color)' }} />
                  )}
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div
                    style={{
                      padding: '0 0.85rem 0.85rem 0.85rem',
                      fontSize: '0.75rem',
                      color: 'var(--reader-color)',
                      borderTop: '1px solid var(--reader-border-color)',
                      paddingTop: '0.75rem',
                      fontFamily: 'var(--font-ui)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem',
                      backgroundColor: 'var(--reader-panel-bg)'
                    }}
                  >
                    {/* Factions */}
                    {e.factions && e.factions.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: 'var(--reader-muted-color)', fontSize: '0.65rem', textTransform: 'uppercase', marginRight: '4px' }}>Factions:</span>
                        {e.factions.map(f => (
                          <span
                            key={f}
                            style={{
                              padding: '2px 6px',
                              backgroundColor: 'var(--reader-bg)',
                              border: '1px solid var(--reader-border-color)',
                              borderRadius: '4px',
                              fontSize: '0.65rem',
                              color: 'var(--color-crimson)'
                            }}
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Summary */}
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--reader-muted-color)', fontSize: '0.65rem', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Description</span>
                      <p style={{ lineHeight: '1.4', color: 'var(--reader-color)' }}>{e.description}</p>
                    </div>

                    {/* Full details */}
                    <div>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600, color: 'var(--color-crimson)', fontSize: '0.65rem', textTransform: 'uppercase', marginBottom: '2px' }}>
                        <Sparkles style={{ width: '0.65rem', height: '0.65rem' }} /> Detailed Lore
                      </span>
                      <p style={{ lineHeight: '1.4', color: 'var(--reader-color)', fontStyle: 'italic', border: '1px solid var(--reader-border-color)', borderRadius: '4px', padding: '0.55rem 0.65rem', backgroundColor: 'var(--reader-bg)' }}>
                        {e.details}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
