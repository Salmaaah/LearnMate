import { useState, useEffect } from 'react';
import { ReactComponent as SearchIcon } from '../../../assets/icons/search.svg';
import { ReactComponent as NotFoundIcon } from '../../../assets/icons/notFound.svg';
import SearchItem from '../SearchItem/SearchItem';

const Search = () => {
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
        const response = await fetch(`/api/search?query=${searchTerm}`);
        const data = await response.json();
        setSuggestions(data.items);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    if (isTyping) {
      fetchSuggestions();
    }
  }, [searchTerm, isTyping]);

  return (
    <form
      className={`search ${isTyping ? 'typing' : ''}`}
      onBlur={() => setIsTyping(false)}
    >
      <div className="search__field">
        <button type="submit">
          <SearchIcon />
        </button>
        <input type="text" placeholder="Search" onChange={handleInputChange} />
      </div>
      {isTyping && suggestions.length > 0 && (
        <ul className="search__suggestions">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <SearchItem
                key={index}
                icon={<SearchIcon />}
                label={suggestion.label}
                userInput={searchTerm}
                link={suggestion.link}
              />
            ))
          ) : (
            <SearchItem icon={<NotFoundIcon />} label="No results" />
          )}
        </ul>
      )}
    </form>
  );
};

export default Search;
