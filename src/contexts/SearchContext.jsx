import React, { createContext, useContext, useState } from 'react';

const SearchContext = createContext();

export function useSearch() {
  return useContext(SearchContext);
}

export function SearchProvider({ children }) {
  const [globalSearch, setGlobalSearch] = useState('');
  const [globalFilterUrl, setGlobalFilterUrl] = useState('');

  return (
    <SearchContext.Provider value={{
      globalSearch,
      setGlobalSearch,
      globalFilterUrl,
      setGlobalFilterUrl
    }}>
      {children}
    </SearchContext.Provider>
  );
}
