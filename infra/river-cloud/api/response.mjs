/** Safely attempt to deliver a JSON response without crashing on disconnects. */
export function sendJsonResponse(res, status, payload) {
  // A client may disconnect while authentication or database work is in flight.
  if (res.destroyed || res.writableEnded || res.headersSent) return false;
  let body;
  try {
    // Serialize before headers are sent to avoid partial responses on serialization errors.
    body = JSON.stringify(payload);
  } catch {
    return false;
  }
  try {
    res.writeHead(status, {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
    });
    res.end(body);
    return true;
  } catch {
    // Response delivery failures must not crash the API process.
    return false;
  }
}
