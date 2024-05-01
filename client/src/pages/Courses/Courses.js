import { useState, useCallback } from 'react';
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
import { ReactComponent as NewIcon } from '../../assets/icons/new.svg';
import MenuItem from '../../components/Shared/MenuItem/MenuItem';
import File from '../../components/Shared/File/File';
import Button from '../../components/Shared/Button/Button';

const Courses = () => {
  const { isLoading: userAccessIsLoading } = useUserAccess('/courses');
  const { data, dataIsLoading, fetchData } = useDataContext();
  const properties = ['none', 'subject', 'project', 'tags'];
  const [groupBy, setGroupBy] = useState('none');
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

  // Debugging logs
  // if (data.files) {
  //   data.files.map((file) => {
  //     console.log(file.name);
  //     console.log(file.type);
  //     console.log(file.content);
  //   });
  // }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // Group files by a given key
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

  return (
    <Layout pageName="Courses">
      <div className="toolbar">
        <ul className="toolbar__controls">
          <MenuItem size="medium" icon={<GroupIcon />} label="Group">
            {properties.map((property) => (
              <MenuItem
                key={property}
                size="small"
                label={(
                  property.charAt(0).toUpperCase() + property.slice(1)
                ).replace(/s$/, '')}
                active={groupBy === property}
                onClick={() => setGroupBy(property)}
              />
            ))}
          </MenuItem>
          <MenuItem size="medium" icon={<FilterIcon />} label="Filter">
            something
          </MenuItem>
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
        Object.entries(groupFilesBy(data.files, groupBy))
          .sort(([groupA], [groupB]) => {
            if (groupA === 'null') return 1;
            if (groupB === 'null') return -1;
            return 0;
          })
          .map(([group, files]) => (
            <div key={group} className="filesContainer">
              {group !== 'undefined' && (
                <h3>
                  {group === 'null'
                    ? `No ${groupBy.toLowerCase()}`
                    : `${group}`}
                </h3>
              )}
              <div className="filesContainer__files">
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
