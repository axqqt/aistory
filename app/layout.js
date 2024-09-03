// app/layout.js

import Link from 'next/link';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-gray-800 p-4 text-white">
          {/* <Link href="/">Home</Link> | <Link href="/story">Create Story</Link> */}
        </nav>
        <div>{children}</div>
      </body>
    </html>
  );
}
