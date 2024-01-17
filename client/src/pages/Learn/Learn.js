import Layout from '../../pages/Layout/Layout';
import DocViewer from '../../components/Docviewer/Docviewer';
import { useSidebar } from '../../contexts/SidebarContext';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Learn = () => {
  const { setIsExpanded } = useSidebar();
  const location = useLocation();
  const file = location.state.file;

  useEffect(() => {
    setIsExpanded(false);
  }, []);

  return (
    <Layout>
      <div className="grid">
        <div className="grid__docviewer">
          <DocViewer uri={`/files/${file.id}`} />
        </div>
        <div>Notes an AI stuff section</div>
      </div>
    </Layout>
  );
};

export default Learn;
