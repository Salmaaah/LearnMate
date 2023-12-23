import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useSidebar } from '../../../contexts/SidebarContext';

const NavItem = ({ children, icon, label, position }) => {
  const [open, setOpen] = useState(false);
  const { isExpanded } = useSidebar(); // This will mess things up in cases where a navitem is not in a sidebar
  const navItemRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (navItemRef.current && !navItemRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <li className="navItem" ref={navItemRef}>
      <Link onClick={() => setOpen(!open)}>
        <div className="navItem__button">{icon}</div>
        <div className={`${isExpanded ? 'visible' : 'hidden'}`}>{label}</div>
      </Link>
      {open && <ul className={`navItem__dropdown ${position}`}>{children}</ul>}
    </li>
  );
};

export default NavItem;
