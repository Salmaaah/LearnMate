import { useState, useRef } from 'react';
import useOutsideClick from '../../../hooks/useOutsideClick';
import { useDataContext } from '../../../contexts/DataContext';
import { useFile } from '../../../contexts/FileContext';
import Property from '../Property/Property';
import PropertySelection from '../PropertySelection/PropertySelection';
import axios from 'axios';

const PropertySelector = ({
  // file_id,
  property,
  selectedValues,
  availableValues,
}) => {
  const { id: file_id } = useFile();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const selectorRef = useRef(null);
  const inputRef = useRef(null);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { fetchData } = useDataContext();

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
      setInputValue('');
    }, 1);
  };

  useOutsideClick(selectorRef, () => setIsDropdownOpen(false));

  const handleSelection = async (selectedValue) => {
    setInputValue('');
    setSearchTerm('');

    try {
      const response = await axios.post(
        // `${property.toLowerCase()}/${selectedValue.id}`,
        `add/${property.replace(/s$/, '')}/${selectedValue.id}`,
        {
          file_id: file_id,
          name: selectedValue.name,
          color: selectedValue.color,
        }
      );
      await fetchData();
      console.log(response.data.message);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.error(error.response.data.error);
      } else {
        console.error('Error adding property:', error.message);
      }
    }
  };

  const handleRemove = async (event, removedValue) => {
    event.stopPropagation();
    try {
      const response = await axios.post(
        `remove/${property.replace(/s$/, '')}/${removedValue.id}`,
        {
          file_id: file_id,
          name: removedValue.name,
        }
      );
      await fetchData();
      console.log(response.data.message);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.error(error.response.data.error);
      } else {
        console.error('Error removing property:', error.message);
      }
    }
  };

  return (
    <li
      ref={selectorRef}
      className={`propertySelector ${isDropdownOpen ? 'open' : 'closed'}`}
    >
      <div className="propertySelector__header" onClick={handleClick}>
        <div>{property}</div>
        <ul>
          {selectedValues.length > 0 && (
            <>
              {selectedValues.map((value) => (
                <Property
                  key={value.id}
                  name={value.name}
                  color={value.color}
                  handleRemove={(event) => handleRemove(event, value)}
                />
              ))}
            </>
          )}
          {(isDropdownOpen || selectedValues.length === 0) && (
            // TODO: put input in a <li> because the parent is a <ul>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={`Add ${property.toLowerCase()}`}
              id={`${property.toLowerCase()}Input`}
            />
          )}
        </ul>
      </div>
      {isDropdownOpen && (
        <div className="propertySelector__dropdown">
          <div>Select an option or create one</div>
          <ul>
            {availableValues.map((value) => (
              // TODO: figure out how to make this a <li> instead of a <div> because the parent is a <ul>
              <div key={value.id} onClick={() => handleSelection(value)}>
                <PropertySelection property={property} value={value} />
              </div>
            ))}
            {searchTerm && availableValues.length === 0 && (
              // TODO: figure out how to make this a <li> instead of a <div> because the parent is a <ul>
              <div
                key="searchTerm"
                onClick={() =>
                  handleSelection({
                    id: '99999999999999',
                    name: searchTerm,
                    color: 'gray',
                  })
                }
              >
                <PropertySelection searchTerm={searchTerm} />
              </div>
            )}
          </ul>
        </div>
      )}
    </li>
  );
};

export default PropertySelector;
