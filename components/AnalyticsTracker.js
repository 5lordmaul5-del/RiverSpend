'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

const CONSENT_KEY = 'riverspend-cookie-preferences-v1';
const SESSION_KEY = 'rs-analytics-session-v1';
const HEARTBEAT_MS = 15000;

function analyticsAllowed() {
  try {
    const preferences = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null');
    return preferences?.analytics === true;
  } catch {
    return false;
  }
}

function sessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'rs-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 18);
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return 'rs-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 18);
  }
}

function deviceType() {
  if (typeof window === 'undefined') return 'unknown';
  const width = window.innerWidth || 0;
  if (/ipad|tablet/i.test(navigator.userAgent) || (width >= 600 && width <= 1100 && 'ontouchstart' in window)) return 'tablet';
  if (/mobile|android|iphone/i.test(navigator.userAgent) || width < 600) return 'mobile';
  return 'desktop';
}

function cleanPath(path) {
  const pathname = String(path || '/').split('?')[0].split('#')[0];
  return pathname.slice(0, 200) || '/';
}

function recordSite(eventType, path, duration = 0, metadata = {}) {
  if (!analyticsAllowed()) return;
  const safeDuration = Math.max(0, Math.min(86400, Math.round(Number(duration) || 0)));
  supabase.from('rs_site_analytics_events').insert({
    session_id: sessionId(),
    event_type: eventType,
    page_path: cleanPath(path),
    duration_seconds: safeDuration,
    device_type: deviceType(),
    metadata
  }).then(({ error }) => {
    if (error && process.env.NODE_ENV !== 'production') console.warn('RiverSpend site analytics:', error.message);
  }).catch(() => {});
}

function recordMedia(module, eventType, path, duration = 0, contentId = null) {
  if (!analyticsAllowed()) return;
  supabase.from('rs_media_analytics_events').insert({
    module,
    event_type: eventType,
    content_id: contentId ? String(contentId).slice(0, 200) : cleanPath(path),
    session_id: sessionId(),
    user_id: null,
    device_type: deviceType(),
    duration_seconds: Math.max(0, Math.min(86400, Math.round(Number(duration) || 0))),
    metadata: { page_path: cleanPath(path), tracking_version: 1 }
  }).then(({ error }) => {
    if (error && process.env.NODE_ENV !== 'production') console.warn('RiverSpend media analytics:', error.message);
  }).catch(() => {});
}

export default function AnalyticsTracker() {
  const router = useRouter();
  const pageRef = useRef({ path: '/', lastMark: 0, startedAt: 0 });
  const mediaRef = useRef(new WeakMap());
  const pathRef = useRef(router.asPath);
  useEffect(() => { pathRef.current = router.asPath; }, [router.asPath]);

  useEffect(() => {
    let pageTimer;
    let observer;
    let consentListener;

    const startPage = (rawPath) => {
      const path = cleanPath(rawPath);
      const now = Date.now();
      pageRef.current = { path, lastMark: now, startedAt: now };
      recordSite('page_view', path, 0, { tracking_version: 1 });
      clearInterval(pageTimer);
      pageTimer = setInterval(() => {
        if (document.visibilityState !== 'visible' || !analyticsAllowed()) return;
        const current = pageRef.current;
        const elapsed = Math.floor((Date.now() - current.lastMark) / 1000);
        if (elapsed >= 5) {
          recordSite('page_heartbeat', current.path, elapsed, {});
          current.lastMark = Date.now();
        }
      }, HEARTBEAT_MS);
    };

    const flushPage = (eventType = 'page_exit') => {
      const current = pageRef.current;
      const elapsed = Math.floor((Date.now() - current.lastMark) / 1000);
      if (elapsed > 0 && elapsed <= 86400) {
        recordSite(eventType, current.path, elapsed, {});
        current.lastMark = Date.now();
      }
    };

    const attachMedia = (element) => {
      if (mediaRef.current.has(element)) return;
      const isVideo = element.tagName === 'VIDEO';
      const isAudio = element.tagName === 'AUDIO';
      if (!isVideo && !isAudio) return;
      const state = { lastMark: 0, total: 0, timer: null, completed: false, started: false };
      mediaRef.current.set(element, state);
      const getModule = () => {
        const explicit = element.dataset.rsModule || element.closest('[data-rs-module]')?.dataset.rsModule;
        if (['broadcast', 'radio', 'stream', 'site_video', 'site_audio'].includes(explicit)) return explicit;
        const path = cleanPath(pathRef.current).toLowerCase();
        if (path.includes('broadcast')) return 'broadcast';
        if (path.includes('stream')) return 'stream';
        if (path.includes('radio') || path.includes('music')) return 'radio';
        return isAudio ? 'site_audio' : 'site_video';
      };
      const getContentId = () => element.dataset.rsContentId || element.dataset.contentId || element.getAttribute('aria-label') || cleanPath(pathRef.current);
      const onPlay = () => {
        if (!analyticsAllowed()) return;
        const now = Date.now();
        state.lastMark = now;
        if (!state.started) {
          recordMedia(getModule(), 'play_start', pathRef.current, 0, getContentId());
          state.started = true;
        }
        clearInterval(state.timer);
        state.timer = setInterval(() => {
          if (element.paused || element.ended || document.visibilityState !== 'visible' || !analyticsAllowed()) return;
          const elapsed = Math.floor((Date.now() - state.lastMark) / 1000);
          if (elapsed >= 5) {
            state.total += elapsed;
            recordMedia(getModule(), 'play_heartbeat', pathRef.current, elapsed, getContentId());
            recordSite(isVideo ? 'video_heartbeat' : 'audio_heartbeat', pathRef.current, elapsed, { content_id: getContentId() });
            state.lastMark = Date.now();
          }
        }, HEARTBEAT_MS);
      };
      const onPause = () => {
        if (state.lastMark && analyticsAllowed()) {
          const elapsed = Math.floor((Date.now() - state.lastMark) / 1000);
          if (elapsed > 0 && elapsed <= 60 && !element.ended) {
            state.total += elapsed;
            recordMedia(getModule(), 'play_heartbeat', pathRef.current, elapsed, getContentId());
            recordSite(isVideo ? 'video_heartbeat' : 'audio_heartbeat', pathRef.current, elapsed, { content_id: getContentId() });
          }
        }
        state.lastMark = 0;
        clearInterval(state.timer);
      };
      const onEnded = () => {
        onPause();
        if (!state.completed && analyticsAllowed()) {
          recordMedia(getModule(), 'play_complete', pathRef.current, state.total, getContentId());
          recordSite(isVideo ? 'video_complete' : 'audio_complete', pathRef.current, state.total, { content_id: getContentId() });
          state.completed = true;
        }
        state.started = false;
        state.total = 0;
        state.completed = false;
      };
      element.addEventListener('play', onPlay);
      element.addEventListener('playing', onPlay);
      element.addEventListener('pause', onPause);
      element.addEventListener('ended', onEnded);
      element.addEventListener('emptied', onPause);
      state.cleanup = () => {
        clearInterval(state.timer);
        element.removeEventListener('play', onPlay);
        element.removeEventListener('playing', onPlay);
        element.removeEventListener('pause', onPause);
        element.removeEventListener('ended', onEnded);
        element.removeEventListener('emptied', onPause);
      };
    };

    const scanMedia = () => document.querySelectorAll('video,audio').forEach(attachMedia);
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        flushPage('visibility_hidden');
        document.querySelectorAll('video,audio').forEach(el => {
          const state = mediaRef.current.get(el);
          if (state && !el.paused && state.lastMark && analyticsAllowed()) {
            const elapsed = Math.floor((Date.now() - state.lastMark) / 1000);
            if (elapsed > 0 && elapsed <= 60) {
              state.total += elapsed;
              recordMedia(el.tagName === 'AUDIO' ? 'site_audio' : 'site_video', 'play_heartbeat', pathRef.current, elapsed, el.dataset.rsContentId || cleanPath(pathRef.current));
              recordSite(el.tagName === 'AUDIO' ? 'audio_heartbeat' : 'video_heartbeat', pathRef.current, elapsed, {});
              state.lastMark = Date.now();
            }
          }
        });
      } else {
        pageRef.current.lastMark = Date.now();
        document.querySelectorAll('video,audio').forEach(el => {
          const state = mediaRef.current.get(el);
          if (state && !el.paused) state.lastMark = Date.now();
        });
      }
    };
    const onPageHide = () => flushPage('page_exit');

    startPage(pathRef.current);
    const onRouteChange = (nextPath) => { flushPage('page_exit'); startPage(nextPath); scanMedia(); };
    router.events.on('routeChangeComplete', onRouteChange);
    scanMedia();
    observer = new MutationObserver(scanMedia);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    consentListener = () => {
      if (analyticsAllowed()) {
        recordSite('page_view', pageRef.current.path, 0, { consent_updated: true, tracking_version: 1 });
        scanMedia();
      }
    };
    window.addEventListener('riverspend:cookie-preferences-change', consentListener);

    return () => {
      flushPage('page_exit');
      router.events.off('routeChangeComplete', onRouteChange);
      clearInterval(pageTimer);
      observer?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('riverspend:cookie-preferences-change', consentListener);
      document.querySelectorAll('video,audio').forEach(el => mediaRef.current.get(el)?.cleanup?.());
    };
  }, []);

  return null;
}
