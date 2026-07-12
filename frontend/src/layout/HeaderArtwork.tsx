import './HeaderArtwork.css';

export function HeaderArtwork() {
  return (
    <header className="header-artwork">
      <img src="/assets/logo.png" alt="Southeastern Rewilding Assistant" className="header-artwork__logo" />
      <p className="header-artwork__tagline">Guiding native restoration across the South</p>
    </header>
  );
}
