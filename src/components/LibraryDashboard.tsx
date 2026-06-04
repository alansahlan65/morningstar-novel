import React, { useState } from 'react';
import { useReader } from '../context/ReaderContext';
import manuscriptData from '../data/manuscript.json';
import { Play, BookOpen, Compass, Settings as SettingsIcon } from 'lucide-react';
import { Encyclopedia } from './Encyclopedia';
import { SettingsPanel } from './SettingsPanel';

interface PartMetadata {
  id: number;
  title: string;
  name: string;
  blurb: string;
  colorClass: string;
  chaptersCount: number;
}

const PART_METADATA: PartMetadata[] = [
  {
    id: 1,
    title: 'PART I',
    name: 'BACK ON THE PATH',
    blurb: 'A road of old wounds and harder choices.',
    colorClass: 'cover-part-1',
    chaptersCount: 5
  },
  {
    id: 2,
    title: 'PART II',
    name: 'CORVO BIANCO AND OLD LOVES',
    blurb: 'Peace is a house with old swords still within reach.',
    colorClass: 'cover-part-2',
    chaptersCount: 6
  },
  {
    id: 3,
    title: 'PART III',
    name: 'WOLVES, INK, AND SONGS',
    blurb: 'The past is not buried if someone kept the key.',
    colorClass: 'cover-part-3',
    chaptersCount: 6
  },
  {
    id: 4,
    title: 'PART IV',
    name: 'BLOOD, CROWN, AND DRAGON',
    blurb: 'A title is another kind of cage.',
    colorClass: 'cover-part-4',
    chaptersCount: 7
  },
  {
    id: 5,
    title: 'PART V',
    name: 'HOUSE WITHOUT A THRONE',
    blurb: 'A father can be dead and still steer the blade.',
    colorClass: 'cover-part-5',
    chaptersCount: 7
  },
  {
    id: 6,
    title: 'PART VI',
    name: 'ZERRIKANIA AND THE OBSIDIAN CROWN',
    blurb: 'The land that made the bloodline will either claim Jack or reveal him.',
    colorClass: 'cover-part-6',
    chaptersCount: 11
  }
];

type DashboardTab = 'library' | 'lore' | 'settings';

const DASHBOARD_TABS: Array<{
  id: DashboardTab;
  label: string;
  icon: React.ReactNode;
}> = [
  { id: 'library', label: 'Library', icon: <BookOpen style={{ width: '1.1rem', height: '1.1rem' }} /> },
  { id: 'lore', label: 'Lore', icon: <Compass style={{ width: '1.1rem', height: '1.1rem' }} /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon style={{ width: '1.1rem', height: '1.1rem' }} /> }
];

export const LibraryDashboard: React.FC = () => {
  const { 
    currentChapterId, 
    goToReading, 
    goToPartDetail, 
    getBookProgress, 
    getPartProgress 
  } = useReader();

  const [activeTab, setActiveTab] = useState<DashboardTab>('library');

  // Find metadata of the part currently being read
  const currentActivePart = (() => {
    // Find which part contains the current chapter
    for (const part of manuscriptData) {
      const containsChapter = part.chapters.some(c => c.chapter_id === currentChapterId);
      if (containsChapter) {
        const meta = PART_METADATA.find(m => m.id === part.part_id);
        const chap = part.chapters.find(c => c.chapter_id === currentChapterId);
        return {
          meta,
          chapterTitle: chap ? chap.chapter_title : ''
        };
      }
    }
    return null;
  })();

  const bookProgressPercent = getBookProgress();

  const handleContinueReading = (e: React.MouseEvent) => {
    e.stopPropagation();
    goToReading();
  };

  return (
    <div className="library-wrapper">
      {/* Homepage Tab Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        borderBottom: '1px solid var(--reader-border-color)', 
        paddingBottom: '0.75rem',
        marginBottom: '2rem',
        gap: '1.5rem',
        width: '100%'
      }}>
        {DASHBOARD_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="btn-transition"
              aria-pressed={isActive}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isActive ? 'var(--color-crimson)' : 'var(--reader-muted-color)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-ui)',
                fontWeight: isActive ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 1rem',
                borderBottom: isActive ? '2px solid var(--color-crimson)' : '2px solid transparent',
                marginBottom: '-0.81rem',
                transition: 'color 0.2s ease, border-color 0.2s ease'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'library' && (
        <>
          {/* 1. Resume Progress Banner (Only if reading progress exists) */}
      <div className="resume-card">
        <div className="resume-card-left">
          <span className="resume-card-label">You're back where you left off.</span>
          <h2 className="resume-card-title">
            {currentActivePart?.meta?.name || 'BACK ON THE PATH'}
          </h2>
          <span className="resume-card-subtitle">
            {currentActivePart?.chapterTitle ? currentActivePart.chapterTitle.toLowerCase() : ''}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div className="resume-card-progress">
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--reader-muted-color)', width: '36px' }}>
              {bookProgressPercent}%
            </span>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ transform: `scaleX(${bookProgressPercent / 100})` }} />
            </div>
          </div>
          
          <button onClick={handleContinueReading} className="btn-gold">
            <Play className="w-3.5 h-3.5 fill-current" /> Continue Reading
          </button>
        </div>
      </div>

      {/* 2. Parts Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid var(--reader-border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', textTransform: 'uppercase', letterSpacing: '0.08rem', fontWeight: 700, margin: 0 }}>
            Parts
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--reader-muted-color)', fontFamily: 'var(--font-ui)' }}>
            6 volumes
          </span>
        </div>

        <div className="volume-grid">
          {PART_METADATA.map((part) => {
            const progress = getPartProgress(part.id);
            let statusText = 'Not started';
            if (progress === 100) {
              statusText = 'Completed';
            } else if (progress > 0) {
              statusText = 'Reading';
            }

            return (
              <button key={part.id} type="button" className="volume-card" onClick={() => goToPartDetail(part.id)}>
                {/* Book Cover Cover */}
                <div className={`book-cover ${part.colorClass}`}>
                  <div className="cover-header">
                    <span className="cover-part-label">{part.title}</span>
                  </div>
                  
                  <div className="cover-mark" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                  
                  <h3 className="cover-title">{part.name}</h3>
                </div>

                {/* Metadata details */}
                <div className="volume-meta">
                  <span className="volume-number-label">{part.title}</span>
                  <h4 className="volume-title-label">{part.name}</h4>
                  <p className="volume-blurb">{part.blurb}</p>
                  
                  {/* Status Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '4px' }}>
                    <span className="volume-status-tag" style={{
                      color: statusText === 'Reading' ? 'var(--color-crimson)' : 'var(--reader-muted-color)'
                    }}>
                      {statusText}
                    </span>
                    {progress > 0 && progress < 100 && (
                      <div className="progress-bar-container" style={{ width: '60px', height: '3px' }}>
                        <div className="progress-bar-fill" style={{ transform: `scaleX(${progress / 100})` }} />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      </>
      )}

      {activeTab === 'lore' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', borderBottom: '1px solid var(--reader-border-color)', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.15rem', textTransform: 'uppercase', letterSpacing: '0.08rem', fontWeight: 700, margin: 0 }}>
              Encyclopedia & Lore
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--reader-muted-color)', fontFamily: 'var(--font-ui)' }}>
              Explore the characters, regions, and factions of the Morningstar world.
            </span>
          </div>
          <Encyclopedia isFullWidth={true} />
        </div>
      )}

      {activeTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', borderBottom: '1px solid var(--reader-border-color)', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.15rem', textTransform: 'uppercase', letterSpacing: '0.08rem', fontWeight: 700, margin: 0 }}>
              Reader Preferences
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--reader-muted-color)', fontFamily: 'var(--font-ui)' }}>
              Configure typography, colors, and layout for an immersive reading experience.
            </span>
          </div>
          <SettingsPanel isFullWidth={true} />
        </div>
      )}
    </div>
  );
};
