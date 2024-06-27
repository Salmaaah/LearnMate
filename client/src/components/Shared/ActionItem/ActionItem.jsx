import React, { useState, useEffect } from 'react';
import { useFileContext } from '../../../contexts/FileContext';
import { useEditorContext } from '../../../contexts/EditorContext';
import { useDataContext } from '../../../contexts/DataContext';
import useNote from '../../../hooks/useNote';
import useFlashcard from '../../../hooks/useFlashcard';
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
  provided,
  label,
  illustration,
  toggleSize,
  isVisible,
  isEnlarged,
  setIsEnlarged,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useDataContext();
  const { id: fileId, notes, flashcards } = useFileContext(); // todos, quizzes

  const actionItems = { notes, flashcards }; // todos, quizzes
  const subItems = actionItems[label.toLowerCase()];
  const [openSubItemId, setOpenSubItemId] = useState(null); // in case of subItems that are clickable such as notes and quizzes

  // Note specific code
  const { initEditor } = useEditorContext();
  const noNote = {
    id: null,
    name: '',
    content: null,
  };
  const [currentNote, setCurrentNote] = useState(noNote);
  const { handleCreateNote, handleUpdateNote, handleDeleteNote } = useNote();
  const { handleCreateFlashcard } = useFlashcard();
  const [showAIsearch, setShowAIsearch] = useState(false);

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

  /**
   * Handles clicking on New button, AI button, or a clickable subItem
   * @param {string} action - 'create', 'generate', 'edit', or 'view'
   * @param {object} item - needed only for when action is 'edit' or 'view'
   */
  const handleButtonClick = async (action, item) => {
    // Open ActionItem if not already open
    setIsOpen(true);

    if (label === 'Notes') {
      if (action === 'create' || action === 'generate') {
        // Handle new note creation
        const note = await handleCreateNote(fileId);
        setCurrentNote(note);
        setOpenSubItemId(note.id);

        // Wait for the visibility and open states in note to be saved to have the editorjs element in the DOM before trying to open note
        setTimeout(async () => {
          await initEditor(
            note.id,
            handleUpdateNote,
            '',
            action === 'generate'
          );
        }, 1);

        // Wait for the editor to finish initializing and have the autofocus set to determine the position of AIsearch
        // before showing it to make sure the focus goes to the AIsearch input after opening as expected
        setTimeout(() => {
          action === 'generate' ? setShowAIsearch(true) : void 0;
        }, 100);
      } else if (action === 'edit') {
        // Handle when an existing note is clicked
        setOpenSubItemId(item.id);
        setCurrentNote({
          id: item.id,
          name: item.name,
          content: item.content,
        });

        // Wait for the visibility and open states in note to be saved to have the editorjs element in the DOM before trying to open note
        setTimeout(async () => {
          await initEditor(undefined, handleUpdateNote, item);
        }, 1);
      }
    } else if (label === 'Quizzes') {
      if (action === 'generate') {
        // TODO: Handle quiz generation
      } else if (action === 'view') {
        // TODO: Handle quiz viewing
      }
    } else if (label === 'Flashcards') {
      if (action === 'create') {
        const order = children ? children.length + 1 : 1;
        handleCreateFlashcard(fileId, order);
      }
      // TODO: Handle flashcards generation
    } else if (label === 'todos') {
      // TODO: Handle todo item creation
    }
  };

  // Handles back click in case of clickable subItems like notes and quizzes
  const handleBackClick = async (e) => {
    e.stopPropagation();

    // When subItem is a note, we need to check if it's empty and delete it before closing
    if (
      label === 'Notes' &&
      (currentNote.content === null ||
        currentNote.content === '' ||
        currentNote.content.blocks.every((element) => {
          return element.data.text.replace(/&nbsp;/g, '') === '';
        }))
    ) {
      await handleDeleteNote(currentNote.id);
      setCurrentNote(noNote);
      setShowAIsearch(false);
    }

    // Reset the subItem ID and collapse all enlarged sections
    setOpenSubItemId(null);
    setIsEnlarged(
      Object.fromEntries(Object.keys(isEnlarged).map((key) => [key, false]))
    );
  };

  // Handles passing props to children of type Note for now
  const handleChildren = (children) => {
    return React.Children.map(children, (child) => {
      if (!child) return null;

      if (child.type === Note) {
        return React.cloneElement(child, {
          ...child.props,
          openSubItemId,
          handleButtonClick,
          handleDeleteNote,
          showAIsearch,
          setShowAIsearch,
        });
      } else {
        return child;
      }
    });
  };

  // Close the ActionItem in case all subItems were deleted to get back to the original state
  useEffect(() => {
    if (!children) {
      setIsOpen(false);
    }
  }, [children]);

  return (
    <section
      className={`actionItem${children ? ' full' : ''}${
        isOpen ? ' open' : ' closed'
      }${isVisible ? '' : ' hidden'}${
        isOpen && label === 'Flashcards' ? ' background' : ''
      }`}
    >
      <div
        className="actionItem__header"
        onClick={() => !openSubItemId && setIsOpen(!isOpen)}
      >
        <div id="leftSection">
          {/* TODO: This is focused solely on when a note is open, need to make it adaptable to when it's a quizz */}
          {openSubItemId && isOpen ? (
            <div id="title2">
              <Button
                icon_l={<BackIcon />}
                variant="secondary"
                onClick={handleBackClick}
              />
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
            </div>
          ) : (
            <div id="title">{label}</div>
          )}

          {!isOpen && (
            <div id="subtitle">
              {children ? (
                <>
                  {subItems.length === 1 ? (
                    <div>1 ITEM</div>
                  ) : (
                    <div>{subItems.length} ITEMS</div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleButtonClick('generate');
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
          {!children && !isOpen && (
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
            {label === 'Notes' && (
              <Button
                icon_l={<StarsIcon />}
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleButtonClick('generate');
                }}
              />
            )}
            <Button
              icon_l={
                isEnlarged[label.toLowerCase()] ? (
                  <ReduceIcon />
                ) : (
                  <ExpandIcon />
                )
              }
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                toggleSize();
              }}
            />
          </div>
        )}
      </div>
      {isOpen && (
        <div
          className={`actionItem__content${
            openSubItemId ? ' openSubItem' : ''
          }`}
        >
          {openSubItemId ? (
            handleChildren(children)
          ) : (
            <>
              <ul
                id="subItems"
                {...provided?.droppableProps}
                ref={provided?.innerRef}
              >
                {handleChildren(children)}
                {provided?.placeholder}
              </ul>
              <MenuItem
                as="div"
                icon={<NewIcon />}
                label={`New ${label.replace(/s$/, '')}`}
                onClick={() => handleButtonClick('create')}
              />
            </>
          )}
        </div>
      )}
    </section>
  );
};

export default ActionItem;
