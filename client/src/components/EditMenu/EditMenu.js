import PropertySelector from '../Shared/PropertySelector/PropertySelector';
import { useDataContext } from '../../contexts/DataContext';
import { useFile } from '../../contexts/FileContext';
import useForm from '../../hooks/useForm';
import useOutsideClick from '../../hooks/useOutsideClick';
import { useRef } from 'react';
import axios from 'axios';
import { ReactComponent as DeleteIcon } from '../../assets/icons/delete_3.svg';
import MenuItem from '../Shared/MenuItem/MenuItem';

const EditMenu = () => {
  const { data, fetchData } = useDataContext();
  const { id, name, subject, project, tags, notes } = useFile();

  const initialValues = { name: name };

  // no need for validation here because we submit on blur
  const validationFunctions = {};

  const submitCallback = async (formData) => {
    try {
      const response = await axios.post(`update/${id}`, formData);
      await fetchData();
      console.log(response.data.message);
    } catch (error) {
      throw error; // Propagate the error to be handled in the catch block of the form's handleSubmit
    }
  };

  const {
    formData,
    errors,
    isSubmitting,
    isFormSubmitted,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm(initialValues, validationFunctions, submitCallback);

  const inputRef = useRef(null);
  useOutsideClick(inputRef, handleSubmit);

  // TODO: display errors

  const handleDelete = async () => {
    try {
      const response = await axios.post(`delete/${id}`);
      await fetchData();
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
    <ul className="editMenu">
      <li className="editMenu__name">
        <input
          ref={inputRef}
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            e.key === 'Enter' && handleSubmit(e);
          }}
        />
      </li>
      {['subject', 'project', 'tags', 'notes'].map((value, index) => (
        <PropertySelector
          key={index}
          property={value.charAt(0).toUpperCase() + value.slice(1)}
          selectedValues={eval(value)}
          availableValues={data[
            value.endsWith('s') ? value : value + 's'
          ].filter((obj1) => !eval(value).some((obj2) => obj1.id === obj2.id))}
        />
      ))}
      {/* <PropertySelector
        property="Subject"
        selectedValues={subject}
        availableValues={data.subjects.filter(
          (subject1) => !subject.some((subject2) => subject1.id === subject2.id)
        )}
      />
      <PropertySelector
        property="Project"
        selectedValues={project}
        availableValues={data.projects.filter(
          (project1) => !project.some((project2) => project1.id === project2.id)
        )}
      />
      <PropertySelector
        property="Tags"
        selectedValues={tags}
        availableValues={data.tags.filter(
          (tag1) => !tags.some((tag2) => tag1.id === tag2.id)
        )}
      />
      <PropertySelector
        property="Notes"
        selectedValues={notes}
        availableValues={data.notes.filter(
          (note1) => !notes.some((note2) => note1.id === note2.id)
        )}
      /> */}
      <li className="editMenu__separator"></li>
      <MenuItem
        icon={<DeleteIcon />}
        size="small"
        label="Delete"
        onClick={handleDelete}
      />
    </ul>
  );
};

export default EditMenu;
