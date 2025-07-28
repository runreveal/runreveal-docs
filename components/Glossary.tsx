import { useState, useMemo } from 'react';
import { Tabs } from 'nextra/components';

interface Term {
  term: string;
  definition: string;
}

export default function Glossary({ data }: { data: Term[] }) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // Process and group terms
  const { groupedTerms, tabs } = useMemo(() => {
    const groups: Record<string, Term[]> = {};
    
    // Add "All" category first
    groups['All'] = data;
    
    // Group by first letter
    data.forEach(term => {
      const firstChar = term.term.charAt(0).toUpperCase();
      const category = /[A-Z]/.test(firstChar) ? firstChar : '#';
      
      if (!groups[category]) groups[category] = [];
      groups[category].push(term);
    });

    const sortedTabs = Object.keys(groups).sort((a, b) => {
      if (a === 'All') return -1; // All comes first
      if (b === 'All') return 1;
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    });

    Object.values(groups).forEach(group => 
      group.sort((a, b) => a.term.localeCompare(b.term))
    );

    return { groupedTerms: groups, tabs: sortedTabs };
  }, [data]);

  // Filter terms - only search terms, not definitions
  const filteredTerms = useMemo(() => {
    if (!search.trim()) return groupedTerms[tabs[activeTab]] || [];
    
    const query = search.toLowerCase();
    return data.filter(item => 
      item.term.toLowerCase().includes(query)
    );
  }, [search, activeTab, data, tabs, groupedTerms]);

  return (
    <div className="glossary-container">
      {/* Modern Full-Width Search Bar */}
      <div className="mt-4 mb-4 w-full">
        <div className="relative w-full">
          {/* Search Input */}
                     <input
             type="text"
             placeholder="Search Terms"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             aria-label="Search glossary"
             className="w-full pl-4 pr-12 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-[5px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg"
           />
          
          {/* Search Icon - moved to right */}
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <svg 
              className="h-5 w-5 text-gray-400 dark:text-gray-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
          
          {/* Clear Button (only show when there's text) */}
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-12 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              aria-label="Clear search"
            >
              <svg 
                className="h-5 w-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          )}
        </div>
        
        {/* Search Results Count */}
        {search && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {filteredTerms.length === 0 ? (
              <span>No matching terms found</span>
            ) : (
              <span>
                Found {filteredTerms.length} term{filteredTerms.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>

      {search ? (
        <div className="search-results">
          {filteredTerms.length > 0 ? (
            filteredTerms.map((term, i) => (
              <TermItem key={i} term={term} />
            ))
          ) : (
            <div className="text-center py-12">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1} 
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" 
                />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No matching terms found</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      ) : (
        <Tabs items={tabs} defaultIndex={activeTab} onChange={setActiveTab}>
          {tabs.map((tab, index) => (
            <Tabs.Tab key={tab}>
              <div className="mt-4">
                {groupedTerms[tab]?.map((term, i) => (
                  <TermItem key={i} term={term} />
                ))}
              </div>
            </Tabs.Tab>
          ))}
        </Tabs>
      )}
    </div>
  );
}

// Sub-component within the same file
function TermItem({ term }: { term: Term }) {
  return (
    <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-800">
      <div className="flex flex-col">
        <span className="font-bold text-lg text-primary mb-2">{term.term}</span>
        <span className="italic text-gray-700 dark:text-gray-300">{term.definition}</span>
      </div>
    </div>
  );
}
