import React from 'react';
import { useReader } from '../context/ReaderContext';
import type { ReaderSettings } from '../context/ReaderContext';
import { Sun, Moon, AlignLeft, AlignJustify, Type } from 'lucide-react';

export const SettingsPanel: React.FC<{ isFullWidth?: boolean }> = ({ isFullWidth = false }) => {
  const { settings, updateSetting } = useReader();

  const themes: { value: ReaderSettings['theme']; label: string; icon: React.ReactNode }[] = [
    { value: 'dark', label: 'Dark Mode', icon: <Moon className="w-4 h-4" /> },
    { value: 'light', label: 'Light Mode', icon: <Sun className="w-4 h-4" /> },
  ];

  const fontSizes: { value: ReaderSettings['fontSize']; label: string }[] = [
    { value: '0.95rem', label: 'Small' },
    { value: '1.05rem', label: 'Medium' },
    { value: '1.125rem', label: 'Default' },
    { value: '1.25rem', label: 'Large' },
    { value: '1.375rem', label: 'Extra Large' },
  ];

  const lineSpacings: { value: ReaderSettings['lineSpacing']; label: string }[] = [
    { value: '1.4', label: 'Compact' },
    { value: '1.6', label: 'Comfortable' },
    { value: '1.8', label: 'Spacious' },
  ];

  const contentWidths: { value: ReaderSettings['contentWidth']; label: string }[] = [
    { value: '55ch', label: 'Narrow' },
    { value: '65ch', label: 'Normal' },
    { value: '75ch', label: 'Wide' },
  ];

  const alignments: { value: ReaderSettings['textAlign']; label: string; icon: React.ReactNode }[] = [
    { value: 'left', label: 'Left Aligned', icon: <AlignLeft className="w-4 h-4" /> },
    { value: 'justify', label: 'Justified', icon: <AlignJustify className="w-4 h-4" /> },
  ];

  return (
    <div style={{ padding: isFullWidth ? '0' : '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {!isFullWidth && (
        <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1rem', color: 'var(--reader-muted-color)', borderBottom: '1px solid var(--reader-border-color)', paddingBottom: '0.5rem', fontFamily: 'var(--font-ui)', fontWeight: 600 }}>
          Reading Settings
        </h3>
      )}

      <div style={{
        display: isFullWidth ? 'grid' : 'flex',
        gridTemplateColumns: isFullWidth ? 'repeat(auto-fill, minmax(280px, 1fr))' : undefined,
        flexDirection: isFullWidth ? undefined : 'column',
        gap: '1.5rem',
        width: '100%'
      }}>

      {/* Theme Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--reader-muted-color)', letterSpacing: '0.05rem' }}>Theme</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => updateSetting('theme', t.value)}
              className="btn-transition"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.6rem 0.5rem',
                border: '1px solid',
                borderColor: settings.theme === t.value ? 'var(--color-crimson)' : 'var(--reader-border-color)',
                backgroundColor: settings.theme === t.value ? 'var(--color-crimson-dim)' : 'transparent',
                color: settings.theme === t.value ? 'var(--color-crimson)' : 'var(--reader-color)',
                borderRadius: '6px',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: settings.theme === t.value ? 600 : 400
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--reader-muted-color)', letterSpacing: '0.05rem' }}>
          <Type className="w-3.5 h-3.5" /> Text Size
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {fontSizes.map((size) => (
            <button
              key={size.value}
              onClick={() => updateSetting('fontSize', size.value)}
              className="btn-transition"
              style={{
                flex: '1 0 calc(33.3% - 0.35rem)',
                padding: '0.5rem',
                fontSize: '0.75rem',
                border: '1px solid',
                borderColor: settings.fontSize === size.value ? 'var(--color-crimson)' : 'var(--reader-border-color)',
                backgroundColor: settings.fontSize === size.value ? 'var(--color-crimson-dim)' : 'transparent',
                color: settings.fontSize === size.value ? 'var(--color-crimson)' : 'var(--reader-color)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'var(--font-ui)'
              }}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      {/* Line Spacing */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--reader-muted-color)', letterSpacing: '0.05rem' }}>Line Height</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
          {lineSpacings.map((spacing) => (
            <button
              key={spacing.value}
              onClick={() => updateSetting('lineSpacing', spacing.value)}
              className="btn-transition"
              style={{
                padding: '0.5rem 0.25rem',
                fontSize: '0.75rem',
                border: '1px solid',
                borderColor: settings.lineSpacing === spacing.value ? 'var(--color-crimson)' : 'var(--reader-border-color)',
                backgroundColor: settings.lineSpacing === spacing.value ? 'var(--color-crimson-dim)' : 'transparent',
                color: settings.lineSpacing === spacing.value ? 'var(--color-crimson)' : 'var(--reader-color)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'var(--font-ui)'
              }}
            >
              {spacing.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Width */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--reader-muted-color)', letterSpacing: '0.05rem' }}>Reading Lane</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
          {contentWidths.map((width) => (
            <button
              key={width.value}
              onClick={() => updateSetting('contentWidth', width.value)}
              className="btn-transition"
              style={{
                padding: '0.5rem 0.25rem',
                fontSize: '0.75rem',
                border: '1px solid',
                borderColor: settings.contentWidth === width.value ? 'var(--color-crimson)' : 'var(--reader-border-color)',
                backgroundColor: settings.contentWidth === width.value ? 'var(--color-crimson-dim)' : 'transparent',
                color: settings.contentWidth === width.value ? 'var(--color-crimson)' : 'var(--reader-color)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'var(--font-ui)'
              }}
            >
              {width.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alignment */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--reader-muted-color)', letterSpacing: '0.05rem' }}>Text Alignment</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {alignments.map((align) => (
            <button
              key={align.value}
              onClick={() => updateSetting('textAlign', align.value)}
              className="btn-transition"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                padding: '0.5rem',
                border: '1px solid',
                borderColor: settings.textAlign === align.value ? 'var(--color-crimson)' : 'var(--reader-border-color)',
                backgroundColor: settings.textAlign === align.value ? 'var(--color-crimson-dim)' : 'transparent',
                color: settings.textAlign === align.value ? 'var(--color-crimson)' : 'var(--reader-color)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.75rem'
              }}
            >
              {align.icon}
              {align.label}
            </button>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};
