import PropTypes from 'prop-types';
import { useRef, useState, forwardRef } from 'react';
import axios from 'axios';
import PropertySelector from '../Shared/PropertySelector/PropertySelector';
import { useDataContext } from '../../contexts/DataContext';
import { useFileContext } from '../../contexts/FileContext';
import { ReactComponent as ErrorIcon } from '../../assets/icons/error.svg';
import { ReactComponent as DeleteIcon } from '../../assets/icons/delete_3.svg';
import MenuItem from '../Shared/MenuItem/MenuItem';

/**
 * A menu that provides functionality to update file name, delete file, and manage
 * associated file properties like subject, project, tags, and notes.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.position - The position of the menu (e.g., 'right', 'left').
 * @param {React.Ref} ref - The ref to the component.
 * @returns {JSX.Element} - Rendered menu component.
 */
const EditMenu = forwardRef(({ position }, ref) => {
  const { data, fetchData } = useDataContext();
  const { id, name, subject, project, tags, notes } = useFileContext();
  const [fileName, setFileName] = useState(name);
  const [nameError, setNameError] = useState(null);
  const properties = [
    { propName: 'Subject', propValue: subject, allData: data.subjects },
    { propName: 'Project', propValue: project, allData: data.projects },
    { propName: 'Tags', propValue: tags, allData: data.tags },
    { propName: 'Notes', propValue: notes, allData: data.notes },
  ];
  const inputRef = useRef(null);

  /**
   * Handles the update of the file name by sending a POST request to the server.
   * Fetches updated data on success or sets an error message on failure.
   *
   * @async
   * @param {Event} e - The form submission event or blur event.
   * @returns {Promise<void>}
   */
  const handleUpdateFileName = async (e) => {
    console.log('Updating file name', name, 'to', fileName);
    e.preventDefault();

    try {
      const response = await axios.post(`/updateName/${id}`, {
        name: fileName,
      });
      fetchData();
      console.log(response.data.message);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.error(error.response.data.error);
        setNameError(error.response.data.error);
      } else {
        console.error('Error updating file name:', error.message);
      }
    }
  };

  /**
   * Handles the deletion of the file by sending a POST request to the server.
   * Fetches updated data on success or logs an error on failure.
   *
   * @async
   * @returns {Promise<void>}
   */
  const handleDelete = async () => {
    console.log('Deleting file', name);
    try {
      const response = await axios.post(`delete/${id}`);
      fetchData();
      console.log(response.data.message);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.error(error.response.data.error);
      } else {
        console.error('Error deleting file:', error.message);
      }
    }
  };

  return (
    <ul
      className={`edit-menu ${position}`}
      role="menu"
      ref={ref}
      aria-label={`Edit file "${name}"`}
    >
      <li className="edit-menu__name" role="menuitem">
        <input
          ref={inputRef}
          name="name"
          type="text"
          placeholder="Enter your file name"
          autoComplete="off"
          value={fileName}
          onChange={(e) => {
            setFileName(e.target.value);
            setNameError(null);
          }}
          onBlur={handleUpdateFileName}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleUpdateFileName(e);
          }}
          aria-label="File name"
          aria-invalid={!!nameError}
          aria-describedby={nameError ? 'file-name-error' : undefined}
        />
        {nameError && (
          <div id="file-name-error" className="input-error">
            <ErrorIcon className="input-error__icon" />
            <span className="input-error__message">{nameError}</span>
          </div>
        )}
      </li>
      {properties.map(({ propName, propValue, allData }, index) => (
        <PropertySelector
          key={index}
          property={propName}
          selectedValues={propValue}
          availableOptions={allData.filter(
            (item) => !propValue.some((selected) => selected.id === item.id)
          )}
        />
      ))}
      <li className="edit-menu__separator"></li>
      <MenuItem
        icon={<DeleteIcon />}
        size="small"
        label="Delete"
        onInteraction={handleDelete}
      />
    </ul>
  );
});

EditMenu.propTypes = {
  position: PropTypes.string.isRequired,
};

export default EditMenu;
