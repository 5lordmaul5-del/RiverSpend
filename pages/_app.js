import Head from 'next/head';
import '../styles/globals.css';
import CookieConsent from '../components/CookieConsent';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#06b6d4" />
      </Head>
      <Component {...pageProps} />
      <CookieConsent />
    </>
  );
}
