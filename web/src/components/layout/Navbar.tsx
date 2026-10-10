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
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

export default Navbar;

