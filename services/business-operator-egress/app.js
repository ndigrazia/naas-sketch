import { DaprClient, HttpMethod, CommunicationProtocolEnum } from '@dapr/dapr';

import http from 'http';

const APP_PORT = process.env.APP_PORT ?? "5001";

const TARGET_PROXY_HOST = process.env.TARGET_PROXY_HOST ?? "localhost";

const TARGET_PROXY_PORT = process.env.TARGET_PROXY_PORT ?? "3601";

const TARGET_PROXY_PATH = process.env.TARGET_PROXY_PATH ?? "";

const DAPR_PROTOCOL = process.env.DAPR_PROTOCOL ?? "http";

const DAPR_HOST = process.env.DAPR_HOST ?? "localhost";

const INTERNAL = {
  code : "INTERNAL",
  status: 500,
  message: "The service is currently not available"
}

const ERR_DIRECT_INVOKE = {
  code : "ERR_DIRECT_INVOKE",
  status: 404,
  message: "failed getting the header x-tenant"
}

var firstTime = true;

var DAPR_PORT  
switch (DAPR_PROTOCOL) {
  case "http": {
    DAPR_PORT = process.env.DAPR_HTTP_PORT;
    if(!DAPR_PORT)
      DAPR_PORT = 3910;
    break;
  }
  case "grpc": {
    DAPR_PORT = process.env.DAPR_GRPC_PORT;
    break;
  }
  default: {
    DAPR_PORT = 3910;
  }
}

const DAPR_APP_ID = process.env.DAPR_APP_ID ?? "business-operator-token";

const DAPR_TOKEN_STORE_NAME = process.env.DAPR_TOKEN_STORE_NAME ?? "tokenstore";

const client = new DaprClient(DAPR_HOST, DAPR_PORT, DAPR_PROTOCOL);
console.log("-----------------------------------------------------");
console.log("business-operator-egress------------------------------");
console.log(`DaprClient:  Host:${DAPR_HOST}-Port:${DAPR_PORT}-Protocol:${DAPR_PROTOCOL}`);
console.log("-----------------------------------------------------");
console.log("-----------------------------------------------------");


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

async function getTokenFromService(headers) {

  const options =  {
    headers : {
      ...headers
    }
  };

  try { 
    const token =  await client.invoker.invoke(DAPR_APP_ID , "/v0/token", HttpMethod.POST, {}, options);

    console.log("Getting token from service: ", token);

    return token;
  }
  catch (error) {
    console.log(error);
    throw error;
  }
  
}

function invokeProxy(req, res, token) {

  const url = TARGET_PROXY_PATH + req.url;

  console.log("Forwarding: " + url);
  console.log("Token: " + token);
  
  const options = {
    hostname: TARGET_PROXY_HOST,
    port: TARGET_PROXY_PORT,
    path: url,
    method: req.method,
    headers: {
      ...req.headers,
      'dapr-app-id': 'dapr-proxy-microcks',
      'Authorization': `Bearer ${token.message.access_token}`
      //'Authorization': `Bearer MTQ0NjJkZmQ5OTM2NDE1ZTZjNGZmZjI3`
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

function closeConnWithError(type, req, res) {

  res.writeHead(type.status, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(type));
  res.end();

}

async function onRequest(req, res) {

  if(!firstTime) {

    var hasError = false;
    
    console.log("Headers: " + JSON.stringify(req.headers));

    const KEY_TENANT = req.headers['x-tenant'];

    console.log("x-tenant: " + KEY_TENANT);

    if(!KEY_TENANT)  {
      closeConnWithError(ERR_DIRECT_INVOKE, req, res);
      return;
    }

    var token = await client.state.get(DAPR_TOKEN_STORE_NAME, KEY_TENANT);
    //var token =  undefined;

    console.log("Getting token from store: ", token || undefined);

    if(!token)  {
      
      try {
          token = await getTokenFromService(req.headers);
          
          if(token) {
            await save(DAPR_TOKEN_STORE_NAME, KEY_TENANT, token);
          } else {
            closeConnWithError(INTERNAL, req, res);
            return;
          }
      }
      catch (error) {
        closeConnWithError(INTERNAL, req, res);
        return;
      }
    }

    invokeProxy(req, res, token);

  } else {
     firstTime = false;
  } 

}

http.createServer(onRequest).listen(APP_PORT, () => console.log(`Proxy server started on port ${APP_PORT}!`));
