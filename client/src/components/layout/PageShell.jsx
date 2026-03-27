import TopNav from './TopNav';

export default function PageShell({ children }) {
  return (
    <main className="page-shell">
      <TopNav />
      {children}
    </main>
  );
}
