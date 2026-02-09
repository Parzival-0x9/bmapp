import './globals.css';

export const metadata = {
  title: 'Billiards Manager',
  description: 'Production-ready billiards hall operations dashboard'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
