import React, { useState } from 'react';
import './SearchBar.css';

const CATEGORIES = ['All', 'Workshop', 'Seminar', 'Cultural', 'Technical'];
const DEPARTMENTS = ['All', 'Computer Science', 'Management', 'Arts & Culture', 'Electronics', 'Mechanical'];
const SORTS = [
  { value: '', label: 'Latest' },
  { value: 'popularity', label: '🔥 Popularity' },
  { value: 'date_asc', label: '📅 Date (Asc)' },
  { value: 'date_desc', label: '📅 Date (Desc)' },
  { value: 'price_asc', label: '💰 Price (Low)' },
  { value: 'price_desc', label: '💰 Price (High)' },
];

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [department, setDepartment] = useState('');
  const [sort, setSort] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch({ search: query, category: category === 'All' ? '' : category, department: department === 'All' ? '' : department, sort });
  };

  const handleReset = () => {
    setQuery(''); setCategory(''); setDepartment(''); setSort('');
    onSearch({});
  };

  return (
    <div className="search-bar-wrap card">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            id="search-input"
            type="text"
            className="search-input"
            placeholder="Search events, departments, venues..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <button type="button" className="btn btn-outline btn-sm filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)} id="toggle-filters-btn">
          ⚙️ Filters {filtersOpen ? '▲' : '▼'}
        </button>
        <button type="submit" className="btn btn-primary" id="search-submit-btn">Search</button>
      </form>

      {filtersOpen && (
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <div className="filter-pills">
              {CATEGORIES.map(c => (
                <button key={c} type="button" id={`cat-filter-${c}`}
                  className={`filter-pill ${category === c || (c === 'All' && !category) ? 'active' : ''}`}
                  onClick={() => setCategory(c === 'All' ? '' : c)}
                >{c}</button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Department</label>
            <select className="form-input" value={department} onChange={e => setDepartment(e.target.value)} id="dept-filter-select">
              {DEPARTMENTS.map(d => <option key={d} value={d === 'All' ? '' : d}>{d}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Sort By</label>
            <select className="form-input" value={sort} onChange={e => setSort(e.target.value)} id="sort-select">
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <button type="button" className="btn btn-outline btn-sm" onClick={handleReset} id="reset-filters-btn">Reset</button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
