import { Link } from 'react-router-dom';

const SearchItem = ({ index, icon, label, link, userInput }) => {
  console.log(link);
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
    <li key={index} className="searchItem">
      {/* <img src={suggestion.favicon} alt="" /> */}
      {icon}
      <Link to={link}>{highlightMatch(label, userInput)}</Link>
    </li>
  );
};

export default SearchItem;
