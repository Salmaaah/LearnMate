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
    // { name: 'Continue writing', keyword: 'write', icon: <WriteIcon /> },
    { name: 'Summarize', keyword: 'summarize', icon: <SummarizeIcon /> },
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
      const response = await axios.post(`/askAI/${keyword}/${fileId}`);
      console.log(response.data.message);
      insertResponse(response.data.message);

      // TODO: Determine why streaming is not working
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
