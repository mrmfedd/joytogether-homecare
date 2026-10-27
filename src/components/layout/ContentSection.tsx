export function ContentSection({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`section-pad ${className}`}>
      <div className="site-container max-w-4xl">
        {title ? (
          <h2 className="font-display m-0 mb-6 text-3xl text-purple-900">{title}</h2>
        ) : null}
        <div className="body-muted space-y-4">{children}</div>
      </div>
    </section>
  );
}
