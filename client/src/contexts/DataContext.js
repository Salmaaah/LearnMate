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
    tags: [],
  });
  const [dataIsLoading, setDataIsLoading] = useState(true);

  // Fetch existing files from the server
  const fetchData = async () => {
    try {
      const response = await axios.get('/data');
      setData({
        files: response.data.files,
        subjects: response.data.subjects,
        projects: response.data.projects,
        tags: response.data.tags,
      });
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
