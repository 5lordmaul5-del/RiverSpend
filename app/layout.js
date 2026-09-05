export const metadata = {
  title: 'RiverSpend - your shop your flow',
  description: 'Marketplace interattivo',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#0040aa', color: '#ffffff', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center' }}>
        {children}
      </body>
    </html>
  );
}
