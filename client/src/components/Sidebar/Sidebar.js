import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSidebar } from '../../contexts/SidebarContext';
import axios from 'axios';
import MenuItem from '../Shared/MenuItem/MenuItem';
import NavItem from '../Shared/NavItem/NavItem';
import profilePicture from '../../assets/stockPhotos/profilePic.jpg';
import { ReactComponent as Placeholder } from '../../assets/icons/placeholder.svg';
import { ReactComponent as HomeIcon } from '../../assets/icons/home.svg';
import { ReactComponent as FilesIcon } from '../../assets/icons/files.svg';
import { ReactComponent as NotesIcon } from '../../assets/icons/notes.svg';
import { ReactComponent as TodoIcon } from '../../assets/icons/toDo.svg';
import { ReactComponent as MindmapIcon } from '../../assets/icons/mindMap.svg';

const Menu = () => {
  const { isExpanded, toggleSidebar } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);
  const [isLogoutSuccess, setLogoutSuccess] = useState(false);

  useEffect(() => {
    // Redirect to the login page after successful logout
    if (isLogoutSuccess) {
      window.location.href = '/login'; // You can use react-router-dom for navigation instead
    }
  }, [isLogoutSuccess]);

  const handleLogout = async () => {
    try {
      await axios.post('/logout');
      setLogoutSuccess(true);
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <aside className="sidebar">
      <nav
        className={`menu ${isHovered && isExpanded ? 'overlay' : ''} ${
          isExpanded ? 'expanded' : 'collapsed'
        }`}
      >
        <Link className="menu__logo" to="/">
          {<Placeholder />}
          <div className={`${isExpanded ? 'visible' : 'hidden'}`}>
            LearnMate
          </div>
        </Link>
        <ul className="menu__items">
          <MenuItem
            to="/dashboard"
            icon={<HomeIcon />}
            label="Dashboard"
            iconOnly={!isExpanded}
          />
          <MenuItem
            to="/"
            icon={<FilesIcon />}
            label="Courses"
            iconOnly={!isExpanded}
          />
          <MenuItem
            to="/"
            icon={<NotesIcon />}
            label="Notebook"
            iconOnly={!isExpanded}
          />
          <MenuItem
            to="/"
            icon={<TodoIcon />}
            label="To do"
            iconOnly={!isExpanded}
          />
          <MenuItem
            icon={<MindmapIcon />}
            label="Mind maps"
            iconOnly={!isExpanded}
          >
            <MenuItem to="/option1" icon={<HomeIcon />} label="Option 1" />
            <MenuItem to="/option2" icon={<FilesIcon />} label="Option 2" />
          </MenuItem>
          <MenuItem
            to="/"
            icon={<TodoIcon />}
            label="To do"
            iconOnly={!isExpanded}
          />
        </ul>
        <ul className="menu__footer">
          <NavItem
            icon={<img src={profilePicture} alt="Profile picture" />}
            label="Username"
            position={`${isExpanded ? 'tl-bl' : 'br-bl'}`}
          >
            <MenuItem to="/profile" icon={<HomeIcon />} label="Profile" />
            <MenuItem to="/settings" icon={<FilesIcon />} label="Settings" />
            <br />{' '}
            <MenuItem
              onClick={handleLogout}
              icon={<FilesIcon />}
              label="Log out"
            />
          </NavItem>
        </ul>
      </nav>
      <div
        className={`sidebarIcon ${isExpanded ? 'collapse' : 'expand'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={toggleSidebar}
      >
        <span></span>
        <span></span>
      </div>
    </aside>
  );
};

export default Menu;
