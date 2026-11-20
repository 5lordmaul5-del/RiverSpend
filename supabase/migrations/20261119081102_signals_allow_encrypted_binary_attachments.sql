-- Allow the ENIGMA client to upload encrypted binary attachments.
-- The client wraps encrypted files as application/octet-stream before storage.
update storage.buckets
set allowed_mime_types = array_append(allowed_mime_types, 'application/octet-stream')
where id = 'signals-private-media'
  and not ('application/octet-stream' = any(allowed_mime_types));
