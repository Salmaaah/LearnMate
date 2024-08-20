import axios from 'axios';
import { useDataContext } from '../contexts/DataContext';

const useTodo = () => {
  const { fetchData } = useDataContext();

  // Create todo server side
  const handleCreateTodo = async (fileId, order) => {
    console.log('Creating todo');
    try {
      const response = await axios.post(`/createTodo/${fileId}/${order}`);
      fetchData();
      console.log(response.data.message);
      return response.data.todo.id;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.error(error.response.data.error);
      } else {
        console.error('Error creating todo:', error.message);
      }
      return null;
    }
  };

  // Update todo
  const handleUpdateTodo = async (todoId, data) => {
    console.log('Updating todo');

    axios
      .post(`/updateTodo/${todoId}`, data)
      .then((response) => {
        fetchData();
        console.log(response.data.message);
      })
      .catch((error) => {
        if (error.response.status === 400) {
          console.error(error.response.data.error);
        } else {
          console.error('Error updating todo:', error.message);
        }
      });
  };

  // Delete todo
  const handleDeleteTodo = async (todoId) => {
    console.log('Deleting todo');
    axios
      .post(`/deleteTodo/${todoId}`)
      .then((response) => {
        fetchData();
        console.log(response.data.message);
      })
      .catch((error) => {
        if (error.response.status === 400) {
          console.error(error.response.data.error);
        } else {
          console.error('Error deleting todo:', error.message);
        }
      });
  };

  return {
    handleCreateTodo,
    handleUpdateTodo,
    handleDeleteTodo,
  };
};

export default useTodo;
