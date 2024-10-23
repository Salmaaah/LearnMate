import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ReactComponent as TikTokIcon } from '../../assets/brandLogos/tiktok.svg';
import { ReactComponent as InstagramIcon } from '../../assets/brandLogos/instagram.svg';
import { ReactComponent as YouTubeIcon } from '../../assets/brandLogos/youtube.svg';
import { ReactComponent as TwitterIcon } from '../../assets/brandLogos/twitter.svg';
import { ReactComponent as LinkedInIcon } from '../../assets/brandLogos/linkedin.svg';
import { ReactComponent as FacebookIcon } from '../../assets/brandLogos/facebook.svg';

/**
 * Displays the footer with navigation and social media links.
 *
 * @component
 * @returns {JSX.Element} - Rendered Footer component.
 */
const Footer = () => {
  const socialMediaLinks = [
    { name: 'TikTok', Icon: TikTokIcon, url: '/' },
    { name: 'Instagram', Icon: InstagramIcon, url: '/' },
    { name: 'YouTube', Icon: YouTubeIcon, url: '/' },
    { name: 'Twitter', Icon: TwitterIcon, url: '/' },
    { name: 'LinkedIn', Icon: LinkedInIcon, url: '/' },
    { name: 'Facebook', Icon: FacebookIcon, url: '/' },
  ];

  const footerSections = [
    {
      title: 'About us',
      links: [
        { text: 'Mission', url: '/' },
        { text: 'Contact us', url: '/' },
      ],
    },
    {
      title: 'Product',
      links: [
        { text: 'Notes', url: '/' },
        { text: 'Flashcards', url: '/' },
        { text: 'Mind maps', url: '/' },
        { text: 'Quizzes', url: '/' },
        { text: 'Active recall hub', url: '/' },
      ],
    },
    {
      title: 'Download',
      links: [
        { text: 'iOS & Android', url: '/' },
        { text: 'Mac & Windows', url: '/' },
        { text: 'Web clipper', url: '/' },
      ],
    },
  ];

  return (
    <footer className="footer">
      <div className="footer__links">
        {footerSections.map((section, index) => (
          <Section key={index} section={section} />
        ))}
      </div>
      <div className="footer__brand">
        <Link className="footer__logo" to="/">
          LearnMate
        </Link>
        <div className="footer__socials">
          {socialMediaLinks.map((social) => (
            <Link
              key={social.name}
              to={social.url}
              aria-label={`Visit our ${social.name} page`}
            >
              <social.Icon />
            </Link>
          ))}
        </div>
        <div>© 2024 LearnMate, Inc.</div>
      </div>
    </footer>
  );
};

// Footer Section Component
const Section = ({ section }) => (
  <section>
    <div>{section.title}</div>
    <ul>
      {section.links.map((link, index) => (
        <li key={index}>
          <Link to={link.url}>{link.text}</Link>
        </li>
      ))}
    </ul>
  </section>
);

// PropTypes for Section component
Section.propTypes = {
  section: PropTypes.shape({
    title: PropTypes.string.isRequired,
    links: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default Footer;
