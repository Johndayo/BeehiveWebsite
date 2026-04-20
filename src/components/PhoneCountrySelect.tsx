import { useState, useRef, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { countryDialCodes } from '../data/countryCodes';

interface Props {
  value: string; // full phone string, e.g. "+1 555 123 4567"
  onChange: (value: string) => void;
  placeholder?: string;
  onBlur?: () => void;
}

function flagUrlFor(countryName: string) {
  return `https://countryflagsapi.com/png/${encodeURIComponent(countryName)}`;
}

export default function PhoneCountrySelect({ value, onChange, placeholder = 'Phone number', onBlur }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // derive selected code and current phone part
  const trimmed = value.trim();
  const selectedCode = trimmed.startsWith('+') ? trimmed.split(/\s+/)[0] : '+1';
  const phonePart = trimmed.startsWith('+') ? trimmed.split(/\s+/).slice(1).join(' ') : trimmed;

  const items = Object.entries(countryDialCodes).map(([country, code]) => ({ country, code }));
  const filtered = query ? items.filter(i => (i.country + ' ' + i.code).toLowerCase().includes(query.toLowerCase())) : items;

  const close = useCallback(() => { setIsOpen(false); setQuery(''); }, []);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) close();
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [close]);

  useEffect(() => { if (isOpen && inputRef.current) inputRef.current.focus(); }, [isOpen]);

  function applyCode(code: string) {
    const next = phonePart ? `${code} ${phonePart}`.trim() : code;
    onChange(next);
    close();
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex">
        <button
          type="button"
          onClick={() => setIsOpen(s => !s)}
          className="flex items-center gap-2 px-3 py-3 bg-white border border-r-0 border-navy-200 rounded-l-lg text-navy-900"
        >
          <img src={flagUrlFor(Object.keys(countryDialCodes).find(k => countryDialCodes[k] === selectedCode) || '')}
               alt="flag"
               className="w-5 h-4 object-cover rounded-sm" onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}} />
          <span className="text-sm">{selectedCode}</span>
        </button>

        <input
          type="tel"
          value={phonePart}
          onChange={(e) => onChange(`${selectedCode} ${e.target.value}`.trim())}
          onBlur={() => { if (onBlur) onBlur(); }}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 bg-white border border-navy-200 rounded-r-lg text-navy-900 placeholder:text-navy-300"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-80 bg-white border border-navy-200 rounded-lg shadow-lg">
          <div className="p-2 border-b border-navy-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for country"
                className="w-full pl-9 pr-3 py-2 text-sm border border-navy-200 rounded-md focus:outline-none focus:border-navy-600 focus:ring-1 focus:ring-navy-200"
              />
            </div>
          </div>

          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.map(({ country, code }) => (
              <li key={country} className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer hover:bg-navy-50" onClick={() => applyCode(code)}>
                <img src={flagUrlFor(country)} alt="flag" className="w-5 h-4 object-cover rounded-sm" onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}} />
                <div className="flex-1 text-navy-700">{country}</div>
                <div className="text-navy-500">{code}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
