import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/weather/ThemeProvider';

export const metadata: Metadata = {
  title: 'Atmos — Weather Dashboard',
  description: 'A polished, fast weather dashboard powered by OpenWeather.',
  icons: {
    icon: 'https://openweathermap.org/img/wn/02d@2x.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
