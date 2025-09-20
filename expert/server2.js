var http = require('http');

const port = 3001
http.createServer(function(req, res) {
   if(req.url == '/home') {
       res.end("<h1 style='color:green'>Welcome to the Home Page</h1>");
   }
   else if(req.url == '/about') {
       res.end("<h1 style='color:red' >Welcome to the About Page</h1>");
   }
   else if (req.url == '/welcome'){
        res.end("<h1 style='color:blue'>Welcome to the Welcome Page</h1>");
   }
   else{
        res.end("<h1 style='color:pink'>404 Page not found</h1>")
   }
}).listen(port);

console.log(`Server startrd on http://localhost:${port}`)