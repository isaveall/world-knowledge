// Root admin layout — no auth check, applies to all /admin/* routes
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
