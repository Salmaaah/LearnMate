import React from 'react';
import ReactDOM from 'react-dom/client';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import { useEffect } from 'react';
import { ReactComponent as DownloadIcon } from '../../assets/icons/download.svg';
import { ReactComponent as ZoomOutIcon } from '../../assets/icons/zoomOut.svg';
import { ReactComponent as ZoomInIcon } from '../../assets/icons/zoomIn.svg';
import { ReactComponent as ZoomResetIcon } from '../../assets/icons/zoomReset.svg';
import { ReactComponent as ScrollIcon } from '../../assets/icons/scroll.svg';

const Docviewer = ({ uri }) => {
  useEffect(() => {
    // Function to replace SVG
    const replaceSvg = (selector, IconComponent) => {
      const svgElement = document.querySelector(selector);
      if (svgElement) {
        const container = document.querySelector(selector.split(' > ')[0]);
        container.innerHTML = '';
        const root = ReactDOM.createRoot(container);
        root.render(<IconComponent />);
        return true;
      }
      return false;
    };

    // Create a new MutationObserver instance
    var observer = new MutationObserver((mutationsList, observer) => {
      // Look through all mutations that just occured
      for (let mutation of mutationsList) {
        // If the addedNodes property has one or more nodes
        if (mutation.addedNodes.length) {
          if (
            replaceSvg('#pdf-download > svg', DownloadIcon) &&
            replaceSvg('#pdf-zoom-out > svg', ZoomOutIcon) &&
            replaceSvg('#pdf-zoom-in > svg', ZoomInIcon) &&
            replaceSvg('#pdf-zoom-reset > svg', ZoomResetIcon) // &&
            // replaceSvg('#pdf-toggle-pagination > svg', ScrollIcon)
          ) {
            // Once we have replaced the SVG, there's no need to observe anymore
            observer.disconnect();
            break;
          }
        }
      }
    });

    // Start observing the document with the configured parameters
    observer.observe(document, { childList: true, subtree: true });
  }, []);

  return (
    <DocViewer
      style={{ background: 'none' }}
      documents={[{ uri: uri }]}
      pluginRenderers={DocViewerRenderers}
    />
  );
};

export default Docviewer;
