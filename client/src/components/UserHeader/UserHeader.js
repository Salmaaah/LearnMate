import { ReactComponent as NotificationIcon } from '../../assets/icons/notification.svg';
import Search from '../Shared/Search/Search';
import NavItem from '../Shared/NavItem/NavItem';

const UserHeader = ({ pageName }) => {
  return (
    <header className="userHeader">
      <h3>{pageName}</h3>
      <div className="userHeader__centerSpace">
        <div>
          <Search />
        </div>
      </div>
      <ul className="userHeader__nav">
        <NavItem icon={<NotificationIcon />} position="br-tr">
          test notification
        </NavItem>
      </ul>
    </header>
  );
};

export default UserHeader;
