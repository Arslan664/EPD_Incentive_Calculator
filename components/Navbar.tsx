/**
 * Navbar — Server Component (no interactivity needed here).
 * The search input is passed in as a children slot so the
 * interactive part can be a client component while the chrome stays static.
 */

interface NavbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export default function Navbar({ searchValue, onSearchChange }: NavbarProps) {
  return (
    <header className="top-nav">
      <div className="logo">
        <div className="logo-icon">
          <i className="fa-solid fa-chart-line" />
        </div>
        <h2>EPD Comprehensive Report</h2>
      </div>

      <div className="nav-right">
        <div className="search-box">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            id="search-input"
            placeholder="Search Rep or Team..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="profile">
          <span>Medical Dept.</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      </div>
    </header>
  );
}
