import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import UserHeader from '../../components/UserHeader/UserHeader';
import { useSidebar } from '../../contexts/SidebarContext';

const Layout = ({ pageName, children }) => {
  const { isExpanded } = useSidebar();
  const [isScrolled, setIsScrolled] = useState(false);

  const sidebarWidth = `${(isExpanded ? 253.641 : 69.5) / 16}rem`;
  const navbarHeight = `${66 / 16}rem`;

  const mainPaddingInline = `${30 / 16}rem`;
  const contentHeight = `calc(100vh - ${navbarHeight})`;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--off-white)' }}>
      <Sidebar />
      <main
        style={{
          overflow: 'auto',

          marginLeft: sidebarWidth,
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin-left 300ms ease-in-out',
        }}
      >
        <UserHeader
          pageName={pageName}
          style={{
            width: `calc(100% - ${sidebarWidth}`,
            paddingInline: `${mainPaddingInline}`,
            borderBottom: isScrolled ? '2px solid var(--M75)' : 'none',
          }}
        />
        <div
          style={{
            marginTop: navbarHeight,
            paddingInline: `${mainPaddingInline}`,
            minHeight: contentHeight,
            transition: 'margin-left 300ms ease-in-out',
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
