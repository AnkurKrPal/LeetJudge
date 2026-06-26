"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import SubmissionDetailView from '../../components/SubmissionDetailView';

export default function SubmissionDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchSubmission = async () => {
      try {
        const res = await api.get(`/submissions/${id}`);
        setSubmission(res.data.submission || res.data);
      } catch (err) {
        console.error("Failed to load submission", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [id, user, authLoading, router]);

  if (authLoading || loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading submission...</div>;
  }

  if (!submission) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Submission not found or unauthorized.</div>;
  }

  return <SubmissionDetailView submission={submission} isFullScreen={true} />;
}

