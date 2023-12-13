import { Link } from 'react-router-dom';
import TikTok from '../../assets/brandLogos/tiktok.svg';
import Instagram from '../../assets/brandLogos/instagram.svg';
import YouTube from '../../assets/brandLogos/youtube.svg';
import Twitter from '../../assets/brandLogos/twitter.svg';
import LinkedIn from '../../assets/brandLogos/linkedin.svg';
import Facebook from '../../assets/brandLogos/facebook.svg';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__links">
        <section>
          <h3>About us</h3>
          <ul>
            <li>
              <Link to="/">Mission</Link>
            </li>
            <li>
              <Link to="/">Contact us</Link>
            </li>
          </ul>
        </section>
        <section>
          <h3>Product</h3>
          <ul>
            <li>
              <Link to="/">Notes</Link>
            </li>
            <li>
              <Link to="/">Flashcards</Link>
            </li>
            <li>
              <Link to="/">Mind maps</Link>
            </li>
            <li>
              <Link to="/">Quizzes</Link>
            </li>
            <li>
              <Link to="/">Active recall hub</Link>
            </li>
          </ul>
        </section>
        <section>
          <h3>Download</h3>
          <ul>
            <li>
              <Link to="/">iOS & Android</Link>
            </li>
            <li>
              <Link to="/">Mac & Windows</Link>
            </li>
            <li>
              <Link to="/">Web clipper</Link>
            </li>
          </ul>
        </section>
      </div>
      <div className="footer__brand">
        <Link className="footer__logo" to="/">
          LearnMate
        </Link>
        <div className="footer__socials">
          <Link to="/">
            <img src={TikTok} alt="TikTok logo" />
          </Link>
          <Link to="/">
            <img src={Instagram} alt="Instagram logo" />
          </Link>
          <Link to="/">
            <img src={YouTube} alt="YouTube logo" />
          </Link>
          <Link to="/">
            <img src={Twitter} alt="Twitter logo" />
          </Link>
          <Link to="/">
            <img src={LinkedIn} alt="LinkedIn logo" />
          </Link>
          <Link to="/">
            <img src={Facebook} alt="Facebook logo" />
          </Link>
        </div>
        <div>© 2023 Learnmate, Inc.</div>
      </div>
    </footer>
  );
};

export default Footer;
