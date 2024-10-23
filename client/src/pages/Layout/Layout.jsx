import { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import UserHeader from '../../components/UserHeader/UserHeader';
import { useSidebar } from '../../contexts/SidebarContext';

/**
 * Layout component that manages the overall structure of a page.
 *
 * @param {Object} props - Component props
 * @param {string} props.pageName - The name of the current page, used for styling and logic
 * @param {React.ReactNode} props.children - The content to be rendered inside the layout
 * @returns {JSX.Element} The rendered layout component
 */
const Layout = ({ pageName, children }) => {
  const { isExpanded } = useSidebar();
  const [isScrolled, setIsScrolled] = useState(false);

  // Calculate dimensions needed for styles
  const sidebarWidth = `${(isExpanded ? 253.641 : 69.5) / 16}rem`;
  const navbarHeight = `${66 / 16}rem`;
  const mainPaddingInline = `${30 / 16}rem`;
  const contentHeight = `calc(100vh - ${navbarHeight})`;

  // Effect to track scroll position
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Styles for the main content area
  const mainStyle = {
    overflow: 'visible', // to allow position sticky to work
    marginLeft: sidebarWidth,
    display: 'flex',
    flexDirection: 'column',
    transition: 'margin-left 300ms ease-in-out',
  };

  // Styles for the UserHeader component
  const userHeaderStyle = {
    width: `calc(100% - ${sidebarWidth})`,
    paddingInline: mainPaddingInline,
    borderBottom: isScrolled ? '2px solid var(--M75)' : 'none',
  };

  // Styles for the content container
  const contentContainerStyle = {
    container: 'main / inline-size',
    backgroundColor: 'var(--off-white)',
    overflow: 'visible', // to allow position sticky to work
    marginTop: navbarHeight,
    minHeight: contentHeight,
    transition: 'margin-left 300ms ease-in-out',
    ...(['Courses', 'Dashboard'].includes(pageName) && {
      paddingInline: mainPaddingInline,
    }),
  };

  return (
    <>
      <Sidebar />
      <main id="main" style={mainStyle}>
        <UserHeader pageName={pageName} style={userHeaderStyle} />
        <div style={contentContainerStyle}>{children}</div>
      </main>
    </>
  );
};

export default Layout;
