import { useLocation } from 'react-router-dom';
import { ReactComponent as NotificationIcon } from '../../assets/icons/notification.svg';
import { ReactComponent as HomeIcon } from '../../assets/icons/home.svg';
import { ReactComponent as FilesIcon } from '../../assets/icons/files.svg';
import NavItem from '../Shared/NavItem/NavItem';
import MenuItem from '../Shared/MenuItem/MenuItem';

const UserHeader = () => {
  const location = useLocation().pathname;

  return (
    <header className="userHeader">
      <div>Page Name</div>
      <ul className="userHeader__nav">
        <NavItem icon={<NotificationIcon />} />
        <NavItem>
          <div className="dropdown">
            <MenuItem
              to="/"
              currentLocation={location}
              icon={<HomeIcon />}
              label="Dashboard"
              more={true}
            />
            <MenuItem
              to="/"
              currentLocation={location}
              icon={<FilesIcon />}
              label="Courses"
              more={true}
            />
          </div>
        </NavItem>
      </ul>
    </header>
  );
};

export default UserHeader;
