import { ReactComponent as SearchIcon } from '../../../assets/icons/search.svg';
import { ReactComponent as NotFoundIcon } from '../../../assets/icons/notFound.svg';
import SearchItem from '../SearchItem/SearchItem';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

/**
 * Displays an interactive search bar that fetches and displays suggestions
 * based on user input. It supports mobile responsiveness by collapsing the
 * search bar on smaller screens and expanding on interaction.
 *
 * @component
 * @returns {JSX.Element} The rendered Search component.
 */
const Search = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const formRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Effect to set isExpanded to false when available space gets smaller
  useEffect(() => {
    const searchContainer = document.getElementsByClassName(
      'user-header__center-space'
    )[0];

    const resizeObserver = new ResizeObserver((entries) => {
      const containerWidth = entries[0].contentRect.width;
      setIsExpanded(containerWidth > 455);
    });

    if (searchContainer) resizeObserver.observe(searchContainer);

    return () => {
      if (searchContainer) resizeObserver.unobserve(searchContainer);
    };
  }, []);

  // Effect to set focus to input inside search field once isExpanded is
  // true and rendering of input is complete
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // Effect to fetch suggestions when searchterm changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`/api/search?query=${searchTerm}`);
        const data = await response.json();
        setSuggestions(data.items);
      } catch (error) {
        console.error('Error fetching suggestions:', error.message);
      }
    };

    if (searchTerm) fetchSuggestions();
  }, [searchTerm]);

  /**
   * Handles form submission logic. If the search bar is expanded,
   * it will navigate to the search results page.
   *
   * @param {Event} event - The submit event from the form.
   */
  const handleSearch = (event) => {
    if (isExpanded) {
      if (searchTerm) navigate(`/search/${searchTerm}`);
      else event.preventDefault();
    }
  };

  /**
   * Handles expanding the search bar on smaller screens and setting
   * focus to the input.
   */
  const handleClick = () => {
    if (!isExpanded) setIsExpanded(true);
    inputRef.current?.focus();
  };

  /**
   * Handles the blur event for the search bar. Clears the search term
   * and collapses the search bar on smaller screens after a short delay.
   */
  const handleBlur = () => {
    // Delay blur handling to not:
    // 1. cancel out link navigation in case of suggestion click, or
    // 2. close search bar when focus is on a searchItem

    setTimeout(() => {
      // Check if focus has moved outside of the search component before clearing the input
      const focusedElement = document.activeElement;

      if (formRef.current && !formRef.current.contains(focusedElement)) {
        setSearchTerm('');

        // Collapse search bar in case of small available space
        const searchContainer = document.getElementsByClassName(
          'user-header__center-space'
        )[0];
        const containerWidth = searchContainer?.getBoundingClientRect().width;
        if (containerWidth <= 455) {
          setIsExpanded(false);
        }
      }
    }, 100);
  };

  return (
    <form
      className={`search${isExpanded ? ' expanded' : ' collapsed'}${
        searchTerm ? ' searching' : ''
      }`}
      ref={formRef}
      onSubmit={handleSearch}
      onBlur={handleBlur}
    >
      <div
        className="search__field"
        onClick={handleClick}
        tabIndex={!isExpanded ? 0 : -1}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        aria-label="Search your space"
      >
        <button
          type="submit"
          tabIndex={searchTerm ? 0 : -1}
          aria-label={isExpanded ? 'Submit search' : 'Expand search bar'}
        >
          <SearchIcon aria-hidden="true" />
        </button>
        {isExpanded && (
          <input
            ref={inputRef}
            type="text"
            autoComplete="off"
            placeholder="Search (soon)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-haspopup="true"
            aria-controls="search-suggestions"
            aria-expanded={Boolean(searchTerm)}
          />
        )}
      </div>
      {searchTerm && (
        <ul
          className="search__suggestions"
          id="search-suggestions"
          role="listbox"
          aria-label="Search suggestions"
          aria-live="polite"
        >
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
