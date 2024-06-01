import { useEffect, useState } from 'react';
import { useFileContext } from '../../../contexts/FileContext';
import { ReactComponent as StarsIcon } from '../../../assets/icons/stars.svg';
import { ReactComponent as GoIcon } from '../../../assets/icons/arrow.svg';
import MenuItem from '../MenuItem/MenuItem';
import { ReactComponent as WriteIcon } from '../../../assets/icons/write.svg';
import { ReactComponent as SummarizeIcon } from '../../../assets/icons/summarize.svg';
import axios from 'axios';

const AIsearch = ({
  AIsearchRef,
  showAIsearch,
  setShowAIsearch,
  topPosition,
  width,
  insertResponse,
}) => {
  const { id: fileId } = useFileContext();
  const [AIresponse, setAIresponse] = useState(null);
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
      : setSearchTerm(e.target.value); // set search tearm to the user input
  };

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

  // Reset searchterm on close
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
