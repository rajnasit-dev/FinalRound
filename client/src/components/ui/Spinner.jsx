const Spinner = ({ size = "md", className = "",  text="Loading..." }) => {
  const sizes = {
    sm: 32,
    md: 40,
    lg: 64,
  };

  const dimension = sizes[size];

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 120 120"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
      {/* Connections */}
      <g stroke="#7758e2" strokeWidth="5" strokeLinecap="round">
        <line x1="35" y1="40" x2="75" y2="30">
          <animate attributeName="stroke-dasharray" from="0 80" to="80 0" dur="1.2s" repeatCount="indefinite" />
        </line>
        <line x1="35" y1="40" x2="30" y2="80">
          <animate attributeName="stroke-dasharray" from="0 80" to="80 0" dur="1.2s" begin="0.1s" repeatCount="indefinite" />
        </line>
        <line x1="35" y1="40" x2="75" y2="65">
          <animate attributeName="stroke-dasharray" from="0 80" to="80 0" dur="1.2s" begin="0.2s" repeatCount="indefinite" />
        </line>
        <line x1="75" y1="30" x2="30" y2="80">
          <animate attributeName="stroke-dasharray" from="0 100" to="100 0" dur="1.2s" begin="0.3s" repeatCount="indefinite" />
        </line>
        <line x1="75" y1="30" x2="75" y2="65">
          <animate attributeName="stroke-dasharray" from="0 60" to="60 0" dur="1.2s" begin="0.4s" repeatCount="indefinite" />
        </line>
        <line x1="30" y1="80" x2="75" y2="65">
          <animate attributeName="stroke-dasharray" from="0 80" to="80 0" dur="1.2s" begin="0.5s" repeatCount="indefinite" />
        </line>
      </g>

      {/* Nodes */}
      <circle cx="35" cy="40" r="9" fill="#7758e2" />
      <circle cx="30" cy="80" r="9" fill="#7758e2" />
      <circle cx="75" cy="65" r="9" fill="#7758e2" />

      {/* Active Hub */}
      <circle cx="75" cy="30" r="11" fill="#d7ff42">
        <animate attributeName="r" values="11;13;11" dur="1.6s" repeatCount="indefinite" />
      </circle>
    </svg>
    {text && (
      <p className="text-lg text-base dark:text-base-dark">{text}</p>
    )}
    </div>
  );
};

Spinner.displayName = "Spinner";

export default Spinner;
