import { useState, useMemo } from 'react';
import sourcesData from '../data/sources.json';

interface Source {
  id: string;
  name: string;
  description: string;
  logo: string;
  url: string;
  ingestTypes?: string[];
  categories?: string[];
  tableName?: string[];
  plan?: string;
}

// Import sources from generated data file
const sources: Source[] = sourcesData.sources;

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function SourceSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('all');

  const filteredSources = useMemo(() => {
    let filtered = sources;

    if (searchQuery) {
      filtered = filtered.filter(source =>
        source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        source.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedLetter !== 'all') {
      filtered = filtered.filter(source =>
        source.name.charAt(0).toUpperCase() === selectedLetter
      );
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [searchQuery, selectedLetter]);

  const availableLetters = useMemo(() => {
    const letters = new Set(sources.map(s => s.name.charAt(0).toUpperCase()));
    return alphabet.filter(letter => letters.has(letter));
  }, []);

  return (
    <div className="sources-browser">
      {/* Search Bar */}
      <div className="mt-8 mb-6 w-full">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search sources"
            className="w-full h-10 px-6 py-3 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-400/20 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          />
          
          {/* Search Icon - on the right */}
          <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
            <svg 
              className="h-4 w-4 text-gray-400 dark:text-gray-500" 
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
          
          {/* Clear Button */}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-12 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              aria-label="Clear search"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Alphabet Filter */}
      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-1.5 items-center">
          <button
            onClick={() => setSelectedLetter('all')}
            className={`px-3 py-1.5 rounded-md font-medium text-sm transition-colors ${
              selectedLetter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          {alphabet.map(letter => {
            const isAvailable = availableLetters.includes(letter);
            const isSelected = selectedLetter === letter;
            return (
              <button
                key={letter}
                onClick={() => isAvailable && setSelectedLetter(letter)}
                disabled={!isAvailable}
                className={`w-8 h-8 rounded-md font-medium text-sm transition-colors ${
                  isSelected
                    ? 'bg-purple-600 text-white'
                    : isAvailable
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    : 'bg-transparent text-gray-300 dark:text-gray-600 cursor-not-allowed'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-gray-600 dark:text-gray-400 text-sm">
        <span className="font-medium text-gray-900 dark:text-gray-100">{filteredSources.length}</span> sources
        {(searchQuery || selectedLetter !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedLetter('all');
            }}
            className="ml-3 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Sources Grid */}
      {filteredSources.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSources.map(source => (
            <a
              key={source.id}
              href={source.url}
              className="group bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md transition-all duration-200 flex flex-col"
            >
              {/* Header with Logo and Name */}
              <div className="flex items-center pt-4 px-4">
                <div className="shrink-0 rounded-md p-1.5 dark:bg-[#EDEDED]">
                  <img 
                    src={source.logo} 
                    alt={source.name} 
                    className="h-12 w-12 rounded-sm object-contain"
                  />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="font-semibold font-sans leading-normal text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {source.name}
                  </h3>
                </div>
              </div>
              
              {/* Description */}
              <p className="py-2 px-4 text-sm text-gray-600 dark:text-gray-400 flex-grow">
                {source.description}
              </p>
              
              {/* View docs link */}
              <div className="px-4 pb-2 mb-2 mt-auto">
                <span className="inline-flex items-center text-purple-600 dark:text-purple-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
                  View docs
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No sources found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedLetter('all');
            }}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}

    </div>
  );
}

