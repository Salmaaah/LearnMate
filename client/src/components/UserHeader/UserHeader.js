import PropTypes from 'prop-types';
import { ReactComponent as NotificationIcon } from '../../assets/icons/notification.svg';
import Search from '../Shared/Search/Search';
import NavItem from '../Shared/NavItem/NavItem';

/**
 * Displays the header section for a user page.
 *
 * @component
 * @param {object} props - Component properties.
 * @param {string} props.pageName: The name of the current page.
 * @param {string} props.style: Custom styles applied to the header component.
 * @returns {JSX.Element} - Rendered UserHeader component.
 *
 * @example
 * // Render a user header with lightgray background for the dashboard page
 * <UserHeader pageName="Dashboard" style={{ backgroundColor: 'lightgray' }} />
 */
const UserHeader = ({ pageName, style = {} }) => {
  return (
    <header className="user-header" style={style} role="banner">
      <div className="user-header__page-name">{pageName}</div>
      <div className="user-header__center-space">
        <Search />
      </div>
      <NavItem
        as="div"
        icon={<NotificationIcon />}
        position="br-tr"
        ariaLabel="Notifications"
      />
    </header>
  );
};

UserHeader.propTypes = {
  pageName: PropTypes.string,
  style: PropTypes.object,
};

export default UserHeader;
