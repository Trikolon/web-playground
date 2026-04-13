// title: Returns a random number
const route: ExportedHandler<Env>['fetch'] = async (_request, _env, _ctx) => {
  return new Response(`${Math.random()}`);
};

export default route;
