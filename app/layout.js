export const metadata = {
  title: 'RiverSpend - Next Gen',
  description: 'Nuovo marketplace interattivo',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
