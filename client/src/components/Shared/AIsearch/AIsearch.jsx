import { useEffect, useState, useRef } from 'react';
import { useDataContext } from '../../../contexts/DataContext';
import { useFileContext } from '../../../contexts/FileContext';
import { useEditorContext } from '../../../contexts/EditorContext';
import useOutsideClick from '../../../hooks/useOutsideClick';
import useFlashcard from '../../../hooks/useFlashcard';
import useAI from '../../../hooks/useAI';
import { ReactComponent as StarsIcon } from '../../../assets/icons/stars.svg';
import { ReactComponent as GoIcon } from '../../../assets/icons/arrow.svg';
import MenuItem from '../MenuItem/MenuItem';
import { ReactComponent as WriteIcon } from '../../../assets/icons/write.svg';
import { ReactComponent as SummarizeIcon } from '../../../assets/icons/summarize.svg';
import Markdown from 'markdown-to-jsx';
import ReactDOMServer from 'react-dom/server';

const AIsearch = ({ context, parentId, showAIsearch, setShowAIsearch }) => {
  const { id: fileId } = useFileContext();

  // When Context = Notes //////////////////////////////////////////////////////
  const { editorInstanceRef, blockInfo, setBlockInfo } = useEditorContext();
  const editorInstance = editorInstanceRef.current;
  const [HTMLblocks, setHTMLblocks] = useState(null);
  const prevHTMLblocksRef = useRef(null);
  //////////////////////////////////////////////////////////////////////////////

  // When Context = Flashcards /////////////////////////////////////////////////
  const { data } = useDataContext();
  const [elementInFocus, setElementInFocus] = useState(null);
  const AIinputRef = useRef(null);
  const { handleUpdateFlashcard } = useFlashcard();
  //////////////////////////////////////////////////////////////////////////////

  const { askAI } = useAI();
  const [width, setWidth] = useState(400); // TODO: add dynamic width adjustment like the commented code in PropertySelector
  const [topPosition, setTopPosition] = useState(-11);
  const AIsearchRef = useRef(null);
  // const [AIresponse, setAIresponse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const suggestions = [
    {
      context: 'Notes',
      category: '',
      name: 'Continue writing',
      keyword: 'continue',
      icon: <WriteIcon />,
    },
    {
      context: 'Notes',
      category: 'Generate from material',
      name: 'Summarize',
      keyword: 'summarize',
      icon: <SummarizeIcon />,
    },
    {
      context: 'Notes',
      category: 'Edit or review',
      name: 'Improve writing',
      keyword: 'improve',
      icon: <></>,
    },
    {
      context: 'Flashcards',
      category: 'Create with AI',
      name: 'Create flashcard',
      keyword: 'create',
      icon: <></>,
    },
  ];
  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.context === context &&
      suggestion.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    searchTerm === '' && e.target.value === ' '
      ? setSearchTerm('') // Prevent space from being typed at the start
      : setSearchTerm(e.target.value); // set search term to user input
  };

  // Effect to set HTMLblocks and AIsearch width
  useEffect(() => {
    if (context === 'Notes' && editorInstance) {
      setHTMLblocks(document.querySelectorAll('.ce-block'));

      const editorContainer = document.getElementById('editorjs');
      setWidth(editorContainer.getBoundingClientRect().width);
    }
  }, [editorInstance]);

  // Effect to set AIsearch topPosition
  useEffect(() => {
    if (context === 'Notes' && blockInfo?.block)
      setTopPosition(blockInfo.block.getBoundingClientRect().top);
  }, [blockInfo?.block]);

  // Effect to listen for focus events on editor's blocks and save blockInfo
  useEffect(() => {
    if (context === 'Notes' && HTMLblocks?.length > 0) {
      // Listen for autofocus event
      if (prevHTMLblocksRef.current === null) {
        const handleAutofocus = () => {
          const block = HTMLblocks[0];
          const editableBlock = block.querySelector('[contenteditable="true"]');

          setBlockInfo((prevInfo) => ({
            ...prevInfo,
            block: block,
            editableBlock: editableBlock,
            isEmpty: editableBlock.innerHTML.replace(/&nbsp;/g, '') === '',
          }));
        };

        document.addEventListener('editorFocus', handleAutofocus);

        // Clean up event listener on unmount
        return () => {
          document.removeEventListener('editorFocus', handleAutofocus);
        };
      }

      // Update the ref to the current value of HTMLblocks
      prevHTMLblocksRef.current = HTMLblocks;

      // Listen for user induced focus
      const handleFocus = (event) => {
        const block = event.target.closest('.ce-block');

        setBlockInfo((prevInfo) => ({
          ...prevInfo,
          block: block, // We didn't retrieve block from index because there seems to be a delay in editorInstance.blocks.getCurrentIndex() when focus is changed through up and down keys
          editableBlock: event.target,
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

  // Effect to handle space key event for showing AIsearch and backspace key event for hiding AIsearch
  useEffect(() => {
    const handleKeyPress = async (event) => {
      // TODO: In case of notes, blockInfo.isEmpty is slow to update when user types fast on a new line and hits space
      // I think this is caused by the slow onChange callback from editorjs\
      if (
        event.key === ' ' &&
        ((context === 'Notes' && blockInfo.isEmpty) ||
          (context === 'Flashcards' &&
            event.target.id === parentId && // not needed in case of notes because only one is open at a time, unlike flashcards
            (event.target.value === '' || event.isTrusted === false))) // when event is triggered by actually presssing the space button the textArea needs to be empty in order for the AIsearch to show up, but in case of clicking the stars button that dispatches a fake keydown event, we can force show AIsearch even with text area being full
      ) {
        setShowAIsearch(true);
        context === 'Flashcards' &&
          setWidth(event.target.clientWidth) &&
          setElementInFocus(event.target.id);
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
  }, [blockInfo?.isEmpty, AIsearchRef.current]);

  // Use custom hook to hide AIsearch on outside click
  // TODO: find a way to override the eventlistener created by editorJS on the padding area of the editor because it prevents UseOutsideClick to execute in that area
  useOutsideClick(AIsearchRef, () => setShowAIsearch(false));

  // Effect to set focus back to last focused block when AIsearch is closed
  useEffect(() => {
    if (context === 'Notes' && editorInstance && !showAIsearch) {
      blockInfo?.editableBlock?.focus();
    } else if (context === 'Flashcards' && !showAIsearch) {
      document.getElementById(elementInFocus)?.focus();
    }
  }, [showAIsearch]);

  // Function to insert AI's response note/flashcard
  const insertResponse = async (text) => {
    if (context === 'Notes' && editorInstance) {
      // Get the HTML string representation of the rendered Markdown text
      const htmlString = ReactDOMServer.renderToStaticMarkup(
        <Markdown>{text}</Markdown>
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
    } else if (context === 'Flashcards') {
      // Regex to capture the term and definition
      const regex = /Term:\s*(.*?)\s*Definition:\s*(.*)/s;

      const match = text.match(regex);

      if (match) {
        const term = match[1].trim();
        const definition = match[2].trim();

        await handleUpdateFlashcard(parentId.replace('_term', ''), {
          term: term,
          definition: definition,
        });
      } else {
        console.log('No match found.');
      }
    }
  };

  // Function to handle form submission
  // TODO: Solve issue with response not being inserted into blocks like how it works with handleSuggestionClick
  const handleSubmit = async (e) => {
    e.preventDefault(); // a temporary fix for form refreshing page on submit
    setShowAIsearch(false); // Close AIsearch
    const response = await askAI(context, searchTerm, fileId);
    await insertResponse(response);
  };

  const handleSuggestionClick = async (suggestion) => {
    if (context === 'Notes') {
      setShowAIsearch(false);
      const response = await askAI(context, suggestion.keyword, fileId);
      insertResponse(response);
    } else if (context === 'Flashcards') {
      const flashcard = data.flashcards.find(
        (flashcard) => flashcard.id === parseInt(parentId.replace('_term', ''))
      );

      if (!flashcard.term === !flashcard.definition) {
        // if both empty or both full
        setTimeout(() => {
          // Delay because useOutsideClick gets triggered
          setSearchTerm(suggestion.name + ' for ');
          setShowAIsearch(true);
          AIinputRef.current.focus();
        }, 1);
      } else {
        const response = await askAI(context, 'predict', flashcard.id);
        const side = flashcard.term === '' ? 'term' : 'definition';
        await handleUpdateFlashcard(flashcard.id, {
          [side]: response,
        });
        setShowAIsearch(false);
      }
    }
  };

  // Effect to reset search term on close
  useEffect(() => {
    !showAIsearch ? setSearchTerm('') : void 0;
  }, [showAIsearch]);

  return (
    showAIsearch && (
      <form
        ref={AIsearchRef}
        className="aiSearch"
        style={{ top: `${topPosition}px`, width: `${width}px` }}
        onSubmit={(e) => handleSubmit(e)}
      >
        <div className="aiSearch__field">
          <StarsIcon />
          <input
            ref={AIinputRef}
            type="text"
            id="aiSearchInput"
            placeholder="Ask AI to write anything..."
            onChange={(e) => handleInputChange(e)}
            value={searchTerm}
            autoFocus
          />
          <button type="submit">
            <GoIcon />
          </button>
        </div>
        {filteredSuggestions.length > 0 && (
          <ul className="aiSearch__suggestions">
            {filteredSuggestions.map((suggestion, index) => (
              <MenuItem
                key={index}
                size="small"
                onClick={() => handleSuggestionClick(suggestion)}
                label={suggestion.name}
                icon={suggestion.icon}
              />
            ))}
          </ul>
        )}
      </form>
    )
  );
};

export default AIsearch;
