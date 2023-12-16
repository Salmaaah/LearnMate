import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import MenuItem from '../../components/Shared/MenuItem/MenuItem';
import { useLocation } from 'react-router-dom';

const Welcome = () => {
  const location = useLocation().pathname;

  return (
    <div>
      <Header to="/login" cta="Log in">
        <MenuItem to="/work" currentLocation={location} label="Work" />
        <MenuItem to="/projects" currentLocation={location} label="Projects" />
        <MenuItem
          to="/"
          currentLocation={location}
          label="Pricing"
          more={true}
        />
        <MenuItem
          to="/solutions"
          currentLocation={location}
          label="Solutions"
        />
      </Header>
      <Footer />
    </div>
  );
};

export default Welcome;
