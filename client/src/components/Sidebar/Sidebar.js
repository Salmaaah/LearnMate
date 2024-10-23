import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSidebar } from '../../contexts/SidebarContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MenuItem from '../Shared/MenuItem/MenuItem';
import NavItem from '../Shared/NavItem/NavItem';
import profilePicture from '../../assets/stockPhotos/profilePic.jpg';
import { ReactComponent as LearnmateLogo } from '../../assets/brandLogos/learnmate.svg';
import { ReactComponent as HomeIcon } from '../../assets/icons/home.svg';
import { ReactComponent as FilesIcon } from '../../assets/icons/files.svg';
import { ReactComponent as NotesIcon } from '../../assets/icons/notes.svg';
import { ReactComponent as FlashcardsIcon } from '../../assets/icons/flashcards.svg';
import { ReactComponent as TodoIcon } from '../../assets/icons/toDo.svg';
import { ReactComponent as MindmapIcon } from '../../assets/icons/mindMap.svg';
import { ReactComponent as LogoutIcon } from '../../assets/icons/logout.svg';

/**
 * Sidebar navigation with expandable/collapsible functionality.
 *
 * @component
 * @returns {JSX.Element} - Rendered Sidebar component.
 */
const Sidebar = () => {
  const { isExpanded, toggleSidebar } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);
  const [isLogoutSuccess, setLogoutSuccess] = useState(false);
  const navigate = useNavigate();
  const menuItems = [
    {
      to: '/dashboard',
      icon: <HomeIcon />,
      label: 'Dashboard (soon)',
      disabled: true,
    },
    {
      to: '/courses',
      icon: <FilesIcon />,
      label: 'Courses',
      disabled: false,
    },
    {
      to: '/notebook',
      icon: <NotesIcon />,
      label: 'Notebook (soon)',
      disabled: true,
    },
    {
      to: '/flashcards',
      icon: <FlashcardsIcon />,
      label: 'Flashcards (soon)',
      disabled: true,
    },
    {
      to: '/todo',
      icon: <TodoIcon />,
      label: 'To do (soon)',
      disabled: true,
    },
    {
      icon: <MindmapIcon />,
      label: 'Mind maps',
      disabled: false,
      subMenu: [
        {
          to: '/sub1',
          label: 'sub 1',
          disabled: true,
        },
        {
          to: '/sub2',
          label: 'sub 2',
          disabled: true,
        },
      ],
    },
  ];

  // Effect to redirect to the login page after successful logout
  useEffect(() => {
    if (isLogoutSuccess) {
      navigate('/login');
    }
  }, [isLogoutSuccess]);

  /**
   * Handles the user logout process by sending a request to the server.
   *
   * @async
   * @returns {Promise<void>}
   */
  const handleLogout = async () => {
    try {
      await axios.post('/logout');
      setLogoutSuccess(true);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.error(error.response.data.error);
      }
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <aside className="sidebar" id="sidebar">
      <nav
        className={`menu${isHovered && isExpanded ? ' overlay' : ''}${
          isExpanded ? ' expanded' : ' collapsed'
        }`}
        aria-label="Sidebar navigation"
      >
        <Link className="menu__logo" to="" aria-label="Navigate to home">
          <LearnmateLogo />
          <div className={isExpanded ? 'visible' : 'hidden'}>LearnMate</div>
        </Link>
        <ul className="menu__items">
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              to={item.to}
              icon={item.icon}
              label={item.label}
              disabled={item.disabled}
              iconOnly={!isExpanded}
            >
              {item.subMenu && (
                <>
                  {item.subMenu.map((subItem, subIndex) => (
                    <MenuItem
                      key={subIndex}
                      to={subItem.to}
                      icon={subItem.icon}
                      label={subItem.label}
                      disabled={subItem.disabled}
                      iconOnly={!isExpanded}
                    />
                  ))}
                </>
              )}
            </MenuItem>
          ))}
        </ul>
        <NavItem
          as="div"
          icon={<img src={profilePicture} alt="Profile avatar" />}
          label="Username"
          iconOnly={!isExpanded}
          ariaLabel="User controls"
          position={isExpanded ? 'tl-bl' : 'br-bl'}
        >
          <MenuItem disabled={true} to="/profile" label="Profile(soon)" />
          <MenuItem disabled={true} to="/settings" label="Settings(soon)" />
          <br />
          <MenuItem
            onInteraction={handleLogout}
            icon={<LogoutIcon />}
            label="Log out"
          />
        </NavItem>
      </nav>
      <button
        className={`sidebarIcon ${isExpanded ? 'collapse' : 'expand'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={toggleSidebar}
        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        aria-haspopup="true"
        aria-controls="sidebar"
        aria-expanded={isExpanded}
      >
        <span></span>
        <span></span>
      </button>
    </aside>
  );
};

export default Sidebar;
