import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFile } from '../../../contexts/FileContext';

import EditMenu from '../../EditMenu/EditMenu';
import useOutsideClick from '../../../hooks/useOutsideClick';

const File = ({ file }) => {
  const { id, name, type } = useFile();

  const fileType = type.split('/')[0];
  const maxCharacters = 30;
  const [openContextMenu, setOpenContextMenu] = useState(false);
  const [openEditMenu, setOpenEditMenu] = useState(false);
  const navigate = useNavigate();
  const fileRef = useRef(null);

  useOutsideClick(fileRef, () => setOpenEditMenu(false));
  useOutsideClick(fileRef, () => setOpenContextMenu(false));

  let displayedFilename = name;
  if (name.length > maxCharacters) {
    const middleIndex = Math.floor(name.length / 2);
    const charactersToRemove = Math.ceil((name.length - maxCharacters + 3) / 2);
    displayedFilename =
      name.slice(0, middleIndex - charactersToRemove) +
      '...' +
      name.slice(middleIndex + charactersToRemove);
  }

  const handleContextMenu = (event) => {
    // event.preventDefault();
    setOpenContextMenu(true);
  };

  return (
    <div ref={fileRef} className="file" onContextMenu={handleContextMenu}>
      <div
        className="file__thumbnail"
        onClick={() => setTimeout(() => setOpenEditMenu(!openEditMenu), 180)} // a delay so that the edit menu does not appear on double click
        onDoubleClick={() => navigate(`/learn/${id}`)} // TODO: find a way to pass on the file object to the Learn component without state because as soon as you click on an menu in the sidebar the state gets lost, context could be a solution although not sure how it'll work in case of files open in different tabs
      >
        {fileType === 'image' ? (
          <img src={`/files/${id}`} alt={name} />
        ) : fileType === 'video' ? (
          <video>
            <source src={`/files/${id}`} type={file.type} />
          </video>
        ) : (
          <p>No preview available for this file type.</p>
        )}
      </div>
      <p>{displayedFilename}</p>
      {openEditMenu && <EditMenu />}
    </div>
  );
};

export default File;

//   const RenderFilePreview = ({ file }) => {
//     const [src, setSrc] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const fileType = file.type.split('/')[0];

//     useEffect(() => {
//       axios
//         .get(`/files/${id}`, { responseType: 'blob' })
//         .then((response) => {
//           const url = URL.createObjectURL(
//             new Blob([response.data], { type: file.type })
//           );
//           setSrc(url);
//           setLoading(false);
//         })
//         .catch((error) => {
//           console.error(error);
//           setLoading(false);
//         });
//     }, [file]);

//     if (loading) {
//       return <p>Loading...</p>;
//     }

//     if (fileType === 'image') {
//       return <img src={src} alt={name} />;
//     } else if (fileType === 'video') {
//       return (
//         <video controls>
//           <source src={src} type={file.type} />
//         </video>
//       );
//     } else {
//       return <p>No preview available for this file type.</p>;
//     }
//   };
