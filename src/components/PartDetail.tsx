import React, { useMemo } from 'react';
import { useReader } from '../context/ReaderContext';
import { Play, ChevronLeft } from 'lucide-react';

interface PartMetadata {
  id: number;
  title: string;
  name: string;
  blurb: string;
  colorClass: string;
  description: string;
}

const PART_METADATA: PartMetadata[] = [
  {
    id: 1,
    title: 'PART I',
    name: 'BACK ON THE PATH',
    blurb: 'A road of old wounds and harder choices.',
    colorClass: 'cover-part-1',
    description: 'Jack Morningstar returns to the Path in the volatile aftermath of Nilfgaard’s victory. Tracking unusual contract markings across poorer hamlets, he uncovers the surveillance net of Sorel’s institutional Black Ink agents.'
  },
  {
    id: 2,
    title: 'PART II',
    name: 'CORVO BIANCO AND OLD LOVES',
    blurb: 'Peace is a house with old swords still within reach.',
    colorClass: 'cover-part-2',
    description: 'Following paths that avoid legal checkpoints, Jack arrives at the vineyard of Corvo Bianco. Reuniting with Geralt, Triss, and Yennefer, they study Vesemir’s cached notes to discover why Sorel is collecting data on elder witcher bloodlines.'
  },
  {
    id: 3,
    title: 'PART III',
    name: 'WOLVES, INK, AND SONGS',
    blurb: 'The past is not buried if someone kept the key.',
    colorClass: 'cover-part-3',
    description: 'The search for vesemir’s caches directs Jack back to Kaer Morhen. Within the dilapidated fortress of the Wolf School, Yennefer uncovers details of the mutagen containment project, and Dandelion traces Novigrad rumors.'
  },
  {
    id: 4,
    title: 'PART IV',
    name: 'BLOOD, CROWN, AND DRAGON',
    blurb: 'A title is another kind of cage.',
    colorClass: 'cover-part-4',
    description: 'Cirilla’s entrance as Empress-elect of Nilfgaard brings royal courts and heavy power networks into play. Jack’s dormant bloodline symptoms begin to emerge, and Jacob’s military proof is uncovered.'
  },
  {
    id: 5,
    title: 'PART V',
    name: 'HOUSE WITHOUT A THRONE',
    blurb: 'A father can be dead and still steer the blade.',
    colorClass: 'cover-part-5',
    description: 'As political anchors collapse and war threatens the borderlands, Geralt, Triss, and the higher vampire Regis look for solutions to Jack’s failing seals. Yennefer rejects the vessel-prison doctrine.'
  },
  {
    id: 6,
    title: 'PART VI',
    name: 'ZERRIKANIA AND THE OBSIDIAN CROWN',
    blurb: 'The land that made the bloodline will either claim Jack or reveal him.',
    colorClass: 'cover-part-6',
    description: 'To replace the failing containment seals, Jack must cross the scorching Frying Pan desert into Zerrikania. Guided by Asha and Tala, he faces Sorel’s military siege at the star-temple to make a final choice.'
  }
];

export const PartDetail: React.FC = () => {
  const { 
    selectedPartId, 
    goToLibrary, 
    setCurrentChapterId, 
    goToReading, 
    currentChapterId,
    currentParagraphIndex,
    getPartProgress,
    activeManuscript
  } = useReader();

  const partData = useMemo(() => {
    if (!selectedPartId) return null;
    
    // Find manuscript details
    const part = activeManuscript.find(p => p.part_id === selectedPartId);
    // Find static metadata details
    const meta = PART_METADATA.find(m => m.id === selectedPartId);

    if (!part || !meta) return null;

    return { part, meta };
  }, [activeManuscript, selectedPartId]);

  if (!partData) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--reader-muted-color)', fontFamily: 'var(--font-ui)' }}>
        No volume selected. <button onClick={goToLibrary}>Return to Library</button>
      </div>
    );
  }

  const { part, meta } = partData;
  const progressPercent = getPartProgress(part.part_id);

  // Calculate estimated reading time of each chapter dynamically (225 words/min)
  const getChapterReadingTime = (paragraphs: string[]) => {
    const wordCount = paragraphs.reduce((acc, p) => {
      if (p === '---') return acc;
      return acc + p.split(/\s+/).filter(Boolean).length;
    }, 0);
    const minutes = Math.max(1, Math.round(wordCount / 225));
    return `${minutes} min read`;
  };

  const handleStartReading = () => {
    // Navigate to the first chapter of this part
    if (part.chapters.length > 0) {
      // If progress is in-progress (0 < progress < 100), resume the active chapter inside it
      const activeChapInPart = part.chapters.find(c => c.chapter_id === currentChapterId);
      if (activeChapInPart) {
        setCurrentChapterId(currentChapterId);
      } else {
        // Start from first chapter
        setCurrentChapterId(part.chapters[0].chapter_id);
      }
      goToReading();
    }
  };

  const handleChapterClick = (chapterId: number) => {
    setCurrentChapterId(chapterId);
    goToReading();
  };

  return (
    <div className="library-wrapper">
      {/* 1. Header Toolbar Back arrow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '-0.5rem' }}>
        <button
          onClick={goToLibrary}
          className="btn-transition"
          style={{
            background: 'none',
            border: '1px solid var(--reader-border-color)',
            borderRadius: '6px',
            color: 'var(--reader-muted-color)',
            padding: '0.4rem 0.6rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-ui)',
            fontWeight: 500
          }}
        >
          <ChevronLeft className="w-4 h-4" /> Back to Library
        </button>
      </div>

      {/* 2. Volume Details Banner */}
      <div className="detail-banner-card">
        {/* Cover */}
        <div className={`book-cover ${meta.colorClass}`} style={{ width: '220px', height: '220px' }}>
          <span className="cover-part-label">{meta.title}</span>
          <div className="cover-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <h3 className="cover-title" style={{ fontSize: '1.1rem' }}>{meta.name}</h3>
        </div>

        {/* Info */}
        <div className="detail-banner-info">
          <span style={{ fontSize: '0.7rem', color: 'var(--color-crimson)', textTransform: 'uppercase', letterSpacing: '0.1rem', fontWeight: 600 }}>
            {meta.title}
          </span>
          <h1 style={{ 
            fontSize: '2rem', 
            fontFamily: 'var(--font-prose)', 
            fontWeight: 700, 
            textTransform: 'uppercase',
            color: 'var(--reader-color)',
            margin: 0
          }}>
            {meta.name}
          </h1>
          <p className="detail-banner-blurb">&ldquo;{meta.blurb}&rdquo;</p>
          <p className="detail-banner-description">{meta.description}</p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '220px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--reader-muted-color)', width: '36px' }}>
                {progressPercent}%
              </span>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ transform: `scaleX(${progressPercent / 100})` }} />
              </div>
            </div>

            <button onClick={handleStartReading} className="btn-gold">
              <Play className="w-3.5 h-3.5 fill-current" /> 
              {progressPercent === 100 ? 'Reread Volume' : progressPercent > 0 ? 'Continue Reading' : 'Start Reading'}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Chapters List */}
      <div>
        <h3 className="chapters-section-header">
          Chapters <span style={{ textTransform: 'none', fontWeight: 400, color: 'var(--reader-muted-color)', fontSize: '0.75rem', marginLeft: '6px' }}>({part.chapters.length} chapters)</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {part.chapters.map((chap) => {
            const isCurrent = currentChapterId === chap.chapter_id;
            const readTime = getChapterReadingTime(chap.paragraphs);
            
            // Compute status of each chapter
            let statusText = 'Not started';
            if (chap.chapter_id < currentChapterId) {
              statusText = 'Completed';
            } else if (chap.chapter_id === currentChapterId) {
              const currentChapProgress = Math.round((currentParagraphIndex / (chap.paragraphs.length || 1)) * 100);
              statusText = currentChapProgress > 0 ? `Reading (${currentChapProgress}%)` : 'Reading';
            }

            return (
              <button
                key={chap.chapter_id}
                type="button"
                onClick={() => handleChapterClick(chap.chapter_id)}
                className="chapter-row-card"
              >
                <div className="chapter-row-left">
                  <span className="chapter-row-meta" style={{
                    color: isCurrent ? 'var(--color-crimson)' : 'var(--reader-muted-color)'
                  }}>
                    Chapter {chap.chapter_id}
                  </span>
                  <h4 className="chapter-row-title" style={{
                    color: isCurrent ? 'var(--color-crimson)' : 'var(--reader-color)'
                  }}>
                    {chap.chapter_title}
                  </h4>
                  <span className="chapter-row-meta">{readTime}</span>
                </div>

                <div className="chapter-row-status" style={{
                  color: statusText.startsWith('Reading') ? 'var(--color-crimson)' : 'var(--reader-muted-color)',
                  fontWeight: statusText !== 'Not started' ? 600 : 400
                }}>
                  {statusText}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
