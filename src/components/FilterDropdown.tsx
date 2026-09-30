import React, { useState, useRef, useEffect } from 'react';

interface FilterDropdownProps {
  label: string;
  options: string[];
  selectedItems: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
}

export const FilterDropdown = React.memo(function FilterDropdown({
  label,
  options,
  selectedItems,
  onSelectionChange,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (option: string) => {
    const newSelected = new Set(selectedItems);

    if (option === 'All') {
      // Clicking "All" toggles selecting all items
      if (newSelected.size === options.length) {
        newSelected.clear();
      } else {
        newSelected.clear();
        options.forEach(opt => newSelected.add(opt));
      }
    } else {
      // Toggle individual item
      if (newSelected.has(option)) {
        newSelected.delete(option);
      } else {
        newSelected.add(option);
      }
    }

    onSelectionChange(newSelected);
  };

  const getDisplayLabel = () => {
    if (selectedItems.size === 0) return 'None Selected';
    if (selectedItems.size === options.length) return label; // Show "Team" or "Level" when all selected
    return `${selectedItems.size} selected`;
  };

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
        {label}
      </label>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-lg border transition-all text-left flex justify-between items-center ${
          isOpen
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
      >
        <span className="text-gray-900 font-medium">{getDisplayLabel()}</span>
        <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          {options.map((option, index) => (
            <div
              key={option}
              onClick={() => handleOptionClick(option)}
              className={`px-4 py-3 cursor-pointer transition-colors flex items-center gap-3 ${
                index === 0 ? 'border-b border-gray-200' : ''
              } ${
                selectedItems.has(option)
                  ? 'bg-blue-50 text-blue-900'
                  : 'hover:bg-gray-50 text-gray-900'
              }`}
            >
              <div
                className={`w-4 h-4 border rounded flex items-center justify-center transition-all ${
                  selectedItems.has(option)
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-gray-300'
                }`}
              >
                {selectedItems.has(option) && (
                  <span className="text-white text-xs">✓</span>
                )}
              </div>
              <span className="text-sm font-medium">{option}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
