import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * Custom hook to manage user access by fetching data from a specified API endpoint.
 *
 * @param {string} apiEndpoint - The API endpoint to fetch user data from.
 * @returns {{ isLoading: boolean }} - An object containing the loading state.
 */
const useUserAccess = (apiEndpoint) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(apiEndpoint);
        console.log(response.data.message);
      } catch (error) {
        if (error.response) {
          const { status, data } = error.response;

          if (status === 401 && data.error === 'Authentication required.') {
            // Unauthenticated user attempting to access protected pages
            console.error(data.message);
            navigate('/login');
          } else if (status === 400 && data.error === 'User does not exist.') {
            // Invalid credentials during login
            console.error(data.message);
            navigate('/welcome');
          } else if (
            status === 403 &&
            data.error === 'User already logged in.'
          ) {
            // Authenticated user trying to access login or signup pages
            console.error(data.message);
            navigate('/courses'); // Update to '/dashboard' when ready
          } else {
            console.error('Unhandled error:', data.message || error.message);
          }
        } else {
          console.error('Error fetching data:', error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [apiEndpoint, navigate]);

  return { isLoading };
};

export default useUserAccess;
