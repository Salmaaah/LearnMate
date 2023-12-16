import { Link } from 'react-router-dom';
import { useState } from 'react';

const NavItem = ({ children, icon }) => {
  const [open, setOpen] = useState(false);

  return (
    <li>
      <Link className="navItem" onClick={() => setOpen(!open)}>
        {icon}
      </Link>

      {open && children}
    </li>
  );
};

export default NavItem;
