import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 sm:py-2.5 min-h-[44px] sm:min-h-0 rounded-lg text-sm text-white
          bg-white/5 border border-white/10 placeholder:text-white/30
          focus:outline-none focus:ring-2 focus:ring-emerald-500/50
          focus:border-emerald-500/50 transition-all duration-200"
      />
    </div>
  );
};
