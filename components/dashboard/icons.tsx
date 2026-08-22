/** One icon family, 1.5px stroke, 20px box. No emoji anywhere. */
const base = {
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "size-5",
};

export function IconNewCampaign() {
  return (
    <svg {...base} aria-hidden="true">
      <path d="M10 4v12M4 10h12" />
    </svg>
  );
}

export function IconCampaigns() {
  return (
    <svg {...base} aria-hidden="true">
      <path d="M3 5h14M3 10h14M3 15h9" />
    </svg>
  );
}

export function IconAudit() {
  return (
    <svg {...base} aria-hidden="true">
      <path d="M2 10h3l2.5-5 3 10L13 10h5" />
    </svg>
  );
}

export function IconLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
      <rect x="3" y="6" width="9" height="3" rx="1.5" fill="var(--ct-violet-base)" />
      <rect x="3" y="15" width="5" height="3" rx="1.5" fill="var(--ct-violet-base)" />
      <rect x="10" y="15" width="11" height="3" rx="1.5" fill="var(--ct-sodium-base)" />
      <rect x="14" y="6" width="7" height="3" rx="1.5" fill="var(--ct-sodium-base)" />
    </svg>
  );
}
