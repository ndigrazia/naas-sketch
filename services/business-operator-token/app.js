import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr"

// It may be replaced by http library
import express from 'express';

const APP_PORT = process.env.APP_PORT ?? "5000";

// Create a http server 
const app = express();

app.get('*', (req, res) => {
    // You can define here your custom logic to handle the request
    // and then proxy the request.
    console.log('Request: ', req.method, req.url);
});

app.listen(APP_PORT, () => console.log(`Proxy server started on port ${APP_PORT}!`));