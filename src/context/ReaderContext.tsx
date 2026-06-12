/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DEFAULT_MANUSCRIPT_POV,
  MANUSCRIPTS,
  type ManuscriptData,
  type ManuscriptPov,
} from '../data/manuscripts';

export interface Bookmark {
  chapterId: number;
  paragraphIndex: number;
  textSnippet: string;
  timestamp: number;
}

export interface ReaderSettings {
  theme: 'dark' | 'light';
  manuscriptPov: ManuscriptPov;
  fontSize: '0.95rem' | '1.05rem' | '1.125rem' | '1.25rem' | '1.375rem';
  lineSpacing: '1.4' | '1.6' | '1.8';
  contentWidth: '55ch' | '65ch' | '75ch';
  textAlign: 'left' | 'justify';
}

export type ViewState = 'library' | 'part-detail' | 'reading';

interface ReaderContextType {
  settings: ReaderSettings;
  updateSetting: <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => void;
  activeManuscript: ManuscriptData;
  activeManuscriptPov: ManuscriptPov;
  currentChapterId: number;
  setCurrentChapterId: (id: number) => void;
  currentParagraphIndex: number;
  setCurrentParagraphIndex: (idx: number) => void;
  bookmarks: Bookmark[];
  addBookmark: (paragraphIndex: number, textSnippet: string) => void;
  removeBookmark: (timestamp: number) => void;
  tocOpen: boolean;
  setTocOpen: (open: boolean) => void;
  encOpen: boolean;
  setEncOpen: (open: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  mobileActivePanel: 'none' | 'toc' | 'settings' | 'enc';
  setMobileActivePanel: (panel: 'none' | 'toc' | 'settings' | 'enc') => void;
  
  // Dashboard view state routing variables
  viewState: ViewState;
  selectedPartId: number | null;
  goToLibrary: () => void;
  goToPartDetail: (partId: number) => void;
  goToReading: () => void;
  
  // Progress computations
  getBookProgress: () => number;
  getPartProgress: (partId: number) => number;
}

const ReaderContext = createContext<ReaderContextType | undefined>(undefined);

const DEFAULT_SETTINGS: ReaderSettings = {
  theme: 'dark',
  manuscriptPov: DEFAULT_MANUSCRIPT_POV,
  fontSize: '1.125rem',
  lineSpacing: '1.6',
  contentWidth: '65ch',
  textAlign: 'justify',
};

const getPovStorageKey = (pov: ManuscriptPov, key: string) => `morningstar-${pov}-${key}`;

const readProgress = (pov: ManuscriptPov) => {
  try {
    const chapterKey = getPovStorageKey(pov, 'current-chapter');
    const paragraphKey = getPovStorageKey(pov, 'current-paragraph');
    const savedChapter = localStorage.getItem(chapterKey);
    const savedParagraph = localStorage.getItem(paragraphKey);

    if (savedChapter || savedParagraph) {
      return {
        chapterId: savedChapter ? parseInt(savedChapter, 10) : 1,
        paragraphIndex: savedParagraph ? parseInt(savedParagraph, 10) : 0,
      };
    }

    if (pov === 'third-person') {
      const legacyChapter = localStorage.getItem('morningstar-current-chapter');
      const legacyParagraph = localStorage.getItem('morningstar-current-paragraph');

      if (legacyChapter || legacyParagraph) {
        return {
          chapterId: legacyChapter ? parseInt(legacyChapter, 10) : 1,
          paragraphIndex: legacyParagraph ? parseInt(legacyParagraph, 10) : 0,
        };
      }
    }
  } catch {
    // Fall through to default progress.
  }

  return { chapterId: 1, paragraphIndex: 0 };
};

const writeProgress = (pov: ManuscriptPov, chapterId: number, paragraphIndex: number) => {
  localStorage.setItem(getPovStorageKey(pov, 'current-chapter'), chapterId.toString());
  localStorage.setItem(getPovStorageKey(pov, 'current-paragraph'), paragraphIndex.toString());
};

const readBookmarks = (pov: ManuscriptPov): Bookmark[] => {
  try {
    const key = getPovStorageKey(pov, 'bookmarks');
    const saved = localStorage.getItem(key);

    if (saved) {
      return JSON.parse(saved);
    }

    if (pov === 'third-person') {
      const legacy = localStorage.getItem('morningstar-bookmarks');
      return legacy ? JSON.parse(legacy) : [];
    }
  } catch {
    return [];
  }

  return [];
};

const writeBookmarks = (pov: ManuscriptPov, bookmarks: Bookmark[]) => {
  localStorage.setItem(getPovStorageKey(pov, 'bookmarks'), JSON.stringify(bookmarks));
};

export const ReaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load settings
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    try {
      const saved = localStorage.getItem('morningstar-settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const activeManuscriptPov = settings.manuscriptPov;
  const activeManuscript = MANUSCRIPTS[activeManuscriptPov];

  // Load current progress
  const [currentChapterId, _setCurrentChapterId] = useState<number>(() => {
    return readProgress(settings.manuscriptPov).chapterId;
  });

  const [currentParagraphIndex, _setCurrentParagraphIndex] = useState<number>(() => {
    return readProgress(settings.manuscriptPov).paragraphIndex;
  });

  // Load bookmarks
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    return readBookmarks(settings.manuscriptPov);
  });

  // UI States (Collapsible panels)
  const [tocOpen, setTocOpen] = useState<boolean>(true);
  const [encOpen, setEncOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [mobileActivePanel, setMobileActivePanel] = useState<'none' | 'toc' | 'settings' | 'enc'>('none');

  // Dashboard routing states
  const [viewState, setViewState] = useState<ViewState>(() => {
    try {
      const saved = localStorage.getItem('morningstar-view-state');
      return (saved as ViewState) || 'library';
    } catch {
      return 'library';
    }
  });

  const [selectedPartId, setSelectedPartId] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('morningstar-selected-part');
      return saved ? parseInt(saved, 10) : null;
    } catch {
      return null;
    }
  });

  // Synchronize state changes to localStorage and CSS variables
  const updateSetting = <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => {
    setSettings((prev) => {
      if (key === 'manuscriptPov' && value !== prev.manuscriptPov) {
        writeProgress(prev.manuscriptPov, currentChapterId, currentParagraphIndex);
        const nextProgress = readProgress(value as ManuscriptPov);
        _setCurrentChapterId(nextProgress.chapterId);
        _setCurrentParagraphIndex(nextProgress.paragraphIndex);
        setBookmarks(readBookmarks(value as ManuscriptPov));
      }

      const next = { ...prev, [key]: value };
      localStorage.setItem('morningstar-settings', JSON.stringify(next));
      return next;
    });
  };

  const setCurrentChapterId = (id: number) => {
    _setCurrentChapterId(id);
    _setCurrentParagraphIndex(0); // Reset scroll offset to top when chapter changes
    writeProgress(activeManuscriptPov, id, 0);
  };

  const setCurrentParagraphIndex = (idx: number) => {
    _setCurrentParagraphIndex(idx);
    writeProgress(activeManuscriptPov, currentChapterId, idx);
  };

  // Sync settings properties on load and settings change
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', settings.theme);
    root.style.setProperty('--reader-font-size', settings.fontSize);
    root.style.setProperty('--reader-line-height', settings.lineSpacing);
    root.style.setProperty('--reader-max-width', settings.contentWidth);
    root.style.setProperty('--reader-text-align', settings.textAlign);
  }, [settings]);

  // Sync bookmarks
  const addBookmark = (paragraphIndex: number, textSnippet: string) => {
    setBookmarks((prev) => {
      const next = [
        ...prev.filter(b => !(b.chapterId === currentChapterId && b.paragraphIndex === paragraphIndex)),
        {
          chapterId: currentChapterId,
          paragraphIndex,
          textSnippet: textSnippet.slice(0, 120),
          timestamp: Date.now()
        }
      ].sort((a, b) => b.timestamp - a.timestamp); // Sorted newest first
      writeBookmarks(activeManuscriptPov, next);
      return next;
    });
  };

  const removeBookmark = (timestamp: number) => {
    setBookmarks((prev) => {
      const next = prev.filter(b => b.timestamp !== timestamp);
      writeBookmarks(activeManuscriptPov, next);
      return next;
    });
  };

  // Navigation handlers
  const goToLibrary = () => {
    setViewState('library');
    localStorage.setItem('morningstar-view-state', 'library');
  };

  const goToPartDetail = (partId: number) => {
    setSelectedPartId(partId);
    setViewState('part-detail');
    localStorage.setItem('morningstar-selected-part', partId.toString());
    localStorage.setItem('morningstar-view-state', 'part-detail');
  };

  const goToReading = () => {
    setViewState('reading');
    localStorage.setItem('morningstar-view-state', 'reading');
  };

  const getBookProgress = () => {
    const totalChapters = activeManuscript.reduce((acc, part) => acc + part.chapters.length, 0) || 1;
    const currentPart = activeManuscript.find(p => p.chapters.some(c => c.chapter_id === currentChapterId));
    if (!currentPart) return 0;
    
    const currentChap = currentPart.chapters.find(c => c.chapter_id === currentChapterId);
    if (!currentChap) return 0;

    const totalParagraphs = currentChap.paragraphs.length || 1;
    const currentChapProgress = currentParagraphIndex / totalParagraphs;

    const progress = ((currentChapterId - 1 + currentChapProgress) / totalChapters) * 100;
    return Math.round(progress);
  };

  const getPartProgress = (partId: number) => {
    const part = activeManuscript.find(p => p.part_id === partId);
    if (!part) return 0;

    const chapters = part.chapters;
    if (chapters.length === 0) return 0;

    // Check if the reader hasn't started this part
    const firstChapId = chapters[0].chapter_id;
    if (currentChapterId < firstChapId) {
      return 0;
    }

    // Check if the reader has fully completed this part
    const lastChapId = chapters[chapters.length - 1].chapter_id;
    if (currentChapterId > lastChapId) {
      return 100;
    }

    // Currently in this part
    const chaptersCompleted = currentChapterId - firstChapId;
    const currentChap = chapters.find(c => c.chapter_id === currentChapterId);
    const currentChapProgress = currentChap ? currentParagraphIndex / (currentChap.paragraphs.length || 1) : 0;

    const progress = ((chaptersCompleted + currentChapProgress) / chapters.length) * 100;
    return Math.round(progress);
  };

  return (
    <ReaderContext.Provider
      value={{
        settings,
        updateSetting,
        activeManuscript,
        activeManuscriptPov,
        currentChapterId,
        setCurrentChapterId,
        currentParagraphIndex,
        setCurrentParagraphIndex,
        bookmarks,
        addBookmark,
        removeBookmark,
        tocOpen,
        setTocOpen,
        encOpen,
        setEncOpen,
        settingsOpen,
        setSettingsOpen,
        mobileActivePanel,
        setMobileActivePanel,
        
        // Expose view router state
        viewState,
        selectedPartId,
        goToLibrary,
        goToPartDetail,
        goToReading,
        
        // Progress utilities
        getBookProgress,
        getPartProgress
      }}
    >
      {children}
    </ReaderContext.Provider>
  );
};

export const useReader = () => {
  const context = useContext(ReaderContext);
  if (!context) {
    throw new Error('useReader must be used within a ReaderProvider');
  }
  return context;
};
