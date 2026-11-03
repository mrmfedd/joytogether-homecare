export default function AdminPublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,var(--midnight),var(--royal))] text-white">
      {children}
    </div>
  );
}
