import React, { useEffect, useRef } from 'react';
import { useReader } from '../context/ReaderContext';
import manuscriptData from '../data/manuscript.json';
import { Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import { isDocumentVoiceParagraph } from '../utils/documentVoice';

export const ProseViewer: React.FC = () => {
  const {
    currentChapterId,
    setCurrentChapterId,
    currentParagraphIndex,
    setCurrentParagraphIndex,
    bookmarks,
    addBookmark,
    removeBookmark
  } = useReader();

  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const [menuParaIndex, setMenuParaIndex] = React.useState<number | null>(null);
  const [menuCoords, setMenuCoords] = React.useState<{ x: number; y: number } | null>(null);
  const pressTimer = useRef<number | null>(null);
  const startCoords = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const startPress = (idx: number, e: React.MouseEvent | React.TouchEvent) => {
    if ('button' in e && e.button !== 0) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    startCoords.current = { x: clientX, y: clientY };

    if (pressTimer.current) {
      window.clearTimeout(pressTimer.current);
    }

    pressTimer.current = window.setTimeout(() => {
      setMenuParaIndex(idx);
      setMenuCoords({ x: clientX, y: clientY });
      if (navigator.vibrate) {
        navigator.vibrate(40);
      }
    }, 500);
  };

  const endPress = () => {
    if (pressTimer.current) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const movePress = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const dx = Math.abs(clientX - startCoords.current.x);
    const dy = Math.abs(clientY - startCoords.current.y);

    if (dx > 8 || dy > 8) {
      endPress();
    }
  };

  // 1. Locate the current Part and Chapter data
  const currentData = (() => {
    for (const part of manuscriptData) {
      const chapIdx = part.chapters.findIndex(c => c.chapter_id === currentChapterId);
      if (chapIdx !== -1) {
        return {
          part,
          chapter: part.chapters[chapIdx],
          chapterIndexInPart: chapIdx,
          isFirstChapterOfPart: chapIdx === 0
        };
      }
    }
    return null;
  })();

  // Total chapters count to handle prev/next bounds
  const totalChapters = manuscriptData.reduce((acc, part) => acc + part.chapters.length, 0);

  // 2. Set up IntersectionObserver to track current paragraph progress on scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observerOptions = {
      root: null, // viewport
      rootMargin: '-20% 0px -60% 0px', // center trigger range
      threshold: 0
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const indexAttr = entry.target.getAttribute('data-para-index');
          if (indexAttr) {
            const index = parseInt(indexAttr, 10);
            setCurrentParagraphIndex(index);
          }
        }
      });
    }, observerOptions);

    // Observe all paragraph blocks
    const paragraphs = containerRef.current?.querySelectorAll('[data-para-index]');
    paragraphs?.forEach((p) => observerRef.current?.observe(p));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [currentChapterId, setCurrentParagraphIndex]);

  // 3. Handle restoring scroll position when the chapter loads
  useEffect(() => {
    const savedParagraph = Number.parseInt(localStorage.getItem('morningstar-current-paragraph') || '0', 10);

    // Scroll to the saved paragraph index on load
    if (savedParagraph > 0) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`p-${savedParagraph}`);
        if (el) {
          el.scrollIntoView({ block: 'start' });
        }
      }, 150); // Small timeout to allow render paint
      return () => clearTimeout(timer);
    } else {
      // Scroll to top
      window.scrollTo(0, 0);
    }
  }, [currentChapterId]);

  if (!currentData) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--reader-muted-color)', fontFamily: 'var(--font-ui)' }}>
        Loading manuscript text...
      </div>
    );
  }

  const { part, chapter, isFirstChapterOfPart } = currentData;

  const isBookmarked = (paraIdx: number) => {
    return bookmarks.some(b => b.chapterId === currentChapterId && b.paragraphIndex === paraIdx);
  };

  const toggleBookmark = (paraIdx: number, text: string) => {
    const matched = bookmarks.find(b => b.chapterId === currentChapterId && b.paragraphIndex === paraIdx);
    if (matched) {
      removeBookmark(matched.timestamp);
    } else {
      addBookmark(paraIdx, text);
    }
  };

  // Navigations
  const handlePrevChapter = () => {
    if (currentChapterId > 1) {
      setCurrentChapterId(currentChapterId - 1);
    }
  };

  const handleNextChapter = () => {
    if (currentChapterId < totalChapters) {
      setCurrentChapterId(currentChapterId + 1);
    }
  };

  return (
    <div ref={containerRef} className="prose-column">
      
      {/* 4. Optional Part Opener Page (If this is Chapter 1 of a new Part) */}
      {isFirstChapterOfPart && currentParagraphIndex === 0 && (
        <div className="part-title-container">
          <span className="part-number">{part.part_title}</span>
          <h1 className="part-name">{part.part_name}</h1>
          {part.part_subtitle && (
            <p className="part-subtitle">&ldquo;{part.part_subtitle}&rdquo;</p>
          )}
        </div>
      )}

      {/* Chapter Title */}
      <h2 className="chapter-title">{chapter.chapter_title}</h2>

      {/* 5. Chapter Paragraphs Loop */}
      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {chapter.paragraphs.map((pText, idx) => {
          // Render section breaks differently
          if (pText === "---") {
            return <div key={idx} className="prose-section-break" />;
          }

          const bookmarked = isBookmarked(idx);
          const isFlush = idx === 0 || chapter.paragraphs[idx - 1] === "---";
          const isDocumentVoice = isDocumentVoiceParagraph(chapter.chapter_id, idx);

          return (
            <div
              key={idx}
              id={`p-${idx}`}
              data-para-index={idx}
              onMouseDown={(e) => startPress(idx, e)}
              onMouseUp={endPress}
              onMouseLeave={endPress}
              onMouseMove={movePress}
              onTouchStart={(e) => startPress(idx, e)}
              onTouchEnd={endPress}
              onTouchMove={movePress}
              style={{
                position: 'relative',
                display: 'flow-root',
                border: bookmarked ? '1px solid var(--color-crimson)' : '1px solid transparent',
                paddingLeft: '0.75rem',
                paddingRight: '0.75rem',
                backgroundColor: bookmarked ? 'var(--color-crimson-dim)' : 'transparent',
                borderRadius: '4px',
                transition: 'border-color 0.25s ease, background-color 0.25s ease',
                userSelect: 'text',
                marginBottom: '1.25rem',
                paddingTop: '6px',
                paddingBottom: '6px'
              }}
            >
              {/* Actual text paragraph */}
              <p className={`${isFlush ? 'flush-first' : ''}${isDocumentVoice ? ' document-voice' : ''}`} style={{ marginBottom: 0 }}>
                {pText}
              </p>
            </div>
          );
        })}
      </div>

      {/* Floating Bookmark Option Menu */}
      {menuParaIndex !== null && menuCoords && (
        <>
          {/* Transparent click backdrop to close */}
          <div 
            onClick={() => { setMenuParaIndex(null); setMenuCoords(null); }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 'var(--z-popover-backdrop)',
              backgroundColor: 'transparent'
            }}
          />
          
          {/* Centered tooltip popup */}
          <div
            style={{
              position: 'fixed',
              left: `${menuCoords.x}px`,
              top: `${menuCoords.y - 45}px`,
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--reader-panel-bg)',
              border: '1px solid var(--reader-border-color)',
              borderRadius: '6px',
              padding: '0.25rem 0.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 'var(--z-popover)',
              display: 'flex',
              alignItems: 'center',
              animation: 'fadeInUp 0.15s ease-out',
              pointerEvents: 'auto'
            }}
          >
            <button
              onClick={() => {
                const pText = chapter.paragraphs[menuParaIndex];
                toggleBookmark(menuParaIndex, pText);
                setMenuParaIndex(null);
                setMenuCoords(null);
              }}
              className="btn-transition"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--reader-color)',
                cursor: 'pointer',
                padding: '0.4rem 0.6rem',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-ui)',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                borderRadius: '4px'
              }}
            >
              <Bookmark
                style={{
                  width: '0.85rem',
                  height: '0.85rem',
                  color: isBookmarked(menuParaIndex) ? 'var(--color-crimson)' : 'var(--reader-muted-color)',
                  fill: isBookmarked(menuParaIndex) ? 'var(--color-crimson)' : 'none'
                }}
              />
              {isBookmarked(menuParaIndex) ? 'Remove Bookmark' : 'Save Bookmark'}
            </button>
          </div>
        </>
      )}

      {/* 6. Chapter Page Navigation Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '5rem',
          borderTop: '1px solid var(--reader-border-color)',
          paddingTop: '2rem',
          fontFamily: 'var(--font-ui)',
          fontSize: '0.8rem'
        }}
      >
        <button
          onClick={handlePrevChapter}
          disabled={currentChapterId === 1}
          aria-label="Go to previous chapter"
          className="btn-transition"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.5rem 1rem',
            border: '1px solid var(--reader-border-color)',
            borderRadius: '6px',
            backgroundColor: 'transparent',
            color: currentChapterId === 1 ? 'var(--reader-muted-color)' : 'var(--reader-color)',
            cursor: currentChapterId === 1 ? 'default' : 'pointer',
            opacity: currentChapterId === 1 ? 0.4 : 1
          }}
        >
          <ChevronLeft className="w-4 h-4" /> Prev Chapter
        </button>

        <span style={{ color: 'var(--reader-muted-color)', fontSize: '0.75rem', fontWeight: 500 }}>
          Chapter {currentChapterId} of {totalChapters}
        </span>

        <button
          onClick={handleNextChapter}
          disabled={currentChapterId === totalChapters}
          aria-label="Go to next chapter"
          className="btn-transition"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.5rem 1rem',
            border: '1px solid var(--reader-border-color)',
            borderRadius: '6px',
            backgroundColor: 'transparent',
            color: currentChapterId === totalChapters ? 'var(--reader-muted-color)' : 'var(--reader-color)',
            cursor: currentChapterId === totalChapters ? 'default' : 'pointer',
            opacity: currentChapterId === totalChapters ? 0.4 : 1
          }}
        >
          Next Chapter <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
