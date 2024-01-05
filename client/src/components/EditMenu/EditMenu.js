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
  // { file_id, name, subject, project, tags }
  const { data, fetchData } = useDataContext();
  const { id, name, subject, project, tags } = useFile();

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
      <PropertySelector
        // file_id={id}
        property="Subject"
        selectedValues={subject}
        availableValues={data.subjects}
      />
      <PropertySelector
        // file_id={id}
        property="Project"
        selectedValues={project}
        availableValues={data.projects}
      />
      <PropertySelector
        // file_id={id}
        property="Tags"
        selectedValues={tags}
        availableValues={data.tags}
      />
      <li className="editMenu__seperator"></li>
      <MenuItem icon={<DeleteIcon />} label="Delete" onClick={handleDelete} />
    </ul>
  );
};

export default EditMenu;
