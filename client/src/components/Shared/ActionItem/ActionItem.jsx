import React, { useState, useRef, useEffect } from 'react';
import { useFileContext } from '../../../contexts/FileContext';
import { useEditorContext } from '../../../contexts/EditorContext';
import { useDataContext } from '../../../contexts/DataContext';
import useNote from '../../../hooks/useNote';
import { ReactComponent as BackIcon } from '../../../assets/icons/arrow.svg';
import { ReactComponent as NewIcon } from '../../../assets/icons/new.svg';
// import { ReactComponent as OpenTabIcon } from '../../../assets/icons/newTab.svg';
import { ReactComponent as ExpandIcon } from '../../../assets/icons/expand.svg';
import { ReactComponent as ReduceIcon } from '../../../assets/icons/reduce.svg';
import { ReactComponent as StarsIcon } from '../../../assets/icons/stars.svg';
// import { ReactComponent as FilesIcon } from '../../../assets/icons/files.svg';
import Button from '../Button/Button';
import MenuItem from '../MenuItem/MenuItem';
import Note from '../Note/Note';

const ActionItem = ({
  label,
  illustration,
  toggleSize,
  isVisible,
  isEnlarged,
  setIsEnlarged,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedChild, setSelectedChild] = useState('items');
  const childrenArray = React.Children.toArray(children);
  const existingItems = childrenArray.some((child) =>
    child.props.id.includes('items')
  );
  const { data, fetchData } = useDataContext();
  const { id: fileId, name, subject, project, notes, tags } = useFileContext();
  const noNote = {
    id: null,
    name: '',
    content: null,
  };
  const [currentNote, setCurrentNote] = useState(noNote);
  const { handleCreateNote, handleUpdateNote, handleDeleteNote } = useNote();

  const { initEditor, editorInstanceRef } = useEditorContext();
  const editorRef = useRef(null);

  const [paddingBottom, setPaddingBottom] = useState(300);
  const [numBlocks, setNumBlocks] = useState(1);

  // Update currentNote state when note is updated server-side
  useEffect(() => {
    const noteFromData = data.notes.find(
      (note) => note.id === parseInt(currentNote.id)
    );
    if (noteFromData) {
      if (
        noteFromData.name !== currentNote.name ||
        noteFromData.content !== currentNote.content
      ) {
        setCurrentNote((prevNote) => ({
          ...prevNote,
          name: noteFromData.name,
          content: JSON.parse(noteFromData.content),
        }));
      }
    }
  }, [data]);

  // TODO: Determine why streaming is not working
  const askAI = async (keyword) => {
    try {
      console.log('Starting request...');
      const response = await fetch(`/askAI/${keyword}/${fileId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Request completed. Response:', response);

      // Create a ReadableStream from the response body and read data from the stream
      const reader = response.body.getReader();

      // Function to read chunks from the stream
      const readStream = async () => {
        console.log('Reading stream...');
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('Stream ended');
            break;
          }
          // Convert the chunk to a string and log it
          console.log('Received chunk:', new TextDecoder().decode(value));
        }
      };

      // Start reading from the stream
      readStream();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  /**
   * Handles clicking on AI button (AIbar), New Note button (AI suggestions), or an existing note
   * Opens editor with AIbar/AIsuggestions for new notes or just editor for existing notes
   * @param {string} keyword - either 'create' or 'edit'
   * @param {object} data - needed only for when keyword is 'edit'
   */
  const handleButtonClick = async (keyword, data) => {
    setIsOpen(true);
    setSelectedChild(keyword);

    // Initialize the editor
    if (keyword === 'create') {
      const note = await handleCreateNote(fileId);
      setCurrentNote(note);
      initEditor(note.id, handleUpdateNote, '');
      // show suggestions on top of editor
      // show aibar
    } else if (keyword === 'edit') {
      setCurrentNote({
        id: data.id,
        name: data.name,
        content: data.content,
      });
      setSelectedChild('create'); // Because in handleChildren we select the editorJs element based on the name of its parent which is the 'create' element
      initEditor(undefined, handleUpdateNote, data);
    }
    editorRef.current = true;
    setIsEditing(true);

    // Detect when a block is added or removed from the editor element and update the padding accordingly
    // TODO: Move logic to EditorContext
    // TODO: add support for when the block height changes
    setTimeout(() => {
      // The editor element may have asynchronous initialization or rendering so we need to wait for a short period before checking for the element
      const editorElement = document.querySelector('.codex-editor__redactor');

      const handleMutation = (mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'childList') {
            const currentNumBlocks =
              editorElement.querySelectorAll('.ce-block').length;

            // Use callback form of setNumBlocks to ensure we're working with the latest state
            setNumBlocks((prevNumBlocks) => {
              if (currentNumBlocks > prevNumBlocks) {
                // Handle the addition of new ce-blocks
                setPaddingBottom((prevPaddingBottom) => {
                  const newPaddingBottom = Math.max(
                    prevPaddingBottom - 38.3906,
                    0
                  );
                  editorElement.style.paddingBottom = `${newPaddingBottom}px`;
                  return newPaddingBottom;
                });
              } else if (
                currentNumBlocks < prevNumBlocks &&
                currentNumBlocks <= 9
              ) {
                // Handle the removal of ce-blocks
                setPaddingBottom((prevPaddingBottom) => {
                  const newPaddingBottom = Math.max(
                    prevPaddingBottom + 38.3906,
                    0
                  );
                  editorElement.style.paddingBottom = `${newPaddingBottom}px`;
                  return newPaddingBottom;
                });
              }

              // Update the numBlocks state
              return currentNumBlocks;
            });
          }
        }
      };

      if (editorElement) {
        const observer = new MutationObserver(handleMutation);
        observer.observe(editorElement, { childList: true, subtree: true });

        // Initial count of ce-blocks
        setNumBlocks(editorElement.querySelectorAll('.ce-block').length);

        return () => {
          observer.disconnect();
        };
      }
    }, 1);
  };

  // Handles opening and closing of ActionItem
  const handleClick = async () => {
    !isOpen && existingItems && setSelectedChild('items');
    setIsOpen(!isOpen);
  };

  // Handles click on back button
  const handleBackClick = async (e) => {
    e.stopPropagation();

    if (
      isEditing &&
      (currentNote.content === null ||
        currentNote.content === '' ||
        currentNote.content.blocks.every((element) => {
          return element.data.text.replace(/&nbsp;/g, '') === '';
        }))
    ) {
      await handleDeleteNote(currentNote.id);
    }

    setIsEditing(false);
    setCurrentNote(noNote);
    setSelectedChild('items');
    setIsEnlarged(
      Object.fromEntries(Object.keys(isEnlarged).map((key) => [key, false]))
    );
  };

  const handleChildren = (children) => {
    return React.Children.map(children, (child) => {
      if (!child) return null;

      if (child.type === Note) {
        return React.cloneElement(child, {
          ...child.props,
          handleButtonClick,
          handleDeleteNote,
        });
      } else if (
        selectedChild === 'items' &&
        child.props.id &&
        child.props.id.includes(selectedChild) &&
        child.props.children
      ) {
        return React.cloneElement(child, {
          children: handleChildren(child.props.children),
        });
      } else if (
        (selectedChild === 'create' || selectedChild === 'generate') &&
        child.props.id &&
        child.props.id.includes(selectedChild)
      ) {
        return child;
      } else {
        return null;
      }
    });
  };

  // Close the ActionItem once all items are deleted to get back to the original state
  useEffect(() => {
    if (!existingItems) {
      setIsOpen(false);
    }
  }, [existingItems]);

  return (
    <section
      className={`actionItem${existingItems ? ' full' : ''}${
        isOpen ? ' open' : ' closed'
      }${isVisible ? '' : ' hidden'}`}
    >
      <div
        className="actionItem__header"
        onClick={() => {
          !isEditing && handleClick();
        }}
      >
        <div id="leftSection">
          {isEditing && isOpen ? (
            <div id="title2">
              <Button
                icon_l={<BackIcon />}
                variant="secondary"
                onClick={handleBackClick}
              />
              {isEditing && (
                <input
                  name="name"
                  type="text"
                  onClick={(event) => event.stopPropagation()}
                  onFocus={(event) => event.target.select()}
                  value={currentNote.name}
                  onChange={
                    (e) =>
                      setCurrentNote({
                        ...currentNote,
                        [e.target.name]: e.target.value,
                      }) // Update the value of the title as the user types
                  }
                  onBlur={() =>
                    handleUpdateNote(currentNote.id, 'name', currentNote.name)
                  }
                  //   onKeyDown={(e) => {
                  //     e.key === 'Enter' && handleSubmit(e);
                  //   }}
                  autoFocus
                />
              )}
            </div>
          ) : (
            <div id="title">{label}</div>
          )}

          {!isOpen && (
            <div id="subtitle">
              {existingItems ? (
                <>
                  {/* <FilesIcon /> */}
                  {notes.length === 1 ? (
                    <div>1 ITEM</div>
                  ) : (
                    <div>{notes.length} ITEMS</div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // handleButtonClick('generate');
                      askAI('summary');
                    }}
                  >
                    {<StarsIcon />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleButtonClick('create');
                    }}
                  >
                    {<NewIcon />}
                  </button>
                </>
              ) : label === 'Todos' ? (
                <>Create your first todo list</>
              ) : label === 'Quizz' ? (
                <>Test yourself with a custom generated quizz</>
              ) : (
                <>Create your {label} using AI or write your own</>
              )}
            </div>
          )}
          {!existingItems && !isOpen && (
            <div id="CTA">
              <Button
                icon_l={<StarsIcon />}
                label="Generate with AI"
                onClick={() => handleButtonClick('generate')}
              />
              <button onClick={() => handleButtonClick('create')}>
                Create your own
              </button>
            </div>
          )}
        </div>
        {!isOpen ? (
          <>{illustration}</>
        ) : (
          <div id="rightSection">
            {isEditing ? (
              <Button
                icon_l={isEnlarged.notes ? <ReduceIcon /> : <ExpandIcon />}
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSize();
                }}
              />
            ) : (
              <Button
                icon_l={<StarsIcon />}
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleButtonClick('generate');
                }}
              />
            )}
          </div>
        )}
        {/* <div>
          <NewIcon />
          <OpenTabIcon />
        </div> */}
      </div>
      {isOpen && (
        <div className="actionItem__content">
          {handleChildren(children)}
          {!isEditing && (
            <MenuItem
              as="div"
              icon={<NewIcon />}
              label="New Note"
              onClick={() => handleButtonClick('create')}
            />
          )}
        </div>
      )}
    </section>
  );
};

export default ActionItem;
