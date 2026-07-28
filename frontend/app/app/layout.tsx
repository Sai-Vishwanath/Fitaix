import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/* 1. We make the main background a dark gray (zinc-950) and center everything */}
      <body className="bg-zinc-950 text-white min-h-screen flex justify-center antialiased">
        
        {/* 2. This div acts as the "phone screen" (max-w-md restricts the width) */}
        <div className="w-full max-w-md min-h-screen bg-black border-x border-zinc-900 shadow-2xl flex flex-col relative">
          {children}
        </div>

      </body>
    </html>
  )
}