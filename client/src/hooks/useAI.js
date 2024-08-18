import axios from 'axios';

const useAI = () => {
  const askAI = async (context, keyword, id) => {
    try {
      if (keyword === 'summarize') {
        const response = await axios.post(`/askAI/${context}/${keyword}`, {
          fileId: id,
        });
        console.log(response.data.message);
        return response.data.message;
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
        const response = await axios.post(`/askAI/${context}/${keyword}`, {
          fileId: id,
          notes: content,
        });
        console.log(response.data.message);
        return response.data.message;
      } else if (keyword === 'multigen') {
        const response = await axios.post(`/askAI/${context}/${keyword}`, {
          fileId: id,
        });
        console.log(response.data.message);
        return response.data.message;
      } else if (keyword === 'predict') {
        const response = await axios.post(`/askAI/${context}/${keyword}`, {
          flashcardId: id,
        });
        console.log(response.data.message);
        return response.data.message;
      } else {
        const response = await axios.post(`/askAI/${context}/custom`, {
          prompt: keyword,
        });
        console.log(response.data.message);
        return response.data.message;
      }
      // TODO: Determine why streaming is not working
      // TODO: The route has changed, add json object in the request body
      // console.log('Starting request...');
      // const response = await fetch(`/askAI/${context}/${keyword}/${id}`, {
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

  return {
    askAI,
  };
};

export default useAI;
