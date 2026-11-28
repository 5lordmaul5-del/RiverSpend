/** Safely attempt to deliver a JSON response without crashing on disconnects. */
export function sendJsonResponse(res, status, payload) {
  // A client may disconnect while authentication or database work is in flight.
  if (res.destroyed || res.writableEnded) return false;
  try {
    res.writeHead(status, {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
    });
    res.end(JSON.stringify(payload));
    return true;
  } catch {
    // Response delivery failures must not crash the API process.
    return false;
  }
}
