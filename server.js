const fastify = require("fastify")({
  logger: true,
});
let refreshToken = [];
const jwt = require("jsonwebtoken");
fastify.post("/login", (req, reply) => {
  const { name } = req.body;
  const user = {
    username: name,
  };
  const accessToken = generate(user);
  console.log(accessToken);
  const refresh_token = jwt.sign(user, "secret_key");
  refreshToken.push(refresh_token);
  reply.send({ token: accessToken, refresh_token: refresh_token });
});

function generate(user) {
  console.log("hello",user)
  return jwt.sign(user, "secret_keysss", {
    expiresIn: "30s",
  });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token);

  if (!token) {
    return res.code(401).send({ error: "Unauthorized - Token not provided" });
  }

  jwt.verify(token, "secret_keysss", (err, user) => {
    console.log("Error:", err);
    console.log("User:", user);
    if (err) {
      return res.code(403).send({ error: "Forbidden - Invalid token" });
    }
    req.user = user;
    next();
  });
}
fastify.post("/posts", { preHandler: authenticateToken }, (req, reply) => {
  reply.send(req.user.username);
});

fastify.post("/token", (req, reply) => {
  const token = req.body.token;
  if (!token) {
    reply.send("not token validate"); 
    return;
  }
  if (!refreshToken.includes(token)) {
    reply.send("token not in list"); 
    return;
  }
  jwt.verify(token, "secret_key", (err, user) => {
    if (err) return reply.send("error"); 
    const accessToken = generate({ username: user.username }); 
    reply.send({ accessToken: accessToken }); 
  });
});


async function start() {
  try {
    await fastify.listen({ port: 3002 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
