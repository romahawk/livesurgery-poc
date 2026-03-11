export default function BrandLogo({ size = 44 }) {
  return (
    <a
      className="inline-flex items-center gap-3 select-none"
      href="/"
      aria-label="LiveSurgery"
    >
      <span
        aria-hidden="true"
        className="relative inline-flex shrink-0"
        style={{
          width: Math.max(10, Math.round(size * 0.22)),
          height: Math.max(10, Math.round(size * 0.22)),
        }}
      >
        <span
          className="absolute inline-flex h-full w-full rounded-full animate-ping"
          style={{ background: "var(--ls-teal)", opacity: 0.6 }}
        />
        <span
          className="relative inline-flex h-full w-full rounded-full"
          style={{ background: "var(--ls-teal)" }}
        />
      </span>
      <span
        className="leading-none tracking-tight"
        style={{
          fontFamily: "'DM Sans', Inter, system-ui, sans-serif",
          fontWeight: 600,
          fontSize: Math.round(size * 0.48),
          color: "var(--ls-offwhite)",
        }}
      >
        <span>Live</span>
        <span style={{ color: "var(--ls-teal)" }}>Surgery</span>
      </span>
    </a>
  );
}
