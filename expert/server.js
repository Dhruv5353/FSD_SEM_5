//node js

var http = require('http');

var a = 10
var b = 20
var c = a+b

var msg= ''

if(c==30)
{
    msg = " the value of c is 30"
}
else{
    msg = 'the value of c is not 30  '
}

// const port = Math.floor(Math.random() * (65535 - 1024) + 1024);
const port = 3000

http.createServer(function(req, res) {
    res.writeHead(200,{"content-type":"text/html"})
    res.write("<b>Hello World</b>")    
    res.write("<br/><b>I am the server</b>")
    res.write(`<h1>I am port ${port} </h1>`)
    res.write(`<br/>A value is ${a} and B value is ${b} and Sum(C) value is ${c}<br/>`)
    res.write(`<h3 style="color:red">${msg}</h3>`)
    res.end("<br/>Bye bye")    
}).listen(port);

console.log(`Server startrd on http://127.0.0.1:${port}`)