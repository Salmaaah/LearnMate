import axios from 'axios';
import { useDataContext } from '../contexts/DataContext';

/**
 * Custom hook for managing todos.
 * Provides functions to create, update, and delete todos.
 *
 * @returns {{
 *   handleCreateTodo: Function,
 *   handleUpdateTodo: Function,
 *   handleDeleteTodo: Function,
 * }}
 */
const useTodo = () => {
  const { fetchData } = useDataContext();

  /**
   * Create a new todo on the server.
   *
   * @async
   * @param {number} fileId - The ID of the file associated with the todo.
   * @param {number} order - The order of the todo in the list.
   * @returns {Promise<number|null>} The ID of the created todo, or null if an error occurred.
   */
  const handleCreateTodo = async (fileId, order) => {
    console.log('Creating todo');

    try {
      const response = await axios.post(`/createTodo/${fileId}/${order}`);
      fetchData();
      console.log(response.data.message);
      return response.data.todo;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.error(error.response.data.error);
      } else {
        console.error('Error creating todo:', error.message);
      }
      return null;
    }
  };

  /**
   * Update an existing todo on the server.
   *
   * @async
   * @param {number} todoId - The ID of the todo to update.
   * @param {{[content]: string, [order]: number, [done]: boolean}} data - The data object to update the todo with.
   * @returns {Promise<void>} Resolves when the update is complete.
   */
  const handleUpdateTodo = async (todoId, data) => {
    console.log('Updating todo');

    try {
      const response = await axios.post(`/updateTodo/${todoId}`, data);
      fetchData();
      console.log(response.data.message);
    } catch (error) {
      if (error.response?.status === 400) {
        console.error(error.response.data.error);
      } else {
        console.error('Error uploading todo:', error.message);
      }
    }
  };

  /**
   * Delete a todo from the server.
   *
   * @async
   * @param {number} todoId - The ID of the todo to delete.
   * @returns {Promise<void>} Resolves when the deletion is complete.
   */
  const handleDeleteTodo = async (todoId) => {
    console.log('Deleting todo');

    try {
      const response = await axios.post(`/deleteTodo/${todoId}`);
      fetchData();
      console.log(response.data.message);
    } catch (error) {
      if (error.response?.status === 400) {
        console.error(error.response.data.error);
      } else {
        console.error('Error deleting todo:', error.message);
      }
    }
  };

  return {
    handleCreateTodo,
    handleUpdateTodo,
    handleDeleteTodo,
  };
};

export default useTodo;
