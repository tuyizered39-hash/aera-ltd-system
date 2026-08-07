import React, { useState } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';

const SearchFilter = ({ onSearch, onFilter, filters = [], initialValues = {} }) => {
  const { t } = useLanguage();
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValues, setFilterValues] = useState(initialValues);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch({ search: searchTerm, ...filterValues });
  };

  const handleFilterChange = (key, value) => {
    const newValues = { ...filterValues, [key]: value };
    setFilterValues(newValues);
    onFilter(newValues);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('common.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        {filters.length > 0 && (
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            <FaFilter /> {t('common.filter')}
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition"
        >
          {t('common.search')}
        </button>
      </form>

      {showFilters && filters.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-200">
          {filters.map((filter) => (
            <div key={filter.key}>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {filter.label}
              </label>
              {filter.type === 'select' ? (
                <select
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : filter.type === 'date' ? (
                <input
                  type="date"
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              ) : (
                <input
                  type="text"
                  placeholder={filter.placeholder || ''}
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;