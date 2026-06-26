import React from 'react';
import Link from 'next/link';
import AiAnalysisSection from './AiAnalysisSection';
import CodeEditor from './CodeEditor';

const LANG_MAP = {
  54: { name: 'C++', monacoId: 'cpp' },
  62: { name: 'Java', monacoId: 'java' },
  71: { name: 'Python 3', monacoId: 'python' },
  93: { name: 'Node.js', monacoId: 'javascript' },
};

export default function SubmissionDetailView({ submission, isFullScreen = false }) {
  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case 'ACCEPTED': return 'var(--status-accepted)';
      case 'WRONG_ANSWER': return 'var(--status-wrong)';
      case 'TIME_LIMIT_EXCEEDED': case 'MEMORY_LIMIT_EXCEEDED': return 'var(--status-tle)';
      case 'PENDING': case 'COMPILING': case 'RUNNING': return 'var(--text-secondary)';
      default: return 'var(--status-wrong)';
    }
  };

  const langInfo = LANG_MAP[submission.lang] || { name: 'Unknown', monacoId: 'text' };

  return (
    <div style={isFullScreen ? { padding: '2rem', maxWidth: '1200px', margin: '0 auto' } : {}}>
      {isFullScreen && (
        <Link href="/submissions" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          ← Back to Submissions
        </Link>
      )}
      
      <div style={isFullScreen ? { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' } : { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
        <div>
          {isFullScreen ? (
            <>
              <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Submission Details</h1>
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <span>Problem: <Link href={`/problems/${submission.problem_id}`} style={{ color: 'var(--primary)', fontWeight: '500' }}>{submission.problem_title || submission.problem_id.substring(0, 8)}</Link></span>
                <span>Language: <strong style={{ color: 'var(--text-main)' }}>{langInfo.name}</strong></span>
                <span>Submitted: {new Date(submission.timestamp || submission.createdAt).toLocaleString()}</span>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '1.125rem', fontWeight: '600', color: getVerdictColor(submission.verdict), marginBottom: '0.25rem' }}>
                {submission.verdict?.replace(/_/g, ' ')}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {langInfo.name} • {new Date(submission.timestamp || submission.createdAt).toLocaleString()}
              </div>
            </>
          )}
        </div>
        
        <div style={isFullScreen ? { textAlign: 'right', padding: '1rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' } : { textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {isFullScreen && (
            <div style={{ fontSize: '1.25rem', fontWeight: '600', color: getVerdictColor(submission.verdict), marginBottom: '0.25rem' }}>
              {submission.verdict?.replace(/_/g, ' ')}
            </div>
          )}
          {submission.execution_time_ms != null && (
            <div style={isFullScreen ? { fontSize: '0.875rem', color: 'var(--text-secondary)' } : {}}>
              {isFullScreen ? 'Runtime: ' : ''}{submission.execution_time_ms} ms
              {submission.memory_used_kb != null ? ` ${isFullScreen ? '| Memory: ' : ''}${Math.round(submission.memory_used_kb / 1024)} MB` : ''}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <AiAnalysisSection submissionId={submission.id} />
      </div>

      {submission.verdict_message && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: isFullScreen ? '1rem' : '0.875rem', marginBottom: '0.5rem' }}>Message</h3>
          <pre style={{ 
            padding: isFullScreen ? '1rem' : '0.75rem', 
            backgroundColor: 'var(--surface)', 
            border: '1px solid var(--border-color)', 
            borderRadius: 'var(--radius)', 
            fontSize: isFullScreen ? '0.875rem' : '0.75rem', 
            fontFamily: 'var(--font-code)', 
            overflowX: 'auto', 
            color: submission.verdict === 'ACCEPTED' ? 'var(--status-accepted)' : 'var(--status-wrong)' 
          }}>
            {submission.verdict_message}
          </pre>
        </div>
      )}

      {submission.error_test_case != null && submission.expected_output != null && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexDirection: isFullScreen ? 'row' : 'column' }}>
          <div style={{ flex: 1, border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}>
            <h4 style={{ padding: '0.75rem 1rem', margin: 0, borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', fontSize: '0.875rem' }}>Expected Output</h4>
            <pre style={{ padding: '1rem', margin: 0, fontSize: '0.875rem', fontFamily: 'var(--font-code)', overflowX: 'auto', color: 'var(--status-accepted)' }}>
              {submission.expected_output}
            </pre>
          </div>
          <div style={{ flex: 1, border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}>
            <h4 style={{ padding: '0.75rem 1rem', margin: 0, borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', fontSize: '0.875rem' }}>Actual Output</h4>
            <pre style={{ padding: '1rem', margin: 0, fontSize: '0.875rem', fontFamily: 'var(--font-code)', overflowX: 'auto', color: 'var(--status-wrong)' }}>
              {submission.actual_output || '<empty output>'}
            </pre>
          </div>
        </div>
      )}

      <div>
        <h3 style={{ fontSize: isFullScreen ? '1rem' : '0.875rem', marginBottom: '0.5rem' }}>{isFullScreen ? 'Submitted Code' : 'Code'}</h3>
        <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', overflow: 'hidden', height: isFullScreen ? '600px' : '400px' }}>
          <CodeEditor 
            language={langInfo.monacoId} 
            value={submission.code} 
            readOnly={true}
          />
        </div>
      </div>
    </div>
  );
}
