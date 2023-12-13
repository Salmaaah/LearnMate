import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

const Welcome = () => {
  return (
    <div>
      <Header to="/login" cta="Log in" />
      <Footer />
    </div>
  );
};

export default Welcome;
