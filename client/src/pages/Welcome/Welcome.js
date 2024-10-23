import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import MenuItem from '../../components/Shared/MenuItem/MenuItem';
import { useLocation } from 'react-router-dom';
import useUserAccess from '../../hooks/useUserAccess';
import desk from '../../assets/stockPhotos/desk.jpg';

/**
 * Landing page.
 *
 * @component
 * @returns {JSX.Element}
 */
const Welcome = () => {
  const location = useLocation().pathname;
  const { isLoading } = useUserAccess('/login');

  return (
    <div>
      {isLoading ? (
        <>Loading...</>
      ) : (
        <>
          <Header to="/login" cta="Log in">
            <MenuItem to="" location={location} label="Work" />
            <MenuItem to="" location={location} label="Projects" />
            <MenuItem to="" location={location} label="Pricing" more={true} />
            <MenuItem to="" location={location} label="Solutions" />
          </Header>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              paddingInline: '30px',
              fontFamily: 'Nunito',
              fontSize: 50,
              fontWeight: 1000,
              paddingBlock: '8rem',
              backgroundImage: `url(${desk})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            Coming soon...
          </div>
          <Footer />
        </>
      )}
    </div>
  );
};

export default Welcome;
