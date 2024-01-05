import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import Sidebar from '../../components/Sidebar/Sidebar';
import UserHeader from '../../components/UserHeader/UserHeader';
import useUserAccess from '../../hooks/useUserAccess';
import { useDataContext } from '../../contexts/DataContext';
import { ReactComponent as UploadIcon } from '../../assets/icons/upload.svg';
import { ReactComponent as FilterIcon } from '../../assets/icons/filter.svg';
import { ReactComponent as SortIcon } from '../../assets/icons/sort.svg';
import { ReactComponent as GroupIcon } from '../../assets/icons/groupBy.svg';
import { ReactComponent as NewIcon } from '../../assets/icons/new.svg';
import MenuItem from '../../components/Shared/MenuItem/MenuItem';
import File from '../../components/Shared/File/File';
import Button from '../../components/Shared/Button/Button';

const Courses = () => {
  const { isLoading: userAccessIsLoading } = useUserAccess('/courses');
  const { data, dataIsLoading, fetchData } = useDataContext();
  // const [filePreviews, setFilePreviews] = useState([]);

  // Upload files to the server
  const onDrop = useCallback(
    (selectedFiles) => {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      axios
        .post('/upload', formData)
        .then((response) => {
          fetchData();
          console.log(response.data.message);
        })
        .catch((error) => {
          if (error.response.status === 400) {
            console.error(error.response.data.error);
          } else {
            console.error(error.message);
          }
        });
    },
    [fetchData]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="dashboard">
      <Sidebar />
      <main>
        <UserHeader pageName="Courses" />
        <div className="toolbar">
          <ul className="toolbar__controls">
            <MenuItem size="medium" icon={<GroupIcon />} label="Group">
              something
            </MenuItem>
            <MenuItem size="medium" icon={<FilterIcon />} label="Filter">
              something
            </MenuItem>{' '}
            <MenuItem size="medium" icon={<SortIcon />} label="Sort">
              something
            </MenuItem>
          </ul>
          <ul className="toolbar__displays">
            <MenuItem size="medium" label="List" />
            <MenuItem size="medium" label="Grid" />
            {data.files.length !== 0 && (
              <li {...getRootProps()}>
                <input {...getInputProps()} />
                <Button icon_l={<NewIcon />} size="medium" label="New" />
              </li>
            )}
          </ul>
        </div>
        {userAccessIsLoading || dataIsLoading ? (
          <div>Loading...</div>
        ) : !data.files.length ? (
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''}`}
          >
            <input {...getInputProps()} />
            <UploadIcon />
            {isDragActive ? (
              <p>Drop files and folders here</p>
            ) : (
              <p>
                Drag and drop files and folders here <br /> or click to select
                manually
              </p>
            )}
          </div>
        ) : (
          <div className="files">
            {data.files.map((file, index) => (
              <div key={index}>
                <File file={file} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Courses;
