const fastify = require("fastify")();

fastify.get("/api/v1/env", () => {
  return { flagsmith: process.env.FLAGSMITH_ENVIROMENT_KEY || "dev" };
});

fastify.listen(3000, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
