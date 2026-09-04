import xIcon from './socialIcons/x.svg';
import instagramIcon from './socialIcons/instagram.svg';
import facebookIcon from './socialIcons/facebook.svg';
import youtubeIcon from './socialIcons/youtube.svg';
import linkedinIcon from './socialIcons/linkedin.svg';

/**
 * Real social-platform icon marks, exported directly from Xinear's Figma
 * file (NOT lucide-react — lucide-react 1.7.0 in this repo ships no
 * brand/social icons at all). Imported as static URLs and rendered via
 * `<img>`, matching this repo's existing convention for static SVG assets
 * (see `src/components/Layout.jsx`'s `labamuMark` import) rather than
 * inventing a new SVG-as-React-component mechanism.
 */
const ICONS = {
  x: xIcon,
  instagram: instagramIcon,
  facebook: facebookIcon,
  youtube: youtubeIcon,
  linkedin: linkedinIcon,
};

const LABELS = {
  x: 'X (Twitter)',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
};

/** Social links are always real external URLs, so unlike `renderLink`'s
 * internal-nav-link pattern elsewhere in header/footer, these are always
 * rendered as real `<a href>` tags regardless of builder/live mode. */
export default function SocialIcon({ platform, url }) {
  const src = ICONS[platform];
  if (!src) return null;
  return (
    <a href={url || '#'} target="_blank" rel="noreferrer" aria-label={LABELS[platform] || platform}>
      <img src={src} alt="" aria-hidden className="h-6 w-6" />
    </a>
  );
}
