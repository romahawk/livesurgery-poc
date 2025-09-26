export default function BrandLogo({ size = 44 }) {
  return (
    <a className="ls-logo" href="/" aria-label="LiveSurgery">
      <span
        className="ls-logo__icon"
        style={{ "--ls-size": `${size}px` }}
        aria-hidden="true"
      />
      <span className="ls-logo__text">
        <span className="live">Live</span>
        <span className="surgery">Surgery</span>
      </span>
    </a>
  );
}
