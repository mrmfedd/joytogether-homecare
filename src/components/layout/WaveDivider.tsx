export function WaveDivider({
  fill = "#faf7fc",
  className = "",
}: {
  fill?: string;
  className?: string;
}) {
  return (
    <div className={`pointer-events-none w-full leading-none ${className}`} aria-hidden>
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="block h-[50px] w-full md:h-[72px]"
      >
        <g className="wave-layer wave-layer-back">
          <path
            d="M0,48 C320,8 640,72 960,44 C1200,24 1320,52 1440,38 L1440,80 L0,80 Z"
            fill={fill}
            opacity="0.45"
          />
        </g>
        <g className="wave-layer wave-layer-front">
          <path
            d="M0,40 C360,90 720,0 1080,40 C1260,60 1380,55 1440,40 L1440,80 L0,80 Z"
            fill={fill}
          />
        </g>
      </svg>
    </div>
  );
}
