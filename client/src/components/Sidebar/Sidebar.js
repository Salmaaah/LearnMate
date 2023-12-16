import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import MenuItem from '../Shared/MenuItem/MenuItem';
import placeholder from '../../assets//icons/placeholder.svg';
import { ReactComponent as HomeIcon } from '../../assets/icons/home.svg';
import { ReactComponent as FilesIcon } from '../../assets/icons/files.svg';
import { ReactComponent as NotesIcon } from '../../assets/icons/notes.svg';
import { ReactComponent as TodoIcon } from '../../assets/icons/toDo.svg';
import { ReactComponent as MindmapIcon } from '../../assets/icons/mindMap.svg';

const Menu = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation().pathname;

  return (
    <aside className="sidebar">
      <nav
        className={`menu ${isHovered && isExpanded ? 'overlay' : ''} ${
          isExpanded ? 'expanded' : 'collapsed'
        }`}
      >
        <Link className="menu__logo" to="/">
          <img src={placeholder} alt="" />
          <div className={`${isExpanded ? 'visible' : 'hidden'}`}>
            LearnMate
          </div>
        </Link>
        <ul className="menu__items">
          <MenuItem
            to="/dashboard"
            currentLocation={location}
            icon={<HomeIcon />}
            label="Dashboard"
            // more={true}
            expanded={isExpanded}
          />
          <MenuItem
            to="/"
            currentLocation={location}
            icon={<FilesIcon />}
            label="Courses"
            expanded={isExpanded}
          />
          <MenuItem
            to="/"
            currentLocation={location}
            icon={<NotesIcon />}
            label="Notebook"
            expanded={isExpanded}
          />
          <MenuItem
            to="/"
            currentLocation={location}
            icon={<TodoIcon />}
            label="To do"
            expanded={isExpanded}
          />
          <MenuItem
            to="/"
            currentLocation={location}
            icon={<MindmapIcon />}
            label="Mind maps"
            more={true}
            expanded={isExpanded}
          />
        </ul>
        <div className="menu__footer"></div>
      </nav>
      <div
        className={`sidebarIcon ${isExpanded ? 'collapse' : 'expand'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          if (isExpanded) {
            setIsExpanded(false);
          } else {
            setIsExpanded(true);
          }
        }}
      >
        <span></span>
        <span></span>
      </div>
    </aside>
  );
};

export default Menu;
