import './globals.css';

export const metadata = {
  title: 'KWASU Digital Clearance System',
  description: 'Digital Clearance & Approval System for Kwara State University (KWASU). Complete your SIWES and Final Year clearance online.',
  keywords: 'KWASU, clearance, SIWES, final year, university, Kwara State University',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: '/favicon.png',
    shortcut: '/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
