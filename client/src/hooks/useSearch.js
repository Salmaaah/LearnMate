import { useState, useEffect } from 'react';

const useSearch = (uri) => {
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleInputChange = (event) => {
    const inputValue = event.target.value;
    setSearchTerm(inputValue);
    setIsTyping(inputValue.length > 0);
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`${uri}?query=${searchTerm}`);
        const data = await response.json();
        setSuggestions(data.items);
      } catch (error) {
        console.error('Error fetching suggestions:', error.message);
      }
    };

    if (isTyping) {
      fetchSuggestions();
    }
  }, [searchTerm, isTyping]);

  return {
    handleInputChange,
    setIsTyping,
    isTyping,
    searchTerm,
    suggestions,
  };
};

export default useSearch;
