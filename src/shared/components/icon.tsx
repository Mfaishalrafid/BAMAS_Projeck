const paths: Record<string, string> = {
  home: "m3 10 9-7 9 7v10H3Z M9 20v-7h6v7",
  search: "M21 21l-6-6 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  heart:
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  plus: "M12 5v14 M5 12h14",
  user: "M20 21v-2a7 7 0 0 0-14 0v2 M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  back: "m15 18-6-6 6-6",
  check: "m5 12 4 4L19 6",
  pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z M12 7v5",
  bell: "M18 8a6 6 0 0 0-12 0v8l-2 2h16l-2-2Z M10 21h4",
  share: "M12 16V3 m-4 4 4-4 4 4 M5 12v9h14v-9",
  book: "M3 4h7l2 2 2-2h7v16h-7l-2 2-2-2H3Z",
  water: "M12 2S4 10 4 15a8 8 0 0 0 16 0c0-5-8-13-8-13Z",
  shield: "m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6Z",
  food: "M4 3v7h6V3 M7 10v11 M17 3v18 M17 3c5 4 5 8 0 9",
  clock: "M12 8v5l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
};
export function Icon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name] ?? paths.heart} />
    </svg>
  );
}
