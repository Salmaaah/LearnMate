import { createContext, useContext } from 'react';

// Create a context
const FileContext = createContext();

// Create a provider component
export const FileProvider = ({ children, file }) => {
  //   return <FileContext.Provider value={file}>{children}</FileContext.Provider>;
  const {
    id,
    name,
    type,
    created_at,
    subject,
    project,
    notes,
    flashcard_decks,
    todos,
    tags,
  } = file;
  return (
    <FileContext.Provider
      value={{
        id,
        name,
        type,
        created_at,
        subject,
        project,
        notes,
        flashcard_decks,
        todos,
        tags,
      }}
    >
      {children}
    </FileContext.Provider>
  );
};

// Create a custom hook for using the file context
export const useFileContext = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFileContext must be used within a FileProvider');
  }
  return context;
};
