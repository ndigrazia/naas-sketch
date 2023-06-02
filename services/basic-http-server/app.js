import http from 'http';

const APP_PORT = process.env.APP_PORT ?? "5050";

const response = {"message": "Request successfully proxied!"};

// Create your target server
const server = http.createServer(function (req, res) {
    
    const _res =  {
      message: 'Request successfully!',
      tag: (process.env.APP_TAG || 'undefined'),
      headers: {
        ...req.headers
      }  
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(_res));
    
    res.end();

  });
  
server.listen(APP_PORT, () => console.log(`Basic HTTP server started on port ${APP_PORT}!`));
