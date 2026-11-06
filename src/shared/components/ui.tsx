import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "./icon";
export function Button({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`button ${className}`} {...props}>
      {children}
    </button>
  );
}
export function IconButton({
  label,
  icon,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; icon: string }) {
  return (
    <button className="icon-button" aria-label={label} {...props}>
      <Icon name={icon} />
    </button>
  );
}
export function Logo() {
  return (
    <span className="logo">
      <svg aria-hidden="true" width="30" height="30" viewBox="0 0 48 48">
        <rect
          x="2"
          y="2"
          width="44"
          height="44"
          rx="14"
          fill="var(--color-lime)"
        />
        <circle cx="36" cy="12" r="7" fill="var(--color-lilac)" />
        <path
          d="M9 30c3.2-1.6 6.4-1.4 9.4.6l5.6 3.6 5.6-3.6c3-2 6.2-2.2 9.4-.6v4.2c-2.6-1-5-.8-7.2.6L24 40.2l-7.8-5.4c-2.2-1.4-4.6-1.6-7.2-.6z"
          fill="var(--color-ink)"
        />
        <path
          d="M24 29.5c-5.6-3.6-8.6-6.6-8.6-10.2 0-2.6 2-4.6 4.5-4.6 1.7 0 3.2.9 4.1 2.4.9-1.5 2.4-2.4 4.1-2.4 2.5 0 4.5 2 4.5 4.6 0 3.6-3 6.6-8.6 10.2z"
          fill="var(--color-accent)"
        />
      </svg>
      <strong>bamas</strong>
    </span>
  );
}
export function Header({ title, back }: { title: string; back: () => void }) {
  return (
    <header className="screen-header">
      <IconButton label="Kembali" icon="back" onClick={back} />
      <h1>{title}</h1>
    </header>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}
