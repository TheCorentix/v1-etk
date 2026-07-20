import React, { createContext, useContext, useState, useEffect } from 'react';
import { searchService } from '../services/searchService';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('etniko_recent_searches');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('etniko_recent_searches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Load static trending & popular suggestions
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const trending = await searchService.getTrendingSearches();
        const popular = await searchService.getPopularProducts();
        setTrendingSearches(trending);
        setPopularProducts(popular);
      } catch (err) {
        // Fallbacks
        setTrendingSearches(["Saree", "Lehenga", "Kurta"]);
      }
    };
    loadSuggestions();
  }, []);

  // Fetch search results on query change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await searchService.search(searchQuery);
        setSearchResults(results);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const openSearch = () => setIsOpen(true);
  const closeSearch = () => {
    setIsOpen(false);
    setSearchQuery("");
  };

  const addRecentSearch = (term) => {
    const formatted = term.trim();
    if (!formatted) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(t => t.toLowerCase() !== formatted.toLowerCase());
      return [formatted, ...filtered].slice(0, 5);
    });
  };

  const removeRecentSearch = (term) => {
    setRecentSearches(prev => prev.filter(t => t !== term));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  return (
    <SearchContext.Provider value={{
      isOpen,
      openSearch,
      closeSearch,
      searchQuery,
      setSearchQuery,
      searchResults,
      isLoading,
      recentSearches,
      trendingSearches,
      popularProducts,
      addRecentSearch,
      removeRecentSearch,
      clearRecentSearches
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
