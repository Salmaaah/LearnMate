import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import axios from 'axios';

const DataContext = createContext();

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    username: '',
    files: [],
    subjects: [],
    projects: [],
    notes: [],
    flashcards: [],
    todos: [],
    tags: [],
  });
  const [dataIsLoading, setDataIsLoading] = useState(true);

  // Fetch existing files from the server
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get('/data');
      setData(response.data);
      setDataIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <DataContext.Provider
      value={{ data, setData, dataIsLoading, setDataIsLoading, fetchData }}
    >
      {children}
    </DataContext.Provider>
  );
};
