import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import '../styles/globals.css';
import CookieConsent from '../components/CookieConsent';
import AnalyticsTracker from '../components/AnalyticsTracker';

const APP_MANIFESTS = [
  { match: '/electronics', href: '/manifest-electronics.json', color: '#10131b' },
  { match: '/river-ai', href: '/river-ai.webmanifest', color: '#06172b' },
  { match: '/servizi/sound-studio-live', href: '/manifest-soundstudioissa.json', color: '#7e22ce' },
  { match: '/servizi/music', href: '/manifest-music.json', color: '#7e22ce' },
  { match: '/river-spend-stream', href: '/manifest-streaming.json', color: '#7c3aed' },
  { match: '/park', href: '/manifest-park.json', color: '#0891b2' },
  { match: '/rs-control-center', href: '/manifest-panelcontrol.json', color: '#0f172a' },
  { match: '/riverspace-signals', href: '/manifest-signals.json', color: '#073b4c' },
];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const selectedApp = APP_MANIFESTS.find((app) => router.pathname === app.match || router.pathname.startsWith(app.match + '/'));
  const manifestHref = selectedApp ? selectedApp.href : '/manifest-shop.json?v=5';
  const themeColor = selectedApp ? selectedApp.color : '#06b6d4';

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return undefined;

    let disposed = false;
    let refreshing = false;
    let registration;

    // Reload exactly once when an already-installed PWA takes control from a newer worker.
    const handleControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    // Do not reload on the very first installation; only handle an update to an existing app.
    const hadController = Boolean(navigator.serviceWorker.controller);
    if (hadController) {
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    }

    const checkForUpdate = async () => {
      try {
        if (registration && document.visibilityState === 'visible') {
          await registration.update();
        }
      } catch (error) {
        console.warn('RiverSpend PWA update check failed:', error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkForUpdate();
    };

    navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    }).then((value) => {
      registration = value;
      if (!disposed) checkForUpdate();
    }).catch((error) => {
      console.warn('RiverSpend service worker registration failed:', error);
    });

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (hadController) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      }
    };
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
