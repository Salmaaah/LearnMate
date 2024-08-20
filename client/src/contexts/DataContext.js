import { createContext, useContext, useState, useEffect } from 'react';
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
  const fetchData = async () => {
    try {
      // Check if data exists in browser storage
      // const storedData = localStorage.getItem('data');

      // if (storedData) {
      //   // Data exists in browser storage, parse and set it
      //   setData(JSON.parse(storedData));
      // } else {
      // Data doesn't exist in browser storage, fetch it from the server
      const response = await axios.get('/data');
      // // Store fetched data in browser storage
      // localStorage.setItem('data', JSON.stringify(response.data));
      // Set data state
      setData(response.data);
      // }
      setDataIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <DataContext.Provider
      value={{ data, setData, dataIsLoading, setDataIsLoading, fetchData }}
    >
      {children}
    </DataContext.Provider>
  );
};
