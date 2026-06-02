import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="relative w-full max-w-md group" id="search-bar">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search
          size={16}
          className="text-zinc-500 group-focus-within:text-emerald-400 transition-colors duration-200"
        />
      </div>

      <input
        id="search-input"
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search your songs…"
        className="block w-full pl-11 pr-10 py-2.5 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] focus:border-emerald-500/40 rounded-full text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all duration-200"
      />

      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-white transition-colors duration-150"
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;