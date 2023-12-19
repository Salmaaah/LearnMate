import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// // Request interceptor to log headers
// axios.interceptors.request.use(
//   function (config) {
//     // Log the request headers
//     console.log('Request Headers:', config.headers);
//     return config;
//   },
//   function (error) {
//     // Do something with request error
//     return Promise.reject(error);
//   }
// );

const useUserAccess = (apiEndpoint) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(apiEndpoint);
        console.log(response.data.message);
      } catch (error) {
        if (
          // Trying to access user pages without authentication
          error.response &&
          error.response.status === 401 &&
          error.response.data.message === 'Authentication required.'
        ) {
          console.error(error.response.data.message);
          navigate('/login');
        } else if (
          // Trying to access login or signup pages after authentication
          error.response &&
          error.response.status === 403 &&
          error.response.data.message === 'User already logged in.'
        ) {
          console.error(error.response.data.message);
          navigate('/dashboard');
        } else {
          console.error('Error fetching data:', error.message);
        }
      } finally {
        // Set loading state to false when data fetching is complete
        setIsLoading(false);
      }
    };

    fetchData();
  }, [apiEndpoint, navigate]);

  return { isLoading };
};

export default useUserAccess;
