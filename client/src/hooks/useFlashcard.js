// import { useState } from 'react';
import axios from 'axios';
import { useDataContext } from '../contexts/DataContext';

const useFlashcard = () => {
  const { fetchData } = useDataContext();

  // Create flashcard server side
  const handleCreateFlashcard = async (fileId, order) => {
    console.log('Creating flashcard');
    axios
      .post(`/createFlashcard/${fileId}/${order}`)
      .then((response) => {
        fetchData();
        console.log(response.data.message);
      })
      .catch((error) => {
        if (error.response.status === 400) {
          console.error(error.response.data.error);
        } else {
          console.error('Error creating flashcard:', error.message);
        }
      });
  };

  // Update flashcard
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

  // Upload flashcard image
  const handleUploadFlashcardImage = (e, flashcardId) => {
    const formData = new FormData();
    formData.append('image', e.target.files[0]);
    axios
      .post(`/uploadFlashcardImage/${flashcardId}`, formData)
      .then((response) => {
        fetchData();
        console.log(response.data.message);
      })
      .catch((error) => {
        if (error.response.status === 400) {
          console.error(error.response.data.error);
        } else {
          console.error(error.message);
        }
      });
  };

  // Delete flashcard image
  const handleDeleteFlashcardImage = (flashcardId) => {
    console.log('Deleting flashcard image');

    axios
      .post(`/deleteFlashcardImage/${flashcardId}`)
      .then((response) => {
        fetchData();
        console.log(response.data.message);
      })
      .catch((error) => {
        if (error.response.status === 400) {
          console.error(error.response.data.error);
        } else {
          console.error('Error deleting flashcard image:', error.message);
        }
      });
  };

  // Delete flashcard
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
