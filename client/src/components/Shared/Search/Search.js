import { ReactComponent as SearchIcon } from '../../../assets/icons/search.svg';
import { ReactComponent as NotFoundIcon } from '../../../assets/icons/notFound.svg';
import SearchItem from '../SearchItem/SearchItem';
import useSearch from '../../../hooks/useSearch';
import useOutsideClick from '../../../hooks/useOutsideClick';
import { useRef } from 'react';

const Search = () => {
  const formRef = useRef();
  const { handleInputChange, setIsTyping, isTyping, searchTerm, suggestions } =
    useSearch('/api/search');

  useOutsideClick(formRef, () => setIsTyping(false));

  return (
    <form ref={formRef} className={`search ${isTyping ? 'typing' : ''}`}>
      <div className="search__field">
        <button type="submit">
          <SearchIcon />
        </button>
        <input
          type="text"
          id="searchInput"
          placeholder="Search"
          onChange={handleInputChange}
        />
      </div>
      {isTyping && (
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
