import { createContext, useContext } from 'react';

// Create a context
const FileContext = createContext();

// Create a provider component
export const FileProvider = ({ children, file }) => {
  //   return <FileContext.Provider value={file}>{children}</FileContext.Provider>;
  const { id, name, type, created_at, subject, project, tags } = file;
  return (
    <FileContext.Provider
      value={{ id, name, type, created_at, subject, project, tags }}
    >
      {children}
    </FileContext.Provider>
  );
};

// Create a custom hook for using the file context
export const useFile = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFile must be used within a FileProvider');
  }
  return context;
};