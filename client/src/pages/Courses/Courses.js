import { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import Sidebar from '../../components/Sidebar/Sidebar';
import UserHeader from '../../components/UserHeader/UserHeader';
import useUserAccess from '../../hooks/useUserAccess';
import { ReactComponent as UploadIcon } from '../../assets/icons/upload.svg';
import { ReactComponent as FilterIcon } from '../../assets/icons/filter.svg';
import { ReactComponent as SortIcon } from '../../assets/icons/sort.svg';
import { ReactComponent as GroupIcon } from '../../assets/icons/groupBy.svg';
import { ReactComponent as NewIcon } from '../../assets/icons/new.svg';
import MenuItem from '../../components/Shared/MenuItem/MenuItem';
import File from '../../components/Shared/File/File';
import Button from '../../components/Shared/Button/Button';

const Courses = () => {
  const { isLoading } = useUserAccess('/courses');
  const [existingFiles, setExistingFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);

  // Fetch existing files from the server
  const fetchExistingFiles = async () => {
    try {
      const response = await axios.get('/files');
      setExistingFiles(response.data.files);
    } catch (error) {
      console.error('Error fetching existing files:', error);
    }
  };

  // Fetch existing files on page load
  useEffect(() => {
    fetchExistingFiles();
  }, []);

  // Upload files to the server
  const onDrop = useCallback((selectedFiles) => {
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    axios
      .post('/upload', formData)
      .then((response) => {
        console.log(response.data);
        fetchExistingFiles();
      })
      .catch((error) => {
        if (error.response.data.error === 'File already exists') {
          console.error(error.response.data.error);
        } else {
          console.error(error.response.data.error);
        }
      });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="dashboard">
      <Sidebar />
      <main>
        <UserHeader pageName="Courses" />
        <div className="toolbar">
          <div className="toolbar__controls">
            <MenuItem icon={<GroupIcon />} label="Group">
              something
            </MenuItem>
            <MenuItem icon={<FilterIcon />} label="Filter">
              something
            </MenuItem>{' '}
            <MenuItem icon={<SortIcon />} label="Sort">
              something
            </MenuItem>
          </div>
          <div className="toolbar__displays">
            <MenuItem label="List" />
            <MenuItem label="Grid" />
            {existingFiles.length !== 0 && (
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <Button icon_l={<NewIcon />} label="New" />
              </div>
            )}
          </div>
        </div>
        {isLoading ? (
          <div>Loading...</div>
        ) : !existingFiles.length ? (
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
            {existingFiles.map((file, index) => (
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
