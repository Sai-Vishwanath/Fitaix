import './globals.css';

import { FitAIProvider } from '../lib/FitAIContext';
import { getThemeInitScript } from '../lib/theme';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: getThemeInitScript() }}
        />
      </head>
      <body className="bg-background text-text-primary min-h-screen flex justify-center antialiased">
        <FitAIProvider>
          <div className="w-full max-w-md min-h-screen bg-background border-x border-border shadow-2xl flex flex-col relative">
            {children}
          </div>
        </FitAIProvider>
      </body>
    </html>
  );
}
