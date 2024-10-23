import PropTypes from 'prop-types';
import { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * A component representing a single item in a search results list.
 * It highlights parts of the label that match the user input.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {JSX.Element} props.icon - The icon to be displayed alongside the label.
 * @param {string} props.label - The label text for the search item.
 * @param {string} props.link - The URL link to navigate to when the item is clicked.
 * @param {string} props.userInput - The current user input used for highlighting matches.
 * @returns {JSX.Element} The rendered search item component.
 */
const SearchItem = ({ icon, label, link, userInput }) => {
  const [selected, setSelected] = useState(false);

  /**
   * Highlights matching parts of the text based on the user input.
   *
   * @param {string} text - The text to be checked for matches.
   * @param {string} userInput - The current user input used for matching.
   * @returns {Array<JSX.Element|string>} The text split into parts, with matches highlighted.
   */
  const highlightMatch = (text, userInput) => {
    if (!userInput) return text;

    const regex = new RegExp(`(${userInput})`, 'gi');
    return text
      .split(regex)
      .map((part, index) =>
        regex.test(part) ? <strong key={index}>{part}</strong> : part
      );
  };

  return (
    <li
      className="search-item"
      role="option"
      aria-selected={selected}
      aria-disabled={label === 'No results'}
    >
      {label === 'No results' ? (
        <div>
          {icon}
          <span role="alert">{label}</span>
        </div>
      ) : (
        <Link
          to={link}
          onFocus={() => setSelected(true)}
          onBlur={() => setSelected(false)}
        >
          {/* <img src={suggestion.favicon} alt="" /> */}
          {icon}
          <span> {highlightMatch(label, userInput)}</span>
        </Link>
      )}
    </li>
  );
};

SearchItem.propTypes = {
  icon: PropTypes.element.isRequired,
  label: PropTypes.string.isRequired,
  link: PropTypes.string,
  userInput: PropTypes.string,
};

export default SearchItem;
