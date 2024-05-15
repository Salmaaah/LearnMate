import React, { useState, useRef, useEffect } from 'react';
import { useFileContext } from '../../../contexts/FileContext';
import { useEditorContext } from '../../../contexts/EditorContext';
import { useDataContext } from '../../../contexts/DataContext';
import useNote from '../../../hooks/useNote';
import useOutsideClick from '../../../hooks/useOutsideClick';
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
import Markdown from 'markdown-to-jsx';
import ReactDOMServer from 'react-dom/server';
import AIsearch from '../AIsearch/AIsearch';

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

  const { initEditor, editorInstanceRef, blockInfo, setBlockInfo } =
    useEditorContext();
  const editorInstance = editorInstanceRef.current;
  const [showAIsearch, setShowAIsearch] = useState(false);
  const AIsearchRef = useRef(null);

  const [paddingBottom, setPaddingBottom] = useState(300);
  const [numBlocks, setNumBlocks] = useState(1);

  const HTMLblocks = document.querySelectorAll('.ce-block');

  // Insert AI's markdown response into the editor
  const insertResponse = async (markdownText) => {
    if (editorInstance) {
      // Get the HTML string representation of the rendered Markdown text
      const htmlString = ReactDOMServer.renderToStaticMarkup(
        <Markdown>{markdownText}</Markdown>
      )
        .replace('<strong>', '<b>')
        .replace('</strong>', '</b>')
        .replace('<em>', '<i>')
        .replace('</em>', '</i>');

      // The following code is a workaround for two problems
      // problem 1: renderFromHTML clears the editor before inserting the rendered blocks
      // problem 2: even when saving the existing blocks using editorInstance.save() in hopes of inserting them back
      // after the AI response is rendered, we loose the position the user expects the response to be in due to editorJs'
      // elimination of the empty blocks on editorInstance.save().

      // Save existing blocks because renderFromHTML replaces everything
      const savedBlocks = (await editorInstance.save()).blocks;

      // Use blocks list from HTML, it includes empty blocks to get the index of the block currently in focus
      const currentIndex = Array.from(HTMLblocks).indexOf(blockInfo.block);

      // Get the id of the last full block before the current block
      let lastFullBlockId = null;
      for (let i = 0; i < currentIndex; i++) {
        const block = HTMLblocks[i];
        block.innerText !== ''
          ? (lastFullBlockId = block.getAttribute('data-id'))
          : void 0;
      }

      // Use that id to get its index in the blocks array retrived from editorJs
      let lastFullBlockIndex = null;
      if (lastFullBlockId !== null) {
        lastFullBlockIndex = savedBlocks.findIndex(
          (block) => block.id === lastFullBlockId
        );
      }

      // Render HTML content into EditorJS blocks
      // TODO: solve the "Can't find a Block to remove" error caused by renderFromHTML
      await editorInstance.blocks.renderFromHTML(htmlString);

      // Delay the insertion of the previous blocks until promise is fulfilled
      // TODO: Possible problem is that this imposed timeout is not enough for bigger renders, find surer to
      // wait until the HTML rendering is fully done.
      setTimeout(async () => {
        // Get the length of the rendered AI response blocks
        const AIresponselength = (await editorInstance.save()).blocks.length;

        // Insert previous blocks back while maintaining the order that the user expects
        savedBlocks.forEach((block, index) => {
          let updatedIndex = index;

          if (lastFullBlockIndex === null || index > lastFullBlockIndex) {
            updatedIndex = index + AIresponselength;
          }

          editorInstance.blocks.insert(
            block.type,
            block.data,
            block.config,
            updatedIndex // This is the goal of the workaround, knowing at exactly what index which block is going
            // to be inserted back into the editor after the AI response is rendered, while taking into consideration
            // the obsctacle imposed by editorJs's empty block elimination system
          );
        });
      }, 100);
    }
  };

  // Listen for focus events on the editor's ce blocks to save needed info on the block in focus
  useEffect(() => {
    if (HTMLblocks.length !== 0) {
      const handleFocus = (event) => {
        const block = event.target.closest('.ce-block');

        setBlockInfo((prevInfo) => ({
          ...prevInfo,
          block: block, // We didn't retrieve block from index because there seems to be a delay in editorInstance.blocks.getCurrentIndex() when focus is changed through up and down keys
          editableBlock: event.target, // we can also use block.querySelector('[contenteditable="true"]');
          isEmpty: event.target.innerHTML.replace(/&nbsp;/g, '') === '',
        }));
      };

      HTMLblocks.forEach((block) => {
        // block.setAttribute('tabindex', '0'); // Add tabindex attribute to make empty blocks focusable
        block.addEventListener('focus', handleFocus, true);
      });

      // Clean up event listeners on unmount
      return () => {
        HTMLblocks.forEach((block) => {
          block.removeEventListener('focus', handleFocus, true);
        });
      };
    }
  }, [HTMLblocks]);

  // Listen for space key event when editor is on focus to show AIsearch
  // and listen for backspace key event when AIsearch is on focus to hide AIsearch
  useEffect(() => {
    const handleKeyPress = async (event) => {
      // TODO: This works but blockInfo.isEmpty is slow to update when user types fast on a new line and hits space
      // I think this is caused by the slow onChange callback from editorjs
      if (event.key === ' ' && blockInfo.isEmpty) {
        setShowAIsearch(true);
      } else if (
        AIsearchRef.current !== null &&
        AIsearchRef.current.contains(event.target) &&
        event.key === 'Backspace' &&
        event.target.value === ''
      ) {
        setShowAIsearch(false);
      }
    };

    // Add event listener for key press
    document.addEventListener('keydown', handleKeyPress);

    // Clean up the event listener when component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [blockInfo.isEmpty, AIsearchRef.current]);

  // hide AIsearch on outside click
  // TODO: find a way to override the eventlistener created by editorJS on the padding area of the editor because it prevents UseOutsideClick to execute in that area
  useOutsideClick(AIsearchRef, () => setShowAIsearch(false));

  // Set focus back to previous block when AIsearch is closed
  useEffect(() => {
    editorInstance && !showAIsearch ? blockInfo.editableBlock.focus() : void 0;
  }, [showAIsearch]);

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
      if (
        // if the child is notes_items loop over its children which will be Note elements
        selectedChild === 'items' &&
        child.props.id &&
        child.props.id.includes(selectedChild) &&
        child.props.children
      ) {
        return React.cloneElement(child, {
          children: handleChildren(child.props.children),
        });
      } else if (child.type === Note) {
        // if we are inside notes_items and we found a Note element
        return React.cloneElement(child, {
          ...child.props,
          handleButtonClick,
          handleDeleteNote,
        });
      } else if (
        // if the child is notes_create loop over its children which are AIsearch and editorjs
        selectedChild === 'create' &&
        child.props.id &&
        child.props.id.includes(selectedChild) &&
        child.props.children
      ) {
        return React.cloneElement(child, {
          children: handleChildren(child.props.children),
        });
      } else if (child.type === AIsearch) {
        // if we are inside notes_create and we found AIsearch
        const editorContainer = document.getElementById('editorjs');

        return React.cloneElement(child, {
          ...child.props,
          AIsearchRef,
          showAIsearch,
          setShowAIsearch,
          topPosition: blockInfo.block
            ? blockInfo.block.getBoundingClientRect().top
            : 0,
          width: editorContainer
            ? editorContainer.getBoundingClientRect().width
            : 400,
          insertResponse,
        });
      } else if (child.props.id === 'editorjs') {
        // if we are inside notes_create and we found editorjs
        return child;
      } else if (
        // if the child is notes_generate just return it for now
        selectedChild === 'generate' &&
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
