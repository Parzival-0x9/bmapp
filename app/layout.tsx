import './globals.css';

export const metadata = {
  title: 'Billiards Management Clone',
  description: 'Functional clone for hall operations and billing'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
