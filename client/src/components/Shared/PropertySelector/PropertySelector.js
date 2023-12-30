import { useState, useRef } from 'react';
import useOutsideClick from '../../../hooks/useOutsideClick';
import Property from '../Property/Property';

const PropertySelector = ({
  property,
  selectedValues,
  availableValues,
  onValuesChange,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const selectorRef = useRef(null);
  const inputRef = useRef(null);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    setSearchTerm(event.target.value.trim());
    setIsTyping(event.target.value.length > 0);
  };

  if (isTyping) {
    availableValues = availableValues.filter((value) =>
      value.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const handleClick = () => {
    setIsDropdownOpen(true);
    setTimeout(() => {
      inputRef.current.focus(); // delay focus by 1ms to allow input to render
    }, 1);
  };

  useOutsideClick(selectorRef, setIsDropdownOpen);

  const handleSelection = (selectedValue) => {
    onValuesChange([...selectedValues, selectedValue]);
    setInputValue('');
  };

  const handleRemoval = (removedValue) => {
    const updatedValues = selectedValues.filter(
      (value) => value !== removedValue
    );
    onValuesChange(updatedValues);
  };

  return (
    <li
      ref={selectorRef}
      className={`propertySelector ${isDropdownOpen ? 'open' : 'closed'}`}
      onClick={handleClick}
    >
      <div className="propertySelector__header">
        <label>{property}</label>
        <ul>
          {selectedValues.length > 0 && (
            <>
              {selectedValues.map((value) => (
                <Property
                  key={value.id}
                  name={value.name}
                  color={value.color}
                  onClick={handleClick}
                />
              ))}
            </>
          )}
          {(isDropdownOpen || selectedValues.length === 0) && (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={`Add ${property.toLowerCase()}`}
            />
          )}
        </ul>
      </div>
      {isDropdownOpen && (
        <div className="propertySelector__dropdown">
          <div>Select an option or create one</div>
          <ul>
            {availableValues.map((value) => (
              <Property
                key={value.id}
                name={value.name}
                color={value.color}
                textOnly={true}
                onClick={handleSelection}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};

export default PropertySelector;
