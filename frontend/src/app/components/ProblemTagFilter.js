"use client";

import { useState, useEffect, useRef } from 'react';
import { useProblemTags } from '../contexts/ProblemTagsContext';

const DIFFICULTIES = [
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
];

const chipStyle = (isSelected) => ({
  padding: '0.375rem 0.75rem',
  borderRadius: 'var(--radius)',
  border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
  backgroundColor: isSelected ? 'var(--primary)' : 'var(--surface)',
  color: isSelected ? '#fff' : 'var(--text-main)',
  fontSize: '0.8rem',
  fontWeight: '500',
  cursor: 'pointer',
});

export default function ProblemTagFilter({
  selectedTags,
  onChange,
  selectedDifficulty = '',
  onDifficultyChange,
}) {
  const { tags, loading } = useProblemTags();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const activeCount = selectedTags.length + (selectedDifficulty ? 1 : 0);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const toggleDifficulty = (value) => {
    if (!onDifficultyChange) return;
    onDifficultyChange(selectedDifficulty === value ? '' : value);
  };

  const clearFilters = () => {
    onChange([]);
    if (onDifficultyChange) onDifficultyChange('');
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={loading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.5rem 0.875rem',
          borderRadius: 'var(--radius)',
          border: `1px solid ${activeCount > 0 ? 'var(--primary)' : 'var(--border-color)'}`,
          backgroundColor: activeCount > 0 ? 'rgba(0, 122, 255, 0.05)' : 'var(--surface)',
          color: activeCount > 0 ? 'var(--primary)' : 'var(--text-main)',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: 'pointer',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        Filters
        {activeCount > 0 && (
          <span style={{
            backgroundColor: 'rgba(255,255,255,0.25)',
            borderRadius: '999px',
            padding: '0 0.375rem',
            fontSize: '0.75rem',
            minWidth: '1.25rem',
            textAlign: 'center',
          }}>
            {activeCount}
          </span>
        )}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            marginLeft: '0.125rem',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 0.5rem)',
          left: 0,
          zIndex: 50,
          width: 'min(360px, calc(100vw - 2rem))',
          maxHeight: 'min(70vh, 420px)',
          overflowY: 'auto',
          padding: '1rem',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)' }}>Filters</span>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--primary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Clear all
              </button>
            )}
          </div>

          {onDifficultyChange && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>
                Difficulty
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {DIFFICULTIES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleDifficulty(value)}
                    style={chipStyle(selectedDifficulty === value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>
              Topics
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  style={chipStyle(selectedTags.includes(tag))}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
