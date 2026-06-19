import './PageShell.css';

export default function PageShell({ label, title, description, children }) {
  return (
    <main className="page-shell">
      <header className="page-shell__hero">
        <div className="container page-shell__hero-inner">
          {label && <p className="section-label">{label}</p>}
          <h1 className="section-title">{title}</h1>
          {description && (
            <p className="page-shell__desc">{description}</p>
          )}
        </div>
      </header>
      {children && (
        <section className="page-shell__body">
          <div className="container">{children}</div>
        </section>
      )}
    </main>
  );
}
