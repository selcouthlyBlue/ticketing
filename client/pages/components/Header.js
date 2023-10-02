import React from "react";
import Link from "next/link";

export default function Header({ currentUser }) {
  const links = [
    currentUser && { label: "Orders", href: "/orders" },
    currentUser && { label: "Sell Ticket", href: "/tickets/new" },
    !currentUser && { label: "Sign Up", href: "/auth/signup" },
    !currentUser && { label: "Sign In", href: "/auth/signin" },
    currentUser && { label: "Sign Out", href: "/auth/signout" },
  ]
    .filter((link) => link)
    .map((link) => (
      <li key={link.href} className="nav-item">
        <Link className="nav-link" href={link.href}>
          {link.label}
        </Link>
      </li>
    ));

  return (
    <nav className="navbar navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" href="/">
          Ticketverse
        </Link>
        <div className="d-flex justify-content-end">
          <ul className="nav d-flex align-items-center">{links}</ul>
        </div>
      </div>
    </nav>
  );
}
