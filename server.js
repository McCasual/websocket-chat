const ws = new require('ws');
const fs = require('fs');
const http = require('http');

const wss = new ws.Server({noServer: true});

const clients = new Set();

function accept(req, res) {
    if(req.url == '/ws' && req.headers.upgrade && req.headers.upgrade.toLowerCase() == 'websocket' && req.headers.connection.match(/\bupgrade\b/i)) {
        wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onSocketConnect);
    }
    else if(req.url == '/') {
        fs.createReadStream('./index.html').pipe(res);
    }
    else if(req.url == '/send.svg') {
        fs.createReadStream('./send.svg').pipe(res);
    }
    else {
        fs.createReadStream('./background.jpg').pipe(res);
    }
}
function onSocketConnect(ws) {
    clients.add(ws);
    ws.on('message', function(message) {
        var output = JSON.parse(message);
        output = JSON.stringify(output);
        log(output);
        for(let client of clients) {
            client.send(output);
        }
    });
    ws.on('close', function() {
        clients.delete(ws);
    })
}
let log;
if(!module.parent) {
    log = console.log;
    http.createServer(accept).listen(8080);
}
else {
    log = function() {
        exports.accept = accept;
    }
}

