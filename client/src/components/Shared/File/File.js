import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileProvider } from '../../../contexts/FileContext';
import EditMenu from '../../EditMenu/EditMenu';
import useOutsideClick from '../../../hooks/useOutsideClick';

const File = ({ file }) => {
  const fileType = file.type.split('/')[0];
  const maxCharacters = 30;
  const [clickCount, setClickCount] = useState(0);
  const [openContextMenu, setOpenContextMenu] = useState(false);
  const [openEditMenu, setOpenEditMenu] = useState(false);
  const navigate = useNavigate();
  const fileRef = useRef(null);

  useOutsideClick(fileRef, () => setOpenEditMenu(false));
  useOutsideClick(fileRef, () => setOpenContextMenu(false));

  let displayedFilename = file.name;
  if (file.name.length > maxCharacters) {
    const middleIndex = Math.floor(file.name.length / 2);
    const charactersToRemove = Math.ceil(
      (file.name.length - maxCharacters + 3) / 2
    );
    displayedFilename =
      file.name.slice(0, middleIndex - charactersToRemove) +
      '...' +
      file.name.slice(middleIndex + charactersToRemove);
  }

  //   const handleClick = (event) => {
  //     event.preventDefault();

  //     setTimeout(() => {
  //       if (clickCount === 1) {
  //         console.log('Double click');
  //         navigate('/');
  //       } else {
  //         console.log('Single click');
  //         setOpenEditMenu(true);
  //       }
  //       setClickCount(0);
  //     }, 300);

  //     setClickCount((prevCount) => prevCount + 1);
  //   };

  let clickTimeout = null;

  const handleClick = (event) => {
    event.preventDefault();

    if (clickTimeout !== null) {
      clearTimeout(clickTimeout);
    }

    clickTimeout = setTimeout(() => {
      setClickCount((prevCount) => {
        if (prevCount === 2) {
          //   console.log('Double click');
          navigate('/learn', { state: { file: file } }); //`/${file.id}`
        } else if (prevCount === 1) {
          //   console.log('Single click');
          setOpenEditMenu(!openEditMenu);
        }
        return 0;
      });
    }, 200);

    setClickCount((prevCount) => prevCount + 1);
  };

  const handleContextMenu = (event) => {
    // event.preventDefault();
    setOpenContextMenu(true);
    // console.log('Right click');
  };

  return (
    <div ref={fileRef} className="file" onContextMenu={handleContextMenu}>
      <div className="file__thumbnail" onClick={handleClick}>
        {fileType === 'image' ? (
          <img src={`/files/${file.id}`} alt={file.name} />
        ) : fileType === 'video' ? (
          <video>
            <source src={`/files/${file.id}`} type={file.type} />
          </video>
        ) : (
          <p>No preview available for this file type.</p>
        )}
      </div>
      <p>{displayedFilename}</p>
      {openEditMenu && (
        // <EditMenu
        //   file_id={file.id}
        //   name={file.name}
        //   subject={file.subject}
        //   project={file.project}
        //   tags={file.tags}
        // />
        <FileProvider file={file}>
          <EditMenu />
        </FileProvider>
      )}
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
//         .get(`/files/${file.id}`, { responseType: 'blob' })
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
//       return <img src={src} alt={file.name} />;
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
