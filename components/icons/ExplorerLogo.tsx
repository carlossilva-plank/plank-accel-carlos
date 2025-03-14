export default function ExplorerLogo() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle */}
      <circle cx="50" cy="50" r="45" fill="#F5F1E9" stroke="#8B4513" strokeWidth="2" />

      {/* Compass rose */}
      <circle cx="50" cy="50" r="35" stroke="#8B4513" strokeWidth="1.5" />
      <path d="M50 15 L52 45 L50 50 L48 45 Z" fill="#8B4513" />
      <path d="M85 50 L55 52 L50 50 L55 48 Z" fill="#8B4513" />
      <path d="M50 85 L48 55 L50 50 L52 55 Z" fill="#8B4513" />
      <path d="M15 50 L45 48 L50 50 L45 52 Z" fill="#8B4513" />

      {/* Map corner decoration */}
      <path d="M20 20 L30 20 L20 30 Z" fill="#8B4513" opacity="0.3" />
      <path d="M80 20 L80 30 L70 20 Z" fill="#8B4513" opacity="0.3" />
      <path d="M20 80 L30 80 L20 70 Z" fill="#8B4513" opacity="0.3" />
      <path d="M80 80 L70 80 L80 70 Z" fill="#8B4513" opacity="0.3" />
    </svg>
  );
}
