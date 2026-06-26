import { useState, useEffect } from 'react';
import api from '../lib/api';

const LIVE_CONTEST_MESSAGE = 'AI analysis is unavailable while a contest is in progress.';

export default function AiAnalysisSection({ submissionId }) {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [contestLive, setContestLive] = useState(false);

    useEffect(() => {
        if (!submissionId) return;

        let isMounted = true;

        const fetchAnalysis = async () => {
            setLoading(true);
            setError('');
            setContestLive(false);

            try {
                const liveRes = await api.get('/contests/live');
                if (!isMounted) return;

                if (liveRes.data?.isLive) {
                    setContestLive(true);
                    return;
                }

                const response = await api.get(`/submissions/${submissionId}/analyze`);
                if (isMounted) {
                    setAnalysis(response.data.analysis);
                }
            } catch (err) {
                if (!isMounted) return;

                const message = err.response?.data?.error || 'Failed to analyze submission';
                if (message.includes('unavailable while a contest is in progress')) {
                    setContestLive(true);
                } else {
                    setError(message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchAnalysis();

        return () => {
            isMounted = false;
        };
    }, [submissionId]);

    if (loading) {
        return (
            <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', backgroundColor: 'var(--surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ width: '45%', height: '24px', backgroundColor: 'var(--border-color)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
                    <div style={{ width: '45%', height: '24px', backgroundColor: 'var(--border-color)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
                </div>
                <div style={{ width: '100%', height: '80px', backgroundColor: 'var(--border-color)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
                <style dangerouslySetInnerHTML={{ __html: `
                    @keyframes pulse {
                        0% { opacity: 0.6; }
                        50% { opacity: 0.3; }
                        100% { opacity: 0.6; }
                    }
                `}} />
            </div>
        );
    }

    if (contestLive) {
        return (
            <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', backgroundColor: 'var(--surface)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {LIVE_CONTEST_MESSAGE}
            </div>
        );
    }

    if (error) {
        if (error.includes('still being judged')) {
            return (
                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', backgroundColor: 'var(--surface)', color: 'var(--text-secondary)' }}>
                    {error}
                </div>
            );
        }
        return (
            <div style={{ padding: '1rem', border: '1px solid var(--status-wrong)', borderRadius: 'var(--radius)', backgroundColor: '#fef2f2', color: 'var(--status-wrong)' }}>
                {error}
            </div>
        );
    }

    if (!analysis) {
        return null;
    }

    return (
        <div style={{ padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', backgroundColor: 'var(--surface)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}>
                    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                </svg>
                AI Analysis
            </h3>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1, backgroundColor: 'var(--bg-color)', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Time Complexity</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', fontFamily: 'var(--font-code)' }}>{analysis.timeComplexity || 'N/A'}</div>
                </div>
                <div style={{ flex: 1, backgroundColor: 'var(--bg-color)', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Space Complexity</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', fontFamily: 'var(--font-code)' }}>{analysis.spaceComplexity || 'N/A'}</div>
                </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.875rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                {analysis.review}
            </div>
        </div>
    );
}
