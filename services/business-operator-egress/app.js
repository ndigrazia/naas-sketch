import { DaprClient, HttpMethod, CommunicationProtocolEnum } from '@dapr/dapr';

import http from 'http';

const APP_PORT = process.env.APP_PORT ?? "5001";

const TARGET_PROXY_HOST = process.env.TARGET_PROXY_HOST ?? "localhost";

const TARGET_PROXY_PORT = process.env.TARGET_PROXY_PORT ?? "3601";

const TARGET_PROXY_PATH = process.env.TARGET_PROXY_PATH ?? "";

const DAPR_PROTOCOL = process.env.DAPR_PROTOCOL ?? "http";

const DAPR_HOST = process.env.DAPR_HOST ?? "localhost";

const KEY_TENANT = process.env.KEY_TENANT ?? "PER";

var DAPR_PORT  
switch (DAPR_PROTOCOL) {
  case "http": {
    DAPR_PORT = process.env.DAPR_HTTP_PORT;
    break;
  }
  case "grpc": {
    DAPR_PORT = process.env.DAPR_GRPC_PORT;
    break;
  }
  default: {
    DAPR_PORT = 3701;
  }
}

const DAPR_APP_ID = process.env.DAPR_APP_ID ?? "business-operator-token";

const DAPR_TOKEN_STORE_NAME = process.env.DAPR_TOKEN_STORE_NAME ?? "tokenstore";

const client = new DaprClient(DAPR_HOST, DAPR_PORT, DAPR_PROTOCOL);

async function save(store, key, object) {
  
  const state = [
    {
        key: key,
        value: object
    }
  ]

  // Save state into a state store
  await client.state.save(store, state)
  
  console.log(`Saving storeName: ${store}, value: ${JSON.stringify(state)}!`);

}

async function onRequest(req, res) {

  var token = await client.state.get(DAPR_TOKEN_STORE_NAME, KEY_TENANT);
  console.log("Getting token from store: ", token || undefined);

  if(!token)  {
    const _options =  {
      headers : {
        "naas-app-id": KEY_TENANT
      }
    };

    token =  await client.invoker.invoke(DAPR_APP_ID , "/v0/token", HttpMethod.POST, {}, _options);
    console.log("Getting token from service: ", token);

    if(token) {
      save(DAPR_TOKEN_STORE_NAME, KEY_TENANT, token);
    }
  }
  
  const url = TARGET_PROXY_PATH + req.url;

  console.log("Forwarding: " + url);
  
  const options = {
    hostname: TARGET_PROXY_HOST,
    port: TARGET_PROXY_PORT,
    path: url,
    method: req.method,
    headers: {
      ...req.headers,
      'dapr-app-id': 'dapr-proxy-microcks',
      'Authorization': `Bearer ${token.message.access_token}`
    }
  };

  const proxy = http.request(options, function (r) {
    res.writeHead(r.statusCode, r.headers);
    r.pipe(res, {
      end: true
    });
  });

  req.pipe(proxy, {
    end: true
  });
}

http.createServer(onRequest).listen(APP_PORT, () => console.log(`Proxy server started on port ${APP_PORT}!`));
