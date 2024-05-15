// import { useState } from 'react';
import axios from 'axios';
import { useDataContext } from '../contexts/DataContext';

const useNote = () => {
  //   const [error, setError] = useState(null);
  const { fetchData } = useDataContext();

  // Create note server side
  const handleCreateNote = async (fileId, noteName) => {
    console.log('Creating note', noteName);
    try {
      const response = await axios.post(
        `/createNote/${fileId}${noteName ? `/${noteName}` : ''}`
      );
      await fetchData();
      console.log(response.data.message);
      return response.data.note;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.error(error.response.data.error);
      } else {
        console.error('Error creating note:', error.message);
      }
    }
  };

  // Update note name or content
  const handleUpdateNote = async (noteId, element, value) => {
    console.log('Updating', element, 'of note to', value);
    try {
      const response = await axios.post(`/updateNote/${noteId}/${element}`, {
        value: value,
      });
      await fetchData();
      console.log(response.data.message);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.error(error.response.data.error);
      } else {
        console.error('Error updating note:', error.message);
      }
    }
  };

  // Delete note
  const handleDeleteNote = async (noteId) => {
    console.log('Deleting note', noteId);
    try {
      const response = await axios.post(`/deleteNote/${noteId}`);
      await fetchData();
      console.log(response.data.message);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.error(error.response.data.error);
      } else {
        console.error('Error deleting note:', error.message);
      }
    }
  };

  return {
    handleCreateNote,
    handleUpdateNote,
    handleDeleteNote,
    // error,
  };
};

export default useNote;
