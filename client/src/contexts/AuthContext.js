import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

// This custom hook is designed to be used in conjunction with the AuthProvider component. When you use useAuth within a component that is a descendant of AuthProvider, it provides access to the user information stored in the context. If used outside of a AuthProvider, it throws an error to alert the developer about the incorrect usage.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  console.log(user);
  console.log(isLoggedIn);

  const login = (userData) => {
    // Set user information upon login
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    // Clear user information upon logout
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
