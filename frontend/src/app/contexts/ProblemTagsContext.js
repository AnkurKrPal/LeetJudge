"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const ProblemTagsContext = createContext({ tags: [], loading: true });

export function ProblemTagsProvider({ children }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await api.get('/problems/tags');
        setTags(res.data.tags || []);
      } catch {
        setTags([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  return (
    <ProblemTagsContext.Provider value={{ tags, loading }}>
      {children}
    </ProblemTagsContext.Provider>
  );
}

export const useProblemTags = () => useContext(ProblemTagsContext);
