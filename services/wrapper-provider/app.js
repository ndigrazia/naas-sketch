import httpProxy from 'http-proxy';

const APP_PORT = process.env.APP_PORT ?? "6001";

const TARGET_PROXY = process.env.TARGET_PROXY ?? "http://localhost:8080";

const proxy = httpProxy.createProxyServer({target: `${TARGET_PROXY}`});

// Listen for the `error` event on `proxy`.
proxy.on('error', function (err, req, res) {
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });
   
    console.log('Error', err);

    res.end('Something went wrong. And we are reporting a custom error message.');
});

proxy.listen(APP_PORT, () => console.log(`Proxy server started on port ${APP_PORT}! -  Forwarding ---> ${TARGET_PROXY}`));