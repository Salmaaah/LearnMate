import { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded((prevExpanded) => !prevExpanded);
  };

  // Effect to set isExpanded to false on smaller screens
  useEffect(() => {
    const checkSidebarStatus = () => {
      const isSmallScreen = window.matchMedia('(max-width: 700px)').matches;
      setIsExpanded(!isSmallScreen);
    };

    window.addEventListener('resize', checkSidebarStatus);
    checkSidebarStatus(); // Initial check

    return () => {
      window.removeEventListener('resize', checkSidebarStatus);
    };
  }, []);

  return (
    <SidebarContext.Provider
      value={{ isExpanded, setIsExpanded, toggleSidebar }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
