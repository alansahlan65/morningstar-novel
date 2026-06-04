import React from 'react';
import { ReaderProvider, useReader } from './context/ReaderContext';
import { TableOfContents } from './components/TableOfContents';
import { SettingsPanel } from './components/SettingsPanel';
import { Encyclopedia } from './components/Encyclopedia';
import { ProseViewer } from './components/ProseViewer';
import { LibraryDashboard } from './components/LibraryDashboard';
import { PartDetail } from './components/PartDetail';
import manuscriptData from './data/manuscript.json';
import { 
  Settings as SettingsIcon, 
  Compass, 
  X, 
  ChevronRight,
  BookMarked,
  ArrowLeft,
  ChevronLeft
} from 'lucide-react';

const ReaderAppContent: React.FC = () => {
  const {
    currentChapterId,
    tocOpen,
    setTocOpen,
    encOpen,
    setEncOpen,
    settingsOpen,
    setSettingsOpen,
    mobileActivePanel,
    setMobileActivePanel,
    
    // View state variables
    viewState,
    goToLibrary,
    selectedPartId
  } = useReader();

  // Find current chapter name for header display
  const currentChapterName = React.useMemo(() => {
    for (const part of manuscriptData) {
      const chap = part.chapters.find(c => c.chapter_id === currentChapterId);
      if (chap) {
        return chap.chapter_title;
      }
    }
    return '';
  }, [currentChapterId]);

  // Find current Part title (e.g. PART II) for headers
  const selectedPartTitle = React.useMemo(() => {
    if (!selectedPartId) return 'PART I';
    const part = manuscriptData.find(p => p.part_id === selectedPartId);
    return part ? part.part_title : 'PART I';
  }, [selectedPartId]);

  return (
    <div className="app-container">
      
      {/* 1. Header Bar adapting to ViewState */}
      <header className="reader-header" style={{
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0
      }}>
        
        {viewState === 'library' && (
          <>
            {/* Left Balance Spacer */}
            <div style={{ width: '40px' }} />
            
            {/* Center Branding */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <span style={{ fontSize: '0.6rem', letterSpacing: '0.1rem', color: 'var(--reader-muted-color)', fontWeight: 600, textTransform: 'uppercase' }}>
                My Library
              </span>
              <h1 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-prose)', fontWeight: 700, margin: 0, textTransform: 'uppercase', color: 'var(--reader-color)' }}>
                Morningstar
              </h1>
            </div>
            
            {/* Right Balance Spacer */}
            <div style={{ width: '40px' }} />
          </>
        )}

        {viewState === 'part-detail' && (
          <>
            {/* Left Back Arrow */}
            <button
              onClick={goToLibrary}
              aria-label="Return to library"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--reader-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--reader-panel-bg)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--reader-border-color)'
              }}
              className="btn-transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {/* Center Header Details */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <span style={{ fontSize: '0.55rem', letterSpacing: '0.1rem', color: 'var(--color-crimson)', fontWeight: 700, textTransform: 'uppercase' }}>
                {selectedPartTitle}
              </span>
              <h2 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-prose)', fontWeight: 700, margin: 0, textTransform: 'uppercase', color: 'var(--reader-color)' }}>
                Part Detail
              </h2>
            </div>
            
            {/* Right Balance Spacer */}
            <div style={{ width: '40px' }} />
          </>
        )}

        {viewState === 'reading' && (
          <>
            {/* Group back button and chapter info on the left */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Left Library back button */}
              <button
                onClick={goToLibrary}
                aria-label="Return to library"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--reader-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--reader-panel-bg)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--reader-border-color)'
                }}
                className="btn-transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              {/* Chapter Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 style={{ 
                  fontSize: '0.8rem', 
                  fontWeight: 700, 
                  fontFamily: 'var(--font-ui)', 
                  letterSpacing: '0.08rem',
                  color: 'var(--color-crimson)',
                  margin: 0,
                  textTransform: 'uppercase'
                }}>
                  Morningstar
                </h1>
                <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--reader-border-color)' }} />
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--reader-muted-color)', 
                  fontWeight: 500,
                  fontFamily: 'var(--font-ui)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05rem',
                  maxWidth: '220px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {currentChapterName.toLowerCase()}
                </span>
              </div>
            </div>

            {/* Desktop Navigation Toggles */}
            <div style={{ display: 'flex', gap: '0.5rem' }} className="desktop-controls-wrapper">
              <button
                onClick={() => setTocOpen(!tocOpen)}
                className="btn-transition"
                aria-pressed={tocOpen}
                aria-controls="reader-index-drawer"
                style={{
                  background: tocOpen ? 'var(--color-crimson-dim)' : 'transparent',
                  border: '1px solid',
                  borderColor: tocOpen ? 'var(--color-crimson)' : 'var(--reader-border-color)',
                  color: tocOpen ? 'var(--color-crimson)' : 'var(--reader-color)',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 500
                }}
              >
                <BookMarked className="w-4 h-4" /> Index
              </button>

              <button
                onClick={() => {
                  const nextOpen = !settingsOpen;
                  setSettingsOpen(nextOpen);
                  if (nextOpen) setEncOpen(false);
                }}
                className="btn-transition"
                aria-pressed={settingsOpen}
                aria-controls="reader-tools-drawer"
                style={{
                  background: settingsOpen ? 'var(--color-crimson-dim)' : 'transparent',
                  border: '1px solid',
                  borderColor: settingsOpen ? 'var(--color-crimson)' : 'var(--reader-border-color)',
                  color: settingsOpen ? 'var(--color-crimson)' : 'var(--reader-color)',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 500
                }}
              >
                <SettingsIcon className="w-4 h-4" /> Settings
              </button>

              <button
                onClick={() => {
                  const nextOpen = !encOpen;
                  setEncOpen(nextOpen);
                  if (nextOpen) setSettingsOpen(false);
                }}
                className="btn-transition"
                aria-pressed={encOpen}
                aria-controls="reader-tools-drawer"
                style={{
                  background: encOpen ? 'var(--color-crimson-dim)' : 'transparent',
                  border: '1px solid',
                  borderColor: encOpen ? 'var(--color-crimson)' : 'var(--reader-border-color)',
                  color: encOpen ? 'var(--color-crimson)' : 'var(--reader-color)',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 500
                }}
              >
                <Compass className="w-4 h-4" /> Lore
              </button>
            </div>
          </>
        )}

        <style>{`
          @media (max-width: 1024px) {
            .desktop-controls-wrapper {
              display: none !important;
            }
          }
        `}</style>
      </header>

      {/* 2. Sidebars & Reading View Switch */}
      {viewState === 'library' && (
        <main style={{ gridColumn: '1 / -1', gridRow: 2, display: 'flex', width: '100%', justifyContent: 'center' }}>
          <LibraryDashboard />
        </main>
      )}

      {viewState === 'part-detail' && (
        <main style={{ gridColumn: '1 / -1', gridRow: 2, display: 'flex', width: '100%', justifyContent: 'center' }}>
          <PartDetail />
        </main>
      )}

      {viewState === 'reading' && (
        <>
          {/* Desktop Left Collapsible TOC */}
          <aside id="reader-index-drawer" className={`desktop-drawer-toc ${tocOpen ? '' : 'collapsed'}`}>
            <TableOfContents />
          </aside>

          {/* Centered Prose Columns */}
          <main className="reader-main-layout">
            <ProseViewer />
          </main>

          {/* Desktop Right Collapsible Reader Tools */}
          <aside id="reader-tools-drawer" className={`desktop-drawer-enc ${encOpen || settingsOpen ? '' : 'collapsed'}`}>
            {settingsOpen ? <SettingsPanel /> : <Encyclopedia />}
          </aside>
        </>
      )}

      {/* 3. Mobile Fixed Bottom Navigation Bar (Shown only in Reading View) */}
      {viewState === 'reading' && (
        <footer className="reader-footer" style={{
          height: '55px',
          display: 'none', // Shown only on mobile via media queries
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 0.5rem',
          position: 'sticky',
          bottom: 0
        }}>
          <button
            onClick={() => setMobileActivePanel(mobileActivePanel === 'toc' ? 'none' : 'toc')}
            aria-pressed={mobileActivePanel === 'toc'}
            style={{
              background: 'none',
              border: 'none',
              color: mobileActivePanel === 'toc' ? 'var(--color-crimson)' : 'var(--reader-muted-color)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              fontSize: '0.6rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)'
            }}
          >
            <BookMarked className="w-5 h-5" />
            Index
          </button>

          <button
            onClick={() => setMobileActivePanel(mobileActivePanel === 'settings' ? 'none' : 'settings')}
            aria-pressed={mobileActivePanel === 'settings'}
            style={{
              background: 'none',
              border: 'none',
              color: mobileActivePanel === 'settings' ? 'var(--color-crimson)' : 'var(--reader-muted-color)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              fontSize: '0.6rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)'
            }}
          >
            <SettingsIcon className="w-5 h-5" />
            Settings
          </button>

          <button
            onClick={() => setMobileActivePanel(mobileActivePanel === 'enc' ? 'none' : 'enc')}
            aria-pressed={mobileActivePanel === 'enc'}
            style={{
              background: 'none',
              border: 'none',
              color: mobileActivePanel === 'enc' ? 'var(--color-crimson)' : 'var(--reader-muted-color)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              fontSize: '0.6rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)'
            }}
          >
            <Compass className="w-5 h-5" />
            Lore
          </button>
        </footer>
      )}

      {/* Media query to toggle mobile footer visibility */}
      <style>{`
        @media (max-width: 1024px) {
          .reader-footer {
            display: flex !important;
          }
        }
      `}</style>

      {/* 4. Mobile Slide-Up Bottom Sheets (Shown only in Reading View) */}
      {viewState === 'reading' && (
        <>
          <div 
            className={`mobile-bottom-sheet-overlay ${mobileActivePanel === 'none' ? 'hidden' : ''}`}
            onClick={() => setMobileActivePanel('none')}
          />

          <div
            className={`mobile-bottom-sheet ${mobileActivePanel !== 'none' ? '' : 'hidden'}`}
            style={{
              maxHeight: '75vh',
              overflowY: 'auto'
            }}
            role={mobileActivePanel !== 'none' ? 'dialog' : undefined}
            aria-modal={mobileActivePanel !== 'none' ? 'true' : undefined}
            aria-label={mobileActivePanel !== 'none' ? 'Reader panel' : undefined}
            aria-hidden={mobileActivePanel === 'none'}
          >
            {/* Close Button on Mobile Sheets */}
            <button
              onClick={() => setMobileActivePanel('none')}
              aria-label="Close reader panel"
              style={{
                position: 'absolute',
                right: '1rem',
                top: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--reader-muted-color)',
                padding: '4px'
              }}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Dynamic Panel Content */}
            {mobileActivePanel === 'toc' && <TableOfContents />}
            {mobileActivePanel === 'settings' && <SettingsPanel />}
            {mobileActivePanel === 'enc' && <Encyclopedia />}
          </div>
        </>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ReaderProvider>
      <ReaderAppContent />
    </ReaderProvider>
  );
};

export default App;
