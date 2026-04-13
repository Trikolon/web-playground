// title: Returns the client's IP address as plain text.

const route: ExportedHandler<Env>['fetch'] = async (request, _env, _ctx) => {
  const ip =
    // Common header used by proxies to forward the real client IP.
    request.headers.get('x-real-ip') ??
    // Cloudflare specific IP header.
    request.headers.get('cf-connecting-ip') ??
    'Unknown IP';
  return new Response(ip);
};

export default route;
