import { useState, useRef } from 'react';
import useOutsideClick from '../../../hooks/useOutsideClick';
import { useDataContext } from '../../../contexts/DataContext';
import { useFileContext } from '../../../contexts/FileContext';
import useNote from '../../../hooks/useNote';
import Property from '../Property/Property';
import PropertySelection from '../PropertySelection/PropertySelection';
import axios from 'axios';

const PropertySelector = ({
  // fileId,
  property,
  selectedValues,
  availableValues,
}) => {
  const { id: fileId } = useFileContext();
  const { fetchData } = useDataContext();

  const { handleCreateNote } = useNote();

  const selectorRef = useRef(null);
  const headerRef = useRef(null);
  const inputRef = useRef(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // header show more/show less feature start
  // const [maxHeight, setMaxHeight] = useState(0);

  // useEffect(() => {
  //   if (headerRef.current) {
  //     setMaxHeight(
  //       getComputedStyle(headerRef.current).getPropertyValue(
  //         '--max-height-propertySelector__header'
  //       )
  //     );
  //   }
  // }, []);

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

    if (property === 'Notes' && searchTerm && availableValues.length === 0) {
      await handleCreateNote(fileId, searchTerm);
    } else {
      try {
        const response = await axios.post(
          `addProperty/${property.replace(/s$/, '')}/${selectedValue.id}`,
          {
            fileId: fileId,
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
    }
  };

  const handleRemove = async (event, removedValue) => {
    event.stopPropagation();
    try {
      const response = await axios.post(
        `removeProperty/${property.replace(/s$/, '')}/${removedValue.id}`,
        {
          fileId: fileId,
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
      <div
        ref={headerRef}
        className="propertySelector__header"
        onClick={handleClick}
      >
        <div>{property}</div>
        <ul
        // style={{
        //   flexDirection: property === 'Notes' ? 'column' : '',
        //   alignItems: property === 'Notes' ? 'flex-end' : 'center',
        // }}
        >
          {selectedValues.length > 0 && (
            <>
              {selectedValues.map((value) => (
                <Property
                  key={value.id}
                  as="li"
                  name={value.name}
                  color={value.color}
                  link={property === 'Notes' ? `/notebook/${value.id}` : ''}
                  handleRemove={(e) => handleRemove(e, value)}
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
              <PropertySelection
                key={value.id}
                property={property}
                value={value}
                onClick={() => handleSelection(value)}
              />
            ))}
            {searchTerm && availableValues.length === 0 && (
              <PropertySelection
                key="searchTerm"
                searchTerm={searchTerm}
                onClick={() =>
                  handleSelection({
                    id: '99999999999999',
                    name: searchTerm,
                    color: '#eae9ec',
                  })
                }
              />
            )}
          </ul>
        </div>
      )}
    </li>
  );
};

export default PropertySelector;
