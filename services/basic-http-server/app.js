import http from 'http';

const APP_PORT = process.env.APP_PORT ?? "5050";

const response = {"message": "Request successfully proxied!"};

// Create your target server
//
const server = http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('Request successfully!');
    if(process.env.APP_TAG) res.write('\n\n Tag: ' + process.env.APP_TAG);
    res.write('\n\n' + JSON.stringify(req.headers, true, 2));
    res.end();
  });
  
server.listen(APP_PORT, () => console.log(`Basic HTTP server started on port ${APP_PORT}!`));
