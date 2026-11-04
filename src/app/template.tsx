/** Re-mounted on every navigation, so each page enters with the same short transition. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
