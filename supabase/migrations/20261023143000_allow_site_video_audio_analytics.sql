-- Allow consented visitors to submit playback events for native site video/audio players.
CREATE POLICY "Visitors submit site video audio analytics"
ON public.rs_media_analytics_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  user_id IS NULL
  AND event_type IN ('play_start', 'play_heartbeat', 'play_complete')
  AND module IN ('broadcast', 'radio', 'stream', 'site_video', 'site_audio')
  AND duration_seconds >= 0
  AND duration_seconds <= 86400
  AND session_id IS NOT NULL
  AND char_length(session_id) BETWEEN 12 AND 100
);
