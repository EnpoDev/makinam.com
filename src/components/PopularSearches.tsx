import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribeToPopularSearches, DEFAULT_POPULAR_SEARCHES } from '../lib/portalService';

export const PopularSearches: React.FC = () => {
  const navigate = useNavigate();
  const [searches, setSearches] = useState<string[]>(DEFAULT_POPULAR_SEARCHES);

  useEffect(() => {
    const unsubscribe = subscribeToPopularSearches((queries) => {
      if (queries && queries.length > 0) {
        setSearches(queries);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white border border-[#cbd5e1] rounded-[3px] p-3 shadow-xs mb-3 font-sans">
      <h2 className="text-[12px] font-bold text-[#1e293b] mb-2 pb-1.5 border-b border-[#e2e8f0] uppercase tracking-wide">
        Popüler Makine Aramaları
      </h2>
      <div className="flex flex-wrap gap-1.5">
        {searches.map((query, idx) => (
          <button
            key={idx}
            onClick={() => navigate(`/ilanlar?q=${encodeURIComponent(query)}`)}
            className="text-[11px] text-[#475569] bg-[#f8fafc] hover:bg-[#e2e8f0] hover:text-[#0284c7] border border-[#cbd5e1] px-2 py-0.5 rounded-[2px] transition-colors"
          >
            {query}
          </button>
        ))}
      </div>
    </div>
  );
};
