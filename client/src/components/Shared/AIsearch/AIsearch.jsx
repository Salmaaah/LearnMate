import { useEffect, useState, useRef } from 'react';
import { useFileContext } from '../../../contexts/FileContext';
import { useEditorContext } from '../../../contexts/EditorContext';
import useOutsideClick from '../../../hooks/useOutsideClick';
import { ReactComponent as StarsIcon } from '../../../assets/icons/stars.svg';
import { ReactComponent as GoIcon } from '../../../assets/icons/arrow.svg';
import MenuItem from '../MenuItem/MenuItem';
import { ReactComponent as WriteIcon } from '../../../assets/icons/write.svg';
import { ReactComponent as SummarizeIcon } from '../../../assets/icons/summarize.svg';
import axios from 'axios';
import Markdown from 'markdown-to-jsx';
import ReactDOMServer from 'react-dom/server';

const AIsearch = ({ showAIsearch, setShowAIsearch }) => {
  const { id: fileId } = useFileContext();
  const { editorInstanceRef, blockInfo, setBlockInfo } = useEditorContext();
  const editorInstance = editorInstanceRef.current;
  const [HTMLblocks, setHTMLblocks] = useState(null);
  const prevHTMLblocksRef = useRef(null);
  const [width, setWidth] = useState(400); // TODO: add dynamic width adjustment like the commented code in PropertySelector
  const [topPosition, setTopPosition] = useState(0);

  const AIsearchRef = useRef(null);
  // const [AIresponse, setAIresponse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const suggestions = [
    {
      category: '',
      name: 'Continue writing',
      keyword: 'continue',
      icon: <WriteIcon />,
    },
    {
      category: 'Generate from material',
      name: 'Summarize',
      keyword: 'summarize',
      icon: <SummarizeIcon />,
    },
    {
      category: 'Edit or review',
      name: 'Improve writing',
      keyword: 'improve',
      icon: <></>,
    },
  ];
  const filteredSuggestions = suggestions.filter((suggestion) =>
    suggestion.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    searchTerm === '' && e.target.value === ' '
      ? setSearchTerm('') // Prevent space from being typed at the start
      : setSearchTerm(e.target.value); // set search term to user input
  };

  useEffect(() => {
    setHTMLblocks(document.querySelectorAll('.ce-block'));

    // Set AIsearch width
    const editorContainer = document.getElementById('editorjs');
    setWidth(editorContainer.getBoundingClientRect().width);
  }, [editorInstance]);

  useEffect(() => {
    if (blockInfo.block)
      setTopPosition(blockInfo.block.getBoundingClientRect().top);
  }, [blockInfo.block]);

  // Effect to listen for focus events on editor's blocks and save blockInfo
  useEffect(() => {
    if (HTMLblocks) {
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
        console.log('triggered');
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

  // Use custom hook to hide AIsearch on outside click
  // TODO: find a way to override the eventlistener created by editorJS on the padding area of the editor because it prevents UseOutsideClick to execute in that area
  useOutsideClick(AIsearchRef, () => setShowAIsearch(false));

  // Effect to set focus back to last focused block when AIsearch is closed
  useEffect(() => {
    editorInstance && blockInfo.block && !showAIsearch
      ? blockInfo.editableBlock.focus()
      : void 0;
  }, [showAIsearch]);

  // Function to insert AI's markdown response into the editor
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

  // Function to prompt the AI
  const askAI = async (keyword) => {
    try {
      if (keyword === 'summarize') {
        const response = await axios.post(`/askAI/${keyword}`, {
          fileId: fileId,
        });
        console.log(response.data.message);
        insertResponse(response.data.message);
      } else if (keyword === 'continue' || keyword === 'improve') {
        // In order to extract the note contents we are using the HTML from the DOM and turning it into markdown
        // for the AI to process. We didn't retrieve the note contents from the database because it's saved
        // in a editorJS json format which will be harder to parse than the HTML.

        const HTMLblocks = document.querySelectorAll('.ce-block');

        // Turn HTML to markdown
        let content = '';
        HTMLblocks.forEach((block) => {
          let child = block.querySelector('.ce-block__content').children[0];
          let tag = child.tagName;
          let innerText = child.innerText;
          let mdElement = '';

          if (tag === 'H1') {
            mdElement = '# ';
          } else if (tag === 'H2') {
            mdElement = '## ';
          } else if (tag === 'H3') {
            mdElement = '### ';
          } else if (tag === 'H4') {
            mdElement = '#### ';
          } else if (tag === 'H5') {
            mdElement = '##### ';
          } else if (tag === 'H6') {
            mdElement = '###### ';
          } else if (tag === 'UL' || tag === 'OL') {
            let children = child.children;
            let len = children.length;
            for (let i = 0; i < len; i++) {
              mdElement = tag === 'UL' ? '- ' : `${i + 1}` + '. ';
              content +=
                mdElement +
                children[i].innerText +
                `${len - i === 1 ? '' : '\n'}`;
            }
            mdElement = '';
            innerText = '';
          } else {
            mdElement = '';
          }

          content += mdElement + innerText + '\n';
        });

        // Send the markdown in the request body
        const response = await axios.post(`/askAI/${keyword}`, {
          fileId: fileId,
          notes: content,
        });
        console.log(response.data.message);
        insertResponse(response.data.message);
      }
      // TODO: Determine why streaming is not working
      // TODO: The route has changed, add json object in the request body
      // console.log('Starting request...');
      // const response = await fetch(`/askAI/${keyword}/${fileId}`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      // });
      // console.log('Request completed. Response:', response);

      // // Create a ReadableStream from the response body and read data from the stream
      // const reader = response.body.getReader();

      // // Function to read chunks from the stream
      // const readStream = async () => {
      //   console.log('Reading stream...');
      //   while (true) {
      //     const { done, value } = await reader.read();
      //     if (done) {
      //       setAIresponse('');
      //       console.log('Stream ended');
      //       break;
      //     }
      //     // Convert the chunk to a string and log it
      //     console.log('Received chunk:', new TextDecoder().decode(value));

      //     setAIresponse((prevState) => {
      //       const chunk = new TextDecoder().decode(value);
      //       insertResponse(prevState + chunk);
      //       return prevState + chunk;
      //     });
      //   }
      // };

      // // Start reading from the stream
      // readStream();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Function to handle form submission
  // TODO: Solve issue with response not being inserted into blocks like how it works with handleSuggestionClick
  const handleSubmit = async (e) => {
    e.preventDefault(); // a temporary fix for form refreshing page on submit
    setShowAIsearch(false); // Close AIsearch
    askAI(searchTerm);
  };

  const handleSuggestionClick = (suggestion) => {
    setShowAIsearch(false);
    askAI(suggestion.keyword);
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
