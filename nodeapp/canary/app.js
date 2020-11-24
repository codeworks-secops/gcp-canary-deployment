const os = require('os');
const http = require('http');
const fs = require('fs');
const url = require('url');

console.log('Canary Server starting...');

var handler = function(request, response) {
    let pathname = url.parse(request.url).pathname;
    if (pathname == '/') {
        pathname = '/index.html';
    }
    
    fs.readFile(pathname.substr(1), (err, data) => {
        if (err) {
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.write('404 - file not found');
         } else {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.write(data.toString());
         }   
         response.end();
    });
}

var www = http.createServer(handler);
www.listen(7070);