import { useState } from "react";
import { SlCup } from "react-icons/sl";

export default function Navbar({ page, setPage }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => setPage("dashboard")}>
        <img src="/logo.png" alt="Tea Counter Logo" className="navbar-logo" />

        <p>Tea Counter</p>
      </div>

      <div className="hamburger" onClick={() => setOpen(!open)}>
        ☰
      </div>

      <div className={`navbar-links ${open ? "active" : ""}`}>
        <button
          className={`nav-link${page === "dashboard" ? " active" : ""}`}
          onClick={() => {
            setPage("dashboard");
            setOpen(false);
          }}
        >
          Dashboard
        </button>

        <button
          className={`nav-link${page === "monthly" ? " active" : ""}`}
          onClick={() => {
            setPage("monthly");
            setOpen(false);
          }}
        >
          Monthly
        </button>

        <button
          className={`nav-link${page === "settings" ? " active" : ""}`}
          onClick={() => {
            setPage("settings");
            setOpen(false);
          }}
        >
          Settings
        </button>
      </div>
    </nav>
  );
}
