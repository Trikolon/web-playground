// title: Returns the client's request headers as JSON

const route: ExportedHandler<Env>['fetch'] = async (request, env, ctx) => {
  // Get all request headers as an object
  const headersObj: Record<string, string> = {};
  for (const [key, value] of request.headers.entries()) {
    headersObj[key] = value;
  }
  return new Response(JSON.stringify(headersObj, null, 2), {
    headers: {
      'content-type': 'application/json',
    },
  });
};

export default route;
