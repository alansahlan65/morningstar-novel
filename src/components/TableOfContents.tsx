import React, { useState } from 'react';
import { useReader } from '../context/ReaderContext';
import { BookOpen, Bookmark as BookmarkIcon, Trash2, Calendar } from 'lucide-react';

export const TableOfContents: React.FC = () => {
  const {
    currentChapterId,
    setCurrentChapterId,
    setCurrentParagraphIndex,
    bookmarks,
    removeBookmark,
    setMobileActivePanel,
    activeManuscript
  } = useReader();

  const [activeTab, setActiveTab] = useState<'toc' | 'bookmarks'>('toc');

  // Utility to locate Part/Chapter details from chapter ID
  const getChapterMetadata = (chapterId: number) => {
    for (const part of activeManuscript) {
      const idx = part.chapters.findIndex(c => c.chapter_id === chapterId);
      if (idx !== -1) {
        const chapter = part.chapters[idx];
        return {
          partTitle: part.part_title,
          partName: part.part_name,
          chapterTitle: chapter.chapter_title,
          chapterNumber: chapter.chapter_id
        };
      }
    }
    return null;
  };

  const handleChapterClick = (chapterId: number) => {
    setCurrentChapterId(chapterId);
    setMobileActivePanel('none'); // Close drawer on mobile
  };

  const handleBookmarkClick = (chapterId: number, paragraphIndex: number) => {
    setCurrentChapterId(chapterId);
    // Use a small timeout to let the chapter load before scrolling
    setTimeout(() => {
      setCurrentParagraphIndex(paragraphIndex);
      const el = document.getElementById(`p-${paragraphIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a temporary highlight animation to the bookmarked paragraph
        el.style.backgroundColor = 'var(--color-crimson-dim)';
        setTimeout(() => {
          el.style.backgroundColor = 'transparent';
        }, 1500);
      }
    }, 100);
    setMobileActivePanel('none'); // Close drawer on mobile
  };

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      {/* Navigation Headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', backgroundColor: 'var(--reader-bg)', padding: '2px', borderRadius: '6px', border: '1px solid var(--reader-border-color)' }}>
        <button
          onClick={() => setActiveTab('toc')}
          aria-pressed={activeTab === 'toc'}
          style={{
            padding: '0.5rem 0',
            fontSize: '0.75rem',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: activeTab === 'toc' ? 'var(--reader-panel-bg)' : 'transparent',
            color: activeTab === 'toc' ? 'var(--color-crimson)' : 'var(--reader-muted-color)',
            fontWeight: activeTab === 'toc' ? 600 : 400,
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            transition: 'background-color 0.2s ease, color 0.2s ease'
          }}
        >
          <BookOpen className="w-3.5 h-3.5" /> Index
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          aria-pressed={activeTab === 'bookmarks'}
          style={{
            padding: '0.5rem 0',
            fontSize: '0.75rem',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: activeTab === 'bookmarks' ? 'var(--reader-panel-bg)' : 'transparent',
            color: activeTab === 'bookmarks' ? 'var(--color-crimson)' : 'var(--reader-muted-color)',
            fontWeight: activeTab === 'bookmarks' ? 600 : 400,
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            transition: 'background-color 0.2s ease, color 0.2s ease'
          }}
        >
          <BookmarkIcon className="w-3.5 h-3.5" /> Bookmarks ({bookmarks.length})
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ overflowY: 'auto', flex: 1, paddingRight: '2px' }}>
        {activeTab === 'toc' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeManuscript.map((part) => (
              <div key={part.part_id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {/* Part Header */}
                <div style={{ padding: '0.25rem 0.5rem', borderBottom: '1px solid var(--reader-border-color)' }}>
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1rem', color: 'var(--color-crimson)', fontWeight: 600 }}>
                    {part.part_title}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-ui)', color: 'var(--reader-color)', marginTop: '2px', textTransform: 'uppercase' }}>
                    {part.part_name}
                  </div>
                </div>
                {/* Chapter List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {part.chapters.map((chap) => {
                    const isCurrent = currentChapterId === chap.chapter_id;
                    return (
                      <button
                        key={chap.chapter_id}
                        onClick={() => handleChapterClick(chap.chapter_id)}
                        className="btn-transition"
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: '0.5rem',
                          backgroundColor: isCurrent ? 'var(--color-crimson-dim)' : 'transparent',
                          color: isCurrent ? 'var(--color-crimson)' : 'var(--reader-color)',
                          border: 'none',
                          borderRadius: '4px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-ui)',
                          fontSize: '0.75rem',
                          fontWeight: isCurrent ? 600 : 400,
                          flexShrink: 0
                        }}
                      >
                        <span style={{ color: isCurrent ? 'var(--color-crimson)' : 'var(--reader-muted-color)', fontSize: '0.65rem', minWidth: '1.25rem' }}>
                          Ch {chap.chapter_id}
                        </span>
                        <span style={{ textTransform: 'capitalize' }}>
                          {chap.chapter_title.toLowerCase()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {bookmarks.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--reader-muted-color)', fontSize: '0.75rem', fontStyle: 'italic', fontFamily: 'var(--font-ui)' }}>
                No bookmarks saved yet. Press and hold any paragraph while reading to bookmark your spot!
              </div>
            ) : (
              bookmarks.map((b) => {
                const meta = getChapterMetadata(b.chapterId);
                const dateString = new Date(b.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                return (
                  <div
                    key={b.timestamp}
                    style={{
                      border: '1px solid var(--reader-border-color)',
                      borderRadius: '6px',
                      backgroundColor: 'var(--reader-panel-bg)',
                      padding: '0.65rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      position: 'relative',
                      flexShrink: 0
                    }}
                  >
                    {/* Header bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--reader-border-color)', paddingBottom: '0.35rem' }}>
                      <button
                        onClick={() => handleBookmarkClick(b.chapterId, b.paragraphIndex)}
                        style={{
                          background: 'none',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          color: 'var(--color-crimson)',
                          fontFamily: 'var(--font-ui)',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: 0
                        }}
                      >
                        {meta ? `Ch ${meta.chapterNumber}: ${meta.chapterTitle}` : `Chapter ${b.chapterId}`} (Paragraph {b.paragraphIndex + 1})
                      </button>
                      <button
                        onClick={() => removeBookmark(b.timestamp)}
                        aria-label="Delete bookmark"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--reader-muted-color)',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        className="btn-transition"
                      >
                        <Trash2 className="w-3.5 h-3.5 hover:text-red-500" />
                      </button>
                    </div>

                    {/* Preview Text */}
                    <p
                      onClick={() => handleBookmarkClick(b.chapterId, b.paragraphIndex)}
                      style={{
                        fontSize: '0.7rem',
                        lineHeight: '1.4',
                        color: 'var(--reader-color)',
                        cursor: 'pointer',
                        fontStyle: 'italic',
                        margin: 0
                      }}
                    >
                      &ldquo;{b.textSnippet}&rdquo;
                    </p>

                    {/* Timestamp */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6rem', color: 'var(--reader-muted-color)' }}>
                      <Calendar className="w-3 h-3" />
                      {dateString}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
