import type { PageName } from "../../types";

interface NavbarProps {
  activePage: PageName;
  onNavigate: (page: PageName) => void;
}

const navItems: { label: string; page: PageName }[] = [
  { label: "Dashboard", page: "dashboard" },
  { label: "Learn", page: "learn" },
  { label: "Challenge", page: "challenge" },
  { label: "Profile", page: "profile" },
];

function ProfileCatIcon() {
  return (
    <svg className="nav-cat-icon" viewBox="0 0 80 80" role="img" aria-label="Profile">
      <polygon points="18,34 28,8 42,32" fill="#FFC2D6" />
      <polygon points="62,34 52,8 38,32" fill="#FFC2D6" />
      <polygon points="25,29 29,18 36,30" fill="#FF8FB3" />
      <polygon points="55,29 51,18 44,30" fill="#FF8FB3" />
      <circle cx="40" cy="44" r="30" fill="#FFC2D6" />
      <circle cx="29" cy="42" r="4.5" fill="#3B2A35" />
      <circle cx="51" cy="42" r="4.5" fill="#3B2A35" />
      <circle cx="30.5" cy="40.5" r="1.4" fill="#FFFFFF" />
      <circle cx="52.5" cy="40.5" r="1.4" fill="#FFFFFF" />
      <ellipse cx="40" cy="50" rx="3" ry="2.2" fill="#E0608F" />
      <path
        d="M34 56 Q37 60 40 56 Q43 60 46 56"
        stroke="#3B2A35"
        strokeLinecap="round"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

function Navbar({ activePage, onNavigate }: NavbarProps) {
  return (
    <header className="navbar">
      <div>
        <p className="eyebrow">Digi-Pet</p>
        <h1>Study Companion</h1>
      </div>
      <nav className="nav-actions" aria-label="Main navigation">
        {navItems.map((item) => (
          <button
            className={activePage === item.page ? "active" : ""}
            key={item.page}
            onClick={() => onNavigate(item.page)}
            type="button"
          >
            {item.page === "profile" ? <ProfileCatIcon /> : item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

export default Navbar;
