import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import { useSidebar } from '../../../contexts/SidebarContext';
import useOutsideClick from '../../../hooks/useOutsideClick';

const NavItem = ({ children, icon, label, position }) => {
  const [open, setOpen] = useState(false);
  const { isExpanded } = useSidebar(); // This will mess things up in cases where a navitem is not in a sidebar
  const navItemRef = useRef(null);

  useOutsideClick(navItemRef, () => setOpen(false));

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
