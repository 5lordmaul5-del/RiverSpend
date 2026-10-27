import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import '../styles/globals.css';
import CookieConsent from '../components/CookieConsent';
import AnalyticsTracker from '../components/AnalyticsTracker';

const APP_MANIFESTS = [
  { match: '/servizi/sound-studio-live', href: '/manifest-soundstudioissa.json', color: '#7e22ce' },
  { match: '/servizi/music', href: '/manifest-music.json', color: '#7e22ce' },
  { match: '/river-spend-stream', href: '/manifest-streaming.json', color: '#7c3aed' },
  { match: '/park', href: '/manifest-park.json', color: '#0891b2' },
  { match: '/rs-control-center', href: '/manifest-panelcontrol.json', color: '#0f172a' },
];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const selectedApp = APP_MANIFESTS.find((app) => router.pathname === app.match || router.pathname.startsWith(app.match + '/'));
  const manifestHref = selectedApp ? selectedApp.href : '/manifest-shop.json?v=5';
  const themeColor = selectedApp ? selectedApp.color : '#06b6d4';

  useEffect(() => {
    // Keep the existing notification service worker active and make the site install-friendly.
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => {
        console.warn('RiverSpend service worker registration failed:', error);
      });
    }
  }, []);

  return (
    <>
      <Head>
        <link rel="manifest" href={manifestHref} />
        <meta name="theme-color" content={themeColor} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Head>
      <Component {...pageProps} />
      <AnalyticsTracker />
      <CookieConsent />
    </>
  );
}
