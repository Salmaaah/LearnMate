import PropTypes from 'prop-types';
import ReactDOM from 'react-dom/client';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import { useEffect, useRef } from 'react';
import { ReactComponent as DownloadIcon } from '../../assets/icons/download.svg';
import { ReactComponent as ZoomOutIcon } from '../../assets/icons/zoomOut.svg';
import { ReactComponent as ZoomInIcon } from '../../assets/icons/zoomIn.svg';
import { ReactComponent as ZoomResetIcon } from '../../assets/icons/zoomReset.svg';
import { ReactComponent as ScrollIcon } from '../../assets/icons/scroll.svg';

/**
 * Wraps the `DocViewer` from '@cyntler/react-doc-viewer' to customize
 * the control icons (download, zoom in/out, reset, scroll) with custom SVGs.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {string} props.uri - The URI of the document to be viewed.
 * @returns {JSX.Element} - Rendered document component.
 */
const Docviewer = ({ uri }) => {
  const rootMap = useRef(new Map()); // Store roots for containers

  useEffect(() => {
    /**
     * Replaces the native SVG icons in the DocViewer with custom ones.
     *
     * @param {string} selector - The CSS selector for the native SVG element.
     * @param {ReactComponent} IconComponent - The custom SVG component to render.
     * @returns {boolean} - Returns true if the SVG was successfully replaced.
     */
    const replaceSvg = (selector, IconComponent) => {
      const svgElement = document.querySelector(selector);
      if (svgElement) {
        const container = svgElement.parentElement;
        if (container) {
          let root = rootMap.current.get(container);
          if (!root) {
            root = ReactDOM.createRoot(container);
            rootMap.current.set(container, root);
          }
          root.render(<IconComponent />);
          return true;
        }
      }
      return false;
    };

    // MutationObserver to watch for the addition of native SVG elements and replace them
    const observer = new MutationObserver((mutationsList, observer) => {
      mutationsList.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          const allIconsReplaced = [
            replaceSvg('#pdf-download > svg', DownloadIcon),
            replaceSvg('#pdf-zoom-out > svg', ZoomOutIcon),
            replaceSvg('#pdf-zoom-in > svg', ZoomInIcon),
            replaceSvg('#pdf-zoom-reset > svg', ZoomResetIcon),
            replaceSvg('#pdf-toggle-pagination > svg', ScrollIcon),
          ].every((replaced) => replaced);

          // Disconnect the observer if all icons have been replaced
          if (allIconsReplaced) {
            observer.disconnect();
          }
        }
      });
    });

    // Start observing the document for changes
    observer.observe(document, { childList: true, subtree: true });

    // Cleanup the observer on component unmount
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <DocViewer
      style={{ background: 'none' }}
      documents={[{ uri }]}
      pluginRenderers={DocViewerRenderers}
    />
  );
};

Docviewer.propTypes = {
  uri: PropTypes.string.isRequired,
};

export default Docviewer;
