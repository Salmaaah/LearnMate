import PropTypes from 'prop-types';
import {
  useEffect,
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
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
import { ReactComponent as ImproveIcon } from '../../../assets/icons/magicWand.svg';
import Markdown from 'markdown-to-jsx';
import ReactDOMServer from 'react-dom/server';

/**
 * Provides an AI-powered search interface for both Notes and Flashcards contexts.
 * It dynamically adjusts based on context and handles AI suggestions and responses.
 *
 * @component
 * @param {('Notes' | 'Flashcards')} context - Defines the current context, either 'Notes' or 'Flashcards'.
 * @param {string} [parentId] - The ID of the parent Flashcard term or definition element to associate with AI operations (only used in Flashcards context).
 * @param {React.Ref} ref - The ref to the component used to expose the setShowAIsearch function to parent components.
 * @returns {JSX.Element} The rendered AIsearch component.
 *
 * @example
 * <AIsearch
 *   context="Flashcards"
 *   parentId="term-123"
 * />
 */
const AIsearch = forwardRef(({ context, parentId }, ref) => {
  const AIsearchRef = useRef(null); // another ref to the main component to separate internal operations from the setShowAIsearch exposure to parent components
  const { id: fileId } = useFileContext();
  const { askAI } = useAI();
  const [showAIsearch, setShowAIsearch] = useState(false);
  const [width, setWidth] = useState(400);
  const [topPosition, setTopPosition] = useState(-11);
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
      icon: <ImproveIcon />,
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

  // Notes Context
  const { editorInstanceRef, blockInfo, setBlockInfo } = useEditorContext();
  const editorInstance = editorInstanceRef.current;
  const [HTMLblocks, setHTMLblocks] = useState(null);
  const prevHTMLblocksRef = useRef(null);

  // Flashcards Context
  const { data } = useDataContext();
  const [elementInFocus, setElementInFocus] = useState(null);
  const AIinputRef = useRef(null);
  const { handleUpdateFlashcard } = useFlashcard();

  // Use useImperativeHandle to expose the setShowAIsearch function to parent components.
  useImperativeHandle(ref, () => ({
    setShowAIsearch,
  }));

  // Effect to listen for focus events on editor's blocks and save blockInfo when context is 'Notes'
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

  // Effect to handle space and backspace key events for showing/hiding AIsearch
  useEffect(() => {
    const handleKeyPress = (event) => {
      // TODO: In case of notes, blockInfo.isEmpty is slow to update when user types fast on a new line and hits space
      // I think this is caused by the slow onChange callback from editorjs
      if (
        event.key === ' ' &&
        ((context === 'Notes' && blockInfo.isEmpty) ||
          (context === 'Flashcards' &&
            event.target.id === parentId && // not needed in case of notes because only one is open at a time, unlike flashcards
            (event.target.value === '' || event.isTrusted === false))) // when event is triggered by actually presssing the space button the textArea needs to be empty in order for the AIsearch to show up, but in case of clicking the stars button that dispatches a fake keydown event, we can force show AIsearch even with text area being full
      ) {
        setShowAIsearch(true);
        if (context === 'Flashcards') {
          setWidth(event.target.clientWidth);
          setElementInFocus(event.target.id);
        }
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

  // Effect to update AIsearch topPosition based on focused block when context is 'Notes'
  useEffect(() => {
    if (context === 'Notes' && blockInfo?.block)
      setTopPosition(blockInfo.block.getBoundingClientRect().top);
  }, [blockInfo?.block]);

  // Effect to set HTMLblocks and adjust AIsearch width when context is 'Notes'
  useEffect(() => {
    const updateWidth = () => {
      const editorContainer = document.getElementById('editorjs');
      if (editorContainer) {
        setWidth(editorContainer.getBoundingClientRect().width);
      }
    };

    if (context === 'Notes' && editorInstance) {
      setHTMLblocks(document.querySelectorAll('.ce-block'));
      updateWidth(); // Set initial width

      // Add event listener for window resize
      window.addEventListener('resize', updateWidth);

      // Clean up the event listener on component unmount
      return () => window.removeEventListener('resize', updateWidth);
    }
  }, [editorInstance]);

  /**
   * Handles input change for AI search.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The event triggered by making changes to the AI search input.
   */
  const handleInputChange = (e) => {
    searchTerm === '' && e.target.value === ' '
      ? setSearchTerm('') // Prevent space from being typed at the start
      : setSearchTerm(e.target.value); // set search term to user input
  };

  // Custom hook to hide AIsearch on outside click
  // TODO: find a way to override the eventlistener created by editorJS on the padding area of the editor because it prevents UseOutsideClick to execute in that area
  useOutsideClick(AIsearchRef, () => setShowAIsearch(false));

  /**
   * Effect that resets the search term when AI search is closed.
   * If the context is "Notes," it also returns focus to the last focused block.
   */
  useEffect(() => {
    if (!showAIsearch) {
      setSearchTerm('');
      if (context === 'Notes' && editorInstance) {
        blockInfo?.editableBlock?.focus();
      } else if (context === 'Flashcards') {
        document.getElementById(elementInFocus)?.focus();
      }
    }
  }, [showAIsearch]);

  /**
   * Inserts AI response into notes or flashcards.
   *
   * @async
   * @param {string} text - The AI-generated response to be inserted (Markdown format for notes, plain text for flashcards).
   * @returns {Promise<void>}
   */
  const insertResponse = async (text) => {
    if (context === 'Notes' && editorInstance) {
      // Convert the AI response from Markdown to an HTML string.
      const htmlString = ReactDOMServer.renderToStaticMarkup(
        <Markdown>{text}</Markdown>
      )
        .replace('<strong>', '<b>')
        .replace('</strong>', '</b>')
        .replace('<em>', '<i>')
        .replace('</em>', '</i>');

      // The following code is a workaround for two issues:
      // 1. renderFromHTML clears the editor before inserting the rendered blocks.
      // 2. Saving existing blocks with editorInstance.save() before AI response insertion results
      //    in a loss of the intended block position due to Editor.js eliminating empty blocks.

      // Save the current blocks before rendering the new content, as renderFromHTML will replace all blocks.
      const savedBlocks = (await editorInstance.save()).blocks;

      // Retrieve the index of the current block in focus from the list of HTML blocks (preserves empty blocks).
      const currentIndex = Array.from(HTMLblocks).indexOf(blockInfo.block);

      // Identify the last non-empty block before the current block to maintain content order.
      let lastFullBlockId = null;
      for (let i = 0; i < currentIndex; i++) {
        const block = HTMLblocks[i];
        if (block.innerText !== '')
          lastFullBlockId = block.getAttribute('data-id');
      }

      // Use that id to get its index in the blocks array retrieved from editorJs
      let lastFullBlockIndex = null;
      if (lastFullBlockId !== null) {
        lastFullBlockIndex = savedBlocks.findIndex(
          (block) => block.id === lastFullBlockId
        );
      }

      // Render the new HTML content as Editor.js blocks.
      // TODO: Resolve the "Can't find a Block to remove" error caused by renderFromHTML.
      await editorInstance.blocks.renderFromHTML(htmlString);

      // Delay re-insertion of the saved blocks until rendering of the AI response is complete.
      // TODO: The 100ms timeout might not be sufficient for larger renders. Implement a more reliable
      // approach to ensure the HTML rendering is fully finished before re-inserting the blocks.
      setTimeout(async () => {
        // Retrieve the number of blocks rendered from the AI response.
        const AIresponseLength = (await editorInstance.save()).blocks.length;

        // Reinsert saved blocks around the AI response, maintaining the user's expected order.
        savedBlocks.forEach((block, index) => {
          let updatedIndex = index;

          // Adjust the insertion index for blocks that are supposed to come after the AI-triggering block.
          if (lastFullBlockIndex === null || index > lastFullBlockIndex) {
            updatedIndex = index + AIresponseLength;
          }

          editorInstance.blocks.insert(
            block.type,
            block.data,
            block.config,
            updatedIndex // The goal here is to insert each saved block at the correct position,
            // accounting for the AI response while considering Editor.js's behavior of removing empty blocks.
          );
        });
      }, 100);
    } else if (context === 'Flashcards') {
      // Regex to capture the term and definition
      const regex = /Term:\s*(.*?)\s*Definition:\s*(.*)/s;

      const match = text.match(regex);

      if (match) {
        const [_, term, definition] = match;

        await handleUpdateFlashcard(parentId.split('-')[1], {
          term: term.trim(),
          definition: definition.trim(),
        });
      } else {
        console.log('No match found.');
      }
    }
  };

  /**
   * Handles form submission for the AI search.
   *
   * @async
   * @param {React.FormEvent<HTMLFormElement>} e - The form submit event.
   * @returns {Promise<void>}
   */
  // TODO: Solve issue with response not being inserted into blocks like how it works with handleSuggestionClick
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await askAI(context, searchTerm, fileId);
    setShowAIsearch(false);
    await insertResponse(response);
  };

  /**
   * Handles the click event on an AI suggestion.
   *
   * @async
   * @param {object} suggestion - The selected suggestion object.
   * @param {string} suggestion.context - The context of the suggestion (either 'Notes' or 'Flashcards').
   * @param {string} suggestion.keyword - The keyword to query the AI with.
   * @returns {Promise<void>}
   */
  const handleSuggestionClick = async (suggestion) => {
    if (context === 'Notes') {
      setShowAIsearch(false);
      const response = await askAI(context, suggestion.keyword, fileId);
      insertResponse(response);
    } else if (context === 'Flashcards') {
      const flashcard = data.flashcards.find(
        (flashcard) => flashcard.id === parseInt(parentId.split('-')[1])
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

  return (
    showAIsearch && (
      <form
        ref={AIsearchRef}
        className="ai-search"
        style={{ top: `${topPosition}px`, width: `${width}px` }}
        onSubmit={(e) => handleSubmit(e)}
      >
        <div className="ai-search__field">
          <StarsIcon />
          <input
            ref={AIinputRef}
            type="text"
            // id="aiSearchInput"
            placeholder="Ask AI to write anything..."
            onChange={(e) => handleInputChange(e)}
            value={searchTerm}
            autoFocus
            autoComplete="off"
            aria-label="Ask AI"
            aria-controls="ai-search-suggestions"
          />
          <button type="submit" aria-label="Generate AI answer">
            <GoIcon />
          </button>
        </div>
        {filteredSuggestions.length > 0 && (
          <ul className="ai-search__suggestions" id="ai-search-suggestions">
            {filteredSuggestions.map((suggestion, index) => (
              <MenuItem
                key={index}
                size="small"
                onInteraction={() => handleSuggestionClick(suggestion)}
                label={suggestion.name}
                icon={suggestion.icon}
              />
            ))}
          </ul>
        )}
      </form>
    )
  );
});

AIsearch.propTypes = {
  context: PropTypes.oneOf(['Notes', 'Flashcards']).isRequired,
  parentId: PropTypes.string,
};

export default AIsearch;
