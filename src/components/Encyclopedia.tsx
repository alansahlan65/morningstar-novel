import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import encyclopediaData from '../data/encyclopedia.json';
import { Search, User, MapPin, Sparkles, ChevronDown, ChevronUp, X } from 'lucide-react';

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

interface PortraitAsset {
  label: string;
  file: string;
  load: () => Promise<string>;
}

const portraitModules = import.meta.glob('../../Novel Cast Portrait/*.png', {
  query: '?url',
  import: 'default'
}) as Record<string, (() => Promise<string>) | undefined>;

const portraitFileByEntryId: Record<string, readonly { file: string; label?: string }[]> = {
  jack: [{ file: 'jack_morningstar.png' }],
  buck: [{ file: 'buck.png' }],
  mara: [{ file: 'mara_veyr.png' }],
  geralt: [{ file: 'geralt_of_rivia.png' }],
  sorel: [{ file: 'sorel_veyrane.png' }],
  rian: [{ file: 'rian.png' }],
  ciri: [{ file: 'ciri.png' }],
  triss: [{ file: 'triss_merigold.png' }],
  ilyra: [{ file: 'ilyra_sarn.png' }],
  yennefer: [{ file: 'yennefer_of_vengerberg.png' }],
  zoltan: [{ file: 'zoltan_chivay.png' }],
  dandelion: [{ file: 'dandelion.png' }],
  priscilla: [{ file: 'priscilla.png' }],
  keira: [{ file: 'keira_metz.png' }],
  lambert: [{ file: 'lambert.png' }],
  eskel: [{ file: 'eskel.png' }],
  asha: [{ file: 'asha_of_the_faithel.png' }],
  vharakthul: [{ file: 'vharakthul.png' }],
  ciri_imperial_circle: [{ file: 'ciri_imperial_circle.png' }],
  emhyr: [{ file: 'emhyr_var_emreis.png' }],
  jacob_helena: [
    { file: 'jacob_morningstar.png', label: 'Jacob Morningstar' },
    { file: 'helena_morningstar.png', label: 'Helena Morningstar' }
  ],
  zerrikanterment: [{ file: 'zerrikanterment.png' }],
  roche_ves: [
    { file: 'vernon_roche.png', label: 'Vernon Roche' },
    { file: 'ves.png', label: 'Ves' }
  ],
  cazren: [{ file: 'brother_cazren.png' }],
  regis: [{ file: 'regis.png' }],
  cerys: [{ file: 'cerys_an_craite.png' }],
  ermion: [{ file: 'ermion.png' }],
  saesenthessis: [{ file: 'saesenthessis.png' }],
  tala: [{ file: 'tala.png' }],
  nadir: [{ file: 'nadir.png' }],
  sera: [{ file: 'sera.png' }]
};

const getPortraitAssets = (entry: Entry): PortraitAsset[] => {
  const files = portraitFileByEntryId[entry.id] ?? [];
  return files.flatMap(({ file, label }) => {
    const load = portraitModules[`../../Novel Cast Portrait/${file}`];
    return load ? [{ label: label ?? entry.name, file, load }] : [];
  });
};

const usePortraitSrc = (load: () => Promise<string>, shouldLoad: boolean) => {
  const [src, setSrc] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loaded' | 'error'>('idle');
  const requestedRef = useRef(false);

  useEffect(() => {
    if (!shouldLoad || src || requestedRef.current) {
      return;
    }

    let isCurrent = true;
    requestedRef.current = true;
    load()
      .then((loadedSrc) => {
        if (!isCurrent) {
          return;
        }
        setSrc(loadedSrc);
        setStatus('loaded');
      })
      .catch(() => {
        if (isCurrent) {
          setStatus('error');
        }
      });

    return () => {
      isCurrent = false;
      requestedRef.current = false;
    };
  }, [load, shouldLoad, src]);

  return {
    src,
    status: shouldLoad && !src && status !== 'error' ? 'loading' : status
  };
};

const CastPortraitTrigger: React.FC<{
  asset: PortraitAsset;
  entryName: string;
  onOpen: () => void;
}> = ({ asset, entryName, onOpen }) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(() => (
    typeof window !== 'undefined' && !('IntersectionObserver' in window)
  ));
  const { src, status } = usePortraitSrc(asset.load, shouldLoad);

  useEffect(() => {
    const node = buttonRef.current;
    if (!node) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '160px' }
    );
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <button
      ref={buttonRef}
      type="button"
      className="cast-portrait-trigger"
      data-loading={status === 'loading' || status === 'idle'}
      onClick={onOpen}
      aria-label={`Preview portrait of ${entryName}`}
      title={`Preview ${entryName}`}
    >
      {src ? (
        <img src={src} alt="" aria-hidden="true" loading="lazy" decoding="async" />
      ) : (
        <User className="cast-portrait-trigger-fallback" aria-hidden="true" />
      )}
    </button>
  );
};

const CastPortraitPreview: React.FC<{ asset: PortraitAsset; showCaption: boolean }> = ({ asset, showCaption }) => {
  const { src, status } = usePortraitSrc(asset.load, true);

  return (
    <figure className="cast-portrait-frame">
      <div className="cast-portrait-image-crop" data-loading={status === 'loading' || status === 'idle'} data-error={status === 'error'}>
        {src ? (
          <img src={src} alt={`${asset.label} portrait`} decoding="async" />
        ) : status === 'error' ? (
          <span className="cast-portrait-image-status">Portrait unavailable</span>
        ) : (
          <span className="cast-portrait-image-status">Loading portrait</span>
        )}
      </div>
      {showCaption && <figcaption>{asset.label}</figcaption>}
    </figure>
  );
};

export const Encyclopedia: React.FC<{ isFullWidth?: boolean }> = ({ isFullWidth = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'character' | 'region'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activePortrait, setActivePortrait] = useState<{ entry: Entry; assets: PortraitAsset[] } | null>(null);

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

  const closePortrait = useCallback(() => setActivePortrait(null), []);

  useEffect(() => {
    if (!activePortrait) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePortrait();
      }
    };

    const previousOverflow = document.body.style.overflow;
    const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    window.setTimeout(() => {
      document.querySelector<HTMLButtonElement>('[data-cast-portrait-close]')?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      activeElement?.focus();
    };
  }, [activePortrait, closePortrait]);

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
            const portraitAssets = e.type === 'Character' ? getPortraitAssets(e) : [];
            const hasPortrait = portraitAssets.length > 0;
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
                <div
                  className="encyclopedia-entry-header"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'var(--reader-color)'
                  }}
                >
                  <div className="encyclopedia-entry-leading">
                    {hasPortrait ? (
                      <CastPortraitTrigger
                        asset={portraitAssets[0]}
                        entryName={e.name}
                        onOpen={() => setActivePortrait({ entry: e, assets: portraitAssets })}
                      />
                    ) : e.type === 'Character' ? (
                      <span className="encyclopedia-static-icon" aria-hidden="true">
                        <User style={{ width: '0.95rem', height: '0.95rem', color: 'var(--color-crimson)' }} />
                      </span>
                    ) : (
                      <span className="encyclopedia-static-icon" aria-hidden="true">
                        <MapPin style={{ width: '0.95rem', height: '0.95rem', color: 'var(--color-crimson)' }} />
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => toggleExpand(e.id)}
                    aria-expanded={isExpanded}
                    className="encyclopedia-entry-summary-button"
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{e.name}</div>
                      {e.title && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--reader-muted-color)', marginTop: '2px' }}>
                          {e.title}
                        </div>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp style={{ width: '0.95rem', height: '0.95rem', color: 'var(--reader-muted-color)', flexShrink: 0 }} />
                    ) : (
                      <ChevronDown style={{ width: '0.95rem', height: '0.95rem', color: 'var(--reader-muted-color)', flexShrink: 0 }} />
                    )}
                  </button>
                </div>

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
      {activePortrait && createPortal(
        <div className="cast-portrait-modal-backdrop" role="presentation" onMouseDown={closePortrait}>
          <section
            className="cast-portrait-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cast-portrait-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="cast-portrait-modal-header">
              <div>
                <h2 id="cast-portrait-modal-title">{activePortrait.entry.name}</h2>
                {activePortrait.entry.title && <p>{activePortrait.entry.title}</p>}
              </div>
              <button
                type="button"
                className="cast-portrait-close-button"
                onClick={closePortrait}
                aria-label="Close portrait preview"
                data-cast-portrait-close
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <div className={`cast-portrait-frame-grid ${activePortrait.assets.length > 1 ? 'multi' : ''}`}>
              {activePortrait.assets.map((asset) => (
                <CastPortraitPreview asset={asset} showCaption={activePortrait.assets.length > 1} key={asset.file} />
              ))}
            </div>
          </section>
        </div>,
        document.body
      )}
    </div>
  );
};
