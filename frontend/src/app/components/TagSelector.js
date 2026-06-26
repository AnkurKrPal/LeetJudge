import { useProblemTags } from '../contexts/ProblemTagsContext';

export default function TagSelector({ selectedTags, onChange }) {
  const { tags, loading } = useProblemTags();

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  if (loading) {
    return (
      <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        Loading topics...
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>
        Topics
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: 'var(--radius)',
                border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                backgroundColor: isSelected ? 'var(--primary)' : 'var(--surface)',
                color: isSelected ? '#fff' : 'var(--text-main)',
                fontSize: '0.8rem',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
