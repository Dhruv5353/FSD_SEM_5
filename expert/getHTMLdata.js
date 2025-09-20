var http = require('http')
var fs = require('fs')

const port = 3002

http.createServer(function (req, res) {
    //read file
    fs.readFile("demo.html",'utf-8', function(err,data){
        // console.log(data)
        res.end(data)
    })    
}).listen(port)

console.log(`Server startrd on http://127.0.0.1:${port}`)