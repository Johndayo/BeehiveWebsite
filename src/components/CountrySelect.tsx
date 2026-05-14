import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { countries } from '../data/countries';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

function flagUrlFor(name: string) {
  // Use a name-based flag CDN that accepts country names.
  // This service returns PNG flags for many countries.
  return `https://countryflagsapi.com/png/${encodeURIComponent(name)}`;
}

export default function CountrySelect({ value, onChange, placeholder = 'Select a country', label = 'Country' }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query
    ? countries.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
    : countries;

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [close]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-navy-700 mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen((s) => !s)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-navy-200 rounded-lg text-left transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          {value ? (
            <img
              src={flagUrlFor(value)}
              alt={`${value} flag`}
              className="w-5 h-4 object-cover rounded-sm"
              onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}}
            />
          ) : null}
          <span className={value ? 'text-navy-900' : 'text-navy-400'}>
            {value || placeholder}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-navy-400" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-navy-200 rounded-lg shadow-lg animate-fade-in">
          <div className="p-2 border-b border-navy-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for country..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-navy-200 rounded-md focus:outline-none focus:border-navy-600 focus:ring-1 focus:ring-navy-200"
                aria-label="Search countries by name"
              />
            </div>
          </div>

          <ul className="max-h-56 overflow-y-auto py-1" role="listbox">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-navy-400 text-center">No results found</li>
            ) : (
              filtered.map((c) => (
                <li
                  key={c}
                  onClick={() => { onChange(c); close(); }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-navy-50"
                  role="option"
                >
                  <img
                    src={flagUrlFor(c)}
                    alt={`${c} flag`}
                    className="w-5 h-4 object-cover rounded-sm"
                    onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}}
                  />
                  <span className="text-navy-700">{c}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
