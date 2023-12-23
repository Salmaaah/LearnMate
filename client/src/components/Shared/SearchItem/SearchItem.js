const SearchItem = ({ index, icon, label, link, userInput }) => {
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
      <a href={link}>{highlightMatch(label, userInput)}</a>
    </li>
  );
};

export default SearchItem;
