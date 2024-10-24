import axios from 'axios';
import { useDataContext } from '../contexts/DataContext';

/**
 * Custom hook for managing flashcard operations, including creating, updating,
 * deleting, and uploading images for flashcards.
 *
 * @returns {{
 *   handleCreateFlashcard: Function,
 *   handleUpdateFlashcard: Function,
 *   handleUploadFlashcardImage: Function,
 *   handleDeleteFlashcardImage: Function,
 *   handleDeleteFlashcard: Function,
 * }}
 */
const useFlashcard = () => {
  const { fetchData } = useDataContext();

  /**
   * Creates a new flashcard on the server.
   *
   * @async
   * @param {number} fileId - The ID of the file associated with the flashcard.
   * @param {number} order - The order number for the flashcard.
   * @returns {Promise<number|null>} The ID of the created flashcard or null if failed.
   */
  const handleCreateFlashcard = async (fileId, order) => {
    console.log('Creating flashcard');
    try {
      const response = await axios.post(`/createFlashcard/${fileId}/${order}`);
      fetchData();
      console.log(response.data.message);
      return response.data.flashcard.id;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.error(error.response.data.error);
      } else {
        console.error('Error creating flashcard:', error.message);
      }
      return null;
    }
  };

  /**
   * Updates an existing flashcard on the server.
   *
   * @async
   * @param {number} flashcardId - The ID of the flashcard to update.
   * @param {object} data - The new data to update the flashcard with.
   * @param {string} [data.term] - The new term of the flashcard.
   * @param {string} [data.definition] - The new definition of the flashcard.
   * @param {number} [data.order] - The new order of the flashcard.
   * @returns {Promise<void>}
   */
  const handleUpdateFlashcard = async (flashcardId, data) => {
    console.log('Updating flashcard');

    axios
      .post(`/updateFlashcard/${flashcardId}`, data)
      .then((response) => {
        fetchData();
        console.log(response.data.message);
      })
      .catch((error) => {
        if (error.response.status === 400) {
          console.error(error.response.data.error);
        } else {
          console.error('Error updating flashcard:', error.message);
        }
      });
  };

  /**
   * Uploads an image for a specific flashcard.
   *
   * @async
   * @param {React.ChangeEvent<HTMLInputElement>} e - The file input change event.
   * @param {number} flashcardId - The ID of the flashcard to upload the image for.
   * @returns {Promise<void>}
   */
  const handleUploadFlashcardImage = async (e, flashcardId) => {
    console.log('Uploading flashcard image');
    const formData = new FormData();
    formData.append('image', e.target.files[0]);

    try {
      const response = await axios.post(
        `/uploadFlashcardImage/${flashcardId}`,
        formData
      );
      fetchData();
      console.log(response.data.message);
    } catch (error) {
      if (error.response?.status === 400) {
        console.error(error.response.data.error);
      } else {
        console.error('Error uploading flashcard image:', error.message);
      }
    }
  };

  /**
   * Deletes an image associated with a specific flashcard.
   *
   * @async
   * @param {number} flashcardId - The ID of the flashcard to delete the image from.
   * @returns {Promise<void>}
   */
  const handleDeleteFlashcardImage = async (flashcardId) => {
    console.log('Deleting flashcard image');

    try {
      const response = await axios.post(`/deleteFlashcardImage/${flashcardId}`);
      fetchData();
      console.log(response.data.message);
    } catch (error) {
      if (error.response?.status === 400) {
        console.error(error.response.data.error);
      } else {
        console.error('Error deleting flashcard image:', error.message);
      }
    }
  };

  /**
   * Deletes a specific flashcard from the server.
   *
   * @async
   * @param {number} flashcardId - The ID of the flashcard to delete.
   * @returns {Promise<void>}
   */
  const handleDeleteFlashcard = async (flashcardId) => {
    console.log('Deleting flashcard');
    axios
      .post(`/deleteFlashcard/${flashcardId}`)
      .then((response) => {
        fetchData();
        console.log(response.data.message);
      })
      .catch((error) => {
        if (error.response.status === 400) {
          console.error(error.response.data.error);
        } else {
          console.error('Error deleting flashcard:', error.message);
        }
      });
  };

  return {
    handleCreateFlashcard,
    handleUpdateFlashcard,
    handleUploadFlashcardImage,
    handleDeleteFlashcardImage,
    handleDeleteFlashcard,
  };
};

export default useFlashcard;
