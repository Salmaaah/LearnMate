import { useState, useCallback, useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import Layout from '../Layout/Layout';
import useUserAccess from '../../hooks/useUserAccess';
import { useDataContext } from '../../contexts/DataContext';
import { FileProvider } from '../../contexts/FileContext';
import { ReactComponent as UploadIcon } from '../../assets/icons/upload.svg';
import { ReactComponent as FilterIcon } from '../../assets/icons/filter.svg';
import { ReactComponent as SortIcon } from '../../assets/icons/sort.svg';
import { ReactComponent as GroupIcon } from '../../assets/icons/groupBy.svg';
import { ReactComponent as ListIcon } from '../../assets/icons/summarize.svg';
import { ReactComponent as GridIcon } from '../../assets/icons/grid.svg';
import { ReactComponent as NewIcon } from '../../assets/icons/new.svg';
import MenuItem from '../../components/Shared/MenuItem/MenuItem';
import File from '../../components/Shared/File/File';
import Button from '../../components/Shared/Button/Button';

/**
 * Component page for displaying and managing courses.
 * Handles file uploads, file grouping, and user interactions.
 *
 * @component
 * @returns {JSX.Element} The Courses component.
 */
const Courses = () => {
  const { isLoading: userAccessIsLoading } = useUserAccess('/courses');
  const { data, dataIsLoading, fetchData } = useDataContext();
  const properties = ['none', 'subject', 'project', 'tags'];
  const [groupBy, setGroupBy] = useState('none');
  const [iconOnly, setIconOnly] = useState(false);
  const [halfControls, setHalfControls] = useState(false);

  // Fetch files on mount and set control buttons for responsiveness
  useEffect(() => {
    fetchData();

    const checkToolbarWidth = () => {
      const toolbar = document.getElementsByClassName('toolbar')[0];
      const isSmallScreen = toolbar.offsetWidth < 740;
      const isXsmallScreen = toolbar.offsetWidth < 330;
      setIconOnly(isSmallScreen);
      setHalfControls(isXsmallScreen);
    };

    window.addEventListener('resize', checkToolbarWidth);
    checkToolbarWidth(); // Initial check

    return () => {
      window.removeEventListener('resize', checkToolbarWidth);
    };
  }, [fetchData]);

  /**
   * Handles file upload via drag-and-drop.
   *
   * @async
   * @param {File[]} selectedFiles - Array of files selected by the user.
   * @returns {Promise<void>}
   */
  const onDrop = useCallback(
    async (selectedFiles) => {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append('files', file));

      try {
        const response = await axios.post('/upload', formData);
        fetchData();
        console.log(response.data.message);
      } catch (error) {
        if (error.response?.status === 400) {
          console.error(error.response.data.error);
        } else {
          console.error(error.message);
        }
      }
    },
    [fetchData]
  );

  // Destructure necessary props from useDropzone to manage drag-and-drop functionality for file uploads.
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  /**
   * Handles file grouping by a given key.
   *
   * @param {Array<object>} files - Array of files to group.
   * @param {string} key - Key to group files by.
   * @returns {Object.<string, Array<object>>} Grouped files object.
   */
  const groupFilesBy = (files, key) => {
    return files.reduce((groups, file) => {
      const keys = key.split('.');
      let value = file;

      keys.forEach((k) => {
        if (Array.isArray(value)) {
          value = value.map((v) => v[k]).join(', ');
        } else if (value[k] && Array.isArray(value[k])) {
          value[k].forEach((tag) => {
            const tagValue = tag.name;
            groups[String(tagValue)] = groups[String(tagValue)] || [];
            groups[String(tagValue)].push(file);
          });
          value = null;
        } else {
          value = value[k];
        }
      });

      groups[String(value)] = groups[String(value)] || [];
      groups[String(value)].push(file);

      return groups;
    }, {});
  };

  // Group files by the 'groupby' key specified by the user and memoize the result for optimization.
  const groupedFiles = useMemo(
    () => groupFilesBy(data.files, groupBy),
    [data.files, groupBy]
  );

  // Convert the grouped files object into an array of key-value pairs and sorts the data so that items with no group appear last
  const sortedGroupedFiles = Object.entries(groupedFiles).sort(
    ([groupA], [groupB]) => {
      if (groupA === 'null') return 1;
      if (groupB === 'null') return -1;
      return 0;
    }
  );

  return (
    <Layout pageName="Courses">
      <div className="toolbar">
        <ul className="toolbar__controls">
          <MenuItem
            disabled={true}
            size="medium"
            icon={<GroupIcon />}
            label="Group"
            iconOnly={iconOnly}
          >
            {properties.map((property) => (
              <MenuItem
                key={property}
                size="small"
                label={(
                  property.charAt(0).toUpperCase() + property.slice(1)
                ).replace(/s$/, '')}
                active={groupBy === property}
                onInteraction={() => setGroupBy(property)}
              />
            ))}
          </MenuItem>
          <MenuItem
            disabled={true}
            size="medium"
            icon={<FilterIcon />}
            label="Filter"
            iconOnly={iconOnly}
          >
            future sub-item
          </MenuItem>
          <MenuItem
            disabled={true}
            size="medium"
            icon={<SortIcon />}
            label="Sort"
            iconOnly={iconOnly}
          >
            future sub-item
          </MenuItem>
        </ul>
        <ul className="toolbar__displays">
          {!halfControls && (
            <>
              <MenuItem
                disabled={true}
                size="medium"
                icon={<ListIcon />}
                label="List"
                iconOnly={iconOnly}
              />
              <MenuItem
                disabled={true}
                size="medium"
                icon={<GridIcon />}
                label="Grid"
                iconOnly={iconOnly}
              />
            </>
          )}
          {data.files.length !== 0 && (
            <li {...getRootProps()} tabIndex="-1">
              <input {...getInputProps()} />
              <Button
                icon_l={<NewIcon />}
                size="medium"
                label={iconOnly ? '' : 'New'}
                ariaLabel={'Add new files'}
              />
            </li>
          )}
        </ul>
      </div>
      {userAccessIsLoading || dataIsLoading ? (
        <div role="status" aria-live="polite">
          Loading...
        </div>
      ) : !data.files.length ? (
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'active' : ''}`}
          role="region"
          aria-live="polite"
        >
          <input {...getInputProps()} />
          <UploadIcon />
          {isDragActive ? (
            <p>Drop files here</p>
          ) : (
            <p>
              Drag and drop files here <br /> or click to select manually
            </p>
          )}
        </div>
      ) : (
        sortedGroupedFiles.map(([group, files]) => (
          <div key={group} className="filesContainer">
            {group !== 'undefined' && (
              <h3>
                {group === 'null' ? `No ${groupBy.toLowerCase()}` : `${group}`}
              </h3>
            )}
            <div className="filesContainer__files" role="grid">
              {files.map((file, index) => (
                <FileProvider file={file} key={index}>
                  <File />
                </FileProvider>
              ))}
            </div>
          </div>
        ))
      )}
    </Layout>
  );
};

export default Courses;
