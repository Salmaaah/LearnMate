import { useState, useEffect } from 'react';
import axios from 'axios';
import { ReactComponent as NotificationIcon } from '../../assets/icons/notification.svg';
import { ReactComponent as HomeIcon } from '../../assets/icons/home.svg';
import { ReactComponent as FilesIcon } from '../../assets/icons/files.svg';
import NavItem from '../Shared/NavItem/NavItem';
import MenuItem from '../Shared/MenuItem/MenuItem';

const UserHeader = () => {
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
    <header className="userHeader">
      <div>Page Name</div>
      <ul className="userHeader__nav">
        <NavItem icon={<NotificationIcon />} />
        <NavItem>
          <ul className="dropdown">
            <MenuItem to="/profile" icon={<HomeIcon />} label="Profile" />
            <MenuItem
              to="/settings"
              icon={<FilesIcon />}
              label="Settings"
              more={true}
            />
            <br />
            <MenuItem
              onClick={handleLogout}
              icon={<FilesIcon />}
              label="Log out"
            />
          </ul>
        </NavItem>
      </ul>
    </header>
  );
};

export default UserHeader;
