var http = require('http');

const port = 4000;

http.createServer(function (req, res) {
    res.write("Hello World");
    res.end();
}).listen(port);

console.log(`Server listening on port http://localhost:${port}`);
