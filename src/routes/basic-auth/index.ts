// title: Responds with a 401 Basic auth challenge and echoes submitted credentials back
const route: ExportedHandler<Env>['fetch'] = async (request, _env, _ctx) => {
  const auth = request.headers.get('authorization');
  if (!auth) {
    return new Response('Authentication required.', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Basic auth demo"',
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store',
      },
    });
  }

  const encoded = auth.replace(/^Basic\s+/i, '');
  let decoded: string;
  try {
    decoded = atob(encoded);
  } catch {
    decoded = '(could not decode base64)';
  }

  return new Response(`Received credentials: ${decoded}\n`, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-store',
    },
  });
};

export default route;
