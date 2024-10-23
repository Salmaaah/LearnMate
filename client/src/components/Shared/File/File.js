import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileContext } from '../../../contexts/FileContext';
import EditMenu from '../../EditMenu/EditMenu';
import useOutsideClick from '../../../hooks/useOutsideClick';
import { ReactComponent as FileIllustration } from '../../../assets/icons/file.svg';

/**
 * Displays a file thumbnail with its name, and provides edit menu functionalities.
 * Renders a preview based on the file type (image, video, or no preview).
 * Handles double-click to navigate to learn page.
 *
 * @component
 * @returns {JSX.Element} The rendered file component.
 */
const File = () => {
  const { id, name, type } = useFileContext();
  const fileType = type.split('/')[0];
  const [openEditMenu, setOpenEditMenu] = useState(false);
  const [menuPos, setMenuPos] = useState('no-position');
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const editMenuRef = useRef(null);

  // Truncate file name if it exceeds the maximum character limit
  const maxCharacters = 30;
  let displayedFilename = name;
  if (name.length > maxCharacters) {
    const middleIndex = Math.floor(name.length / 2);
    const charactersToRemove = Math.ceil((name.length - maxCharacters + 3) / 2);
    displayedFilename =
      name.slice(0, middleIndex - charactersToRemove) +
      '...' +
      name.slice(middleIndex + charactersToRemove);
  }

  /**
   * Handles single click on the file to toggle EditMenu.
   *
   * @param {React.MouseEvent} event - The click event.
   */
  const handleSingleClick = (e) => {
    // Prevent triggering when interacting with the EditMenu itself
    if (editMenuRef.current && editMenuRef.current.contains(e.target)) {
      return;
    }
    // Toggle the menu visibility
    if (openEditMenu) setOpenEditMenu(false);
    else setTimeout(() => setOpenEditMenu(true), 180); // Delay opening to avoid conflict with double-click
  };

  /**
   * Handles double-click to navigate to the file's learn page.
   *
   * @param {React.MouseEvent} event - The double-click event.
   */
  const handleDoubleClick = (e) => {
    // Prevent triggering when interacting with the EditMenu
    if (editMenuRef.current && editMenuRef.current.contains(e.target)) {
      return;
    }
    // Navigate to the file's learn page
    navigate(`/learn/${id}`);
  };

  /**
   * Handles keyboard navigation:
   * space to toggle the EditMenu, enter to navigate the file's "learn" page.
   *
   * @param {React.KeyboardEvent} event - The keyboard event.
   */
  const handleKeyDown = (e) => {
    // Prevent triggering when interacting with the EditMenu
    if (editMenuRef.current && editMenuRef.current.contains(e.target)) {
      return;
    }
    // If space key, toggle the menu visibility
    if (e.key === ' ') setOpenEditMenu(!openEditMenu);
    // If enter key, navigate to file content
    else if (e.key === 'Enter') navigate(`/learn/${id}`);
  };

  // Effect to dynamically position the EditMenu based on available space around the file
  useEffect(() => {
    if (openEditMenu) {
      // Retrieve the main container's margin-left, height, and full width
      const mainDiv = document.getElementById('main');
      const styles = window.getComputedStyle(mainDiv);
      const marginLeft = parseFloat(styles.marginLeft);
      const width = parseFloat(styles.width) + marginLeft;
      const height = parseFloat(styles.height);

      // Get the width and height of the EditMenu
      const editMenuRect = editMenuRef.current.getBoundingClientRect();
      const editMenuWidth = editMenuRect.width + 20; // Add margin space
      const editMenuHeight = editMenuRect.height + 20; // Add margin space

      // Get the bounding box of the File to determine its position on the screen
      const fileRect = fileRef.current.getBoundingClientRect();

      // Calculate the available space between the right edge of the file and the right edge of the main container
      const spaceOnRight = width - fileRect.right;
      // Calculate the available space between the left edge of the file and the left margin of the main container
      const spaceOnLeft = fileRect.left - marginLeft;
      // Calculate the available space between the bottom edge of the file and the bottom edge of the main container
      const spaceOnBottom = height - fileRect.bottom;
      // Calculate the available space between the left edge of the file and the right edge of the main container
      const spaceToRight = width - fileRect.left;
      // Calculate the available space between the right edge of the file and the left edge of the main container
      const spaceToLeft = fileRect.right - marginLeft;

      // Determine where to position the EditMenu based on available space around the File
      if (spaceOnRight >= editMenuWidth) setMenuPos('right');
      else if (spaceOnLeft >= editMenuWidth) setMenuPos('left');
      else if (spaceOnBottom >= editMenuHeight) {
        if (spaceToRight >= editMenuWidth) setMenuPos('bottom-left');
        else if (spaceToLeft >= editMenuWidth) setMenuPos('bottom-right');
        else setMenuPos('bottom-middle');
      } else {
        if (spaceToRight >= editMenuWidth) setMenuPos('top-left');
        else if (spaceToLeft >= editMenuWidth) setMenuPos('top-right');
        else setMenuPos('top-middle');
      }
    }
  }, [openEditMenu]);

  // Scroll the EditMenu into view when it opens and its position updates
  useEffect(() => {
    if (openEditMenu && menuPos !== 'no-position') {
      editMenuRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [openEditMenu, menuPos]);

  // Close the EditMenu if clicked outside the file container
  useOutsideClick(fileRef, openEditMenu ? () => setOpenEditMenu(false) : null);

  return (
    <div
      className={`file${openEditMenu ? ' open-menu' : ''}`}
      ref={fileRef}
      onClick={(e) => handleSingleClick(e)}
      onDoubleClick={(e) => handleDoubleClick(e)}
      tabIndex={0}
      onKeyDown={(e) => {
        handleKeyDown(e);
      }}
      role="gridcell"
      aria-labelledby={`filename-${id}`}
    >
      <div className="file__thumbnail">
        {/* Render file preview based on its type */}
        {fileType === 'image' ? (
          <img src={`/files/${id}`} alt={`Preview of ${name}`} />
        ) : fileType === 'video' ? (
          <video>
            <source src={`/files/${id}`} type={type} />
          </video>
        ) : (
          <FileIllustration />
        )}
      </div>
      <p id={`filename-${id}`}>{displayedFilename}</p>
      {/* Render edit menu if open */}
      {openEditMenu && <EditMenu ref={editMenuRef} position={menuPos} />}
    </div>
  );
};

export default File;
