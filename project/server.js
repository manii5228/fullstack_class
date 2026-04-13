const http = require("http");

const app = require("./app");

const { initSocket } =
require("./backend/config/socket");

const PORT =
process.env.PORT || 3000;

const server =
http.createServer(app);

initSocket(server);

server.listen(PORT,()=>{

console.log(
`Server running at:
http://localhost:${PORT}`
);

});