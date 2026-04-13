// title: Returns a response after a configurable delay (?delay=ms, default 5000, max 25000)
const route: ExportedHandler<Env>['fetch'] = async (request, env, ctx) => {
  const url = new URL(request.url);
  const MIN_DELAY_MS = 0;
  const MAX_DELAY_MS = 25_000;

  const raw = Number(url.searchParams.get('delay') ?? 5000);
  const delayMs = Math.min(
    MAX_DELAY_MS,
    Math.max(MIN_DELAY_MS, Math.floor(raw)),
  );

  await new Promise((resolve) => setTimeout(resolve, delayMs));

  return new Response(
    `Responded after ${delayMs}ms delay\n\nUsage: ?delay=<ms> (default: 5000, range: 0-25000)\nExample: /slow-response/?delay=10000`,
    { headers: { 'Content-Type': 'text/plain' } },
  );
};

export default route;
