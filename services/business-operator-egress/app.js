import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr"

// It may be replaced by http library
import express from 'express';

import httpProxy from 'http-proxy';

const APP_PORT = process.env.APP_PORT ?? "3000";

// Create a proxy server with custom application logic
const proxy = httpProxy.createProxyServer({});

// Create a http server 
const app = express();

// Listen for the `error` event on `proxy`.
proxy.on('error', function (err, req, res) {
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });
   
    console.log('Error', err);

    res.end('Something went wrong. And we are reporting a custom error message.');
});

// To modify the proxy connection before data is sent, you can listen
// for the 'proxyReq' event. When the event is fired, you will receive
// the following arguments:
// (http.ClientRequest proxyReq, http.IncomingMessage req,
//  http.ServerResponse res, Object options). This mechanism is useful when
// you need to modify the proxy request before the proxy connection
// is made to the target.
proxy.on('proxyReq', function(proxyReq, req, res, options) {
    proxyReq.setHeader('Authorization', 'Basic ZGVtbzpwQDU1dzByZA=='); // header added
});

app.get('*', (req, res) => {
    // You can define here your custom logic to handle the request
    // and then proxy the request.
    console.log('Forwarding', req.method, req.url);
    proxy.web(req, res, { target: `${req.url}` });
});

app.listen(APP_PORT, () => console.log(`Proxy server started on port ${APP_PORT}!`));