import axios from 'axios';
import { useDataContext } from '../contexts/DataContext';

/**
 * Custom hook for managing notes, providing functions to create, update, and delete notes.
 *
 * @returns {{
 *   handleCreateNote: Function,
 *   handleUpdateNote: Function,
 *   handleDeleteNote: Function,
 * }}
 */
const useNote = () => {
  const { fetchData } = useDataContext();

  /**
   * Creates a new note on the server.
   *
   * @async
   * @param {number} fileId - The ID of the file associated with the note.
   * @param {string} [noteName] - The optional name of the note to create.
   * @returns {Promise<Object|undefined>} The created note object, or undefined if the creation failed.
   */
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

  /**
   * Updates the specified element (name or content) of an existing note.
   *
   * @async
   * @param {number} noteId - The ID of the note to update.
   * @param {string} element - The element of the note to update (e.g., 'name' or 'content').
   * @param {string} value - The new value to set for the specified element.
   * @returns {Promise<void>}
   */
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

  /**
   * Deletes a note from the server.
   *
   * @async
   * @param {number} noteId - The ID of the note to delete.
   * @returns {Promise<void>}
   */
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
  };
};

export default useNote;
