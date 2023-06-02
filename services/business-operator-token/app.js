import { DaprClient, HttpMethod, CommunicationProtocolEnum } from '@dapr/dapr';

import express from 'express';

import bodyParser from 'body-parser';

const APP_PORT = process.env.APP_PORT ?? "7001";

const DAPR_PROTOCOL = process.env.DAPR_PROTOCOL ?? "http";

const DAPR_HOST = process.env.DAPR_HOST ?? "localhost";

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

const DAPR_APP_ID = process.env.DAPR_APP_ID ?? "dapr-proxy-microcks";

const DAPR_TOKEN_STORE_NAME = process.env.DAPR_TOKEN_STORE_NAME ?? "tokenstore";

const HTTP_CODE = 500;

const HTTP_MSG = "An unexpected condition has prevented from fulfilling the request.";

const HEADER_APP_ID = "x-tenant";

const client = new DaprClient(DAPR_HOST, DAPR_PORT, DAPR_PROTOCOL);

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/v0/token', async (_req, _res) => {
    var code = HTTP_CODE;
    var msg = HTTP_MSG;

    console.log(`Post method.`);

    const key = _req.header(HEADER_APP_ID);

    try {
        if(!key)  {
          code = 400;
          msg = `Failed getting the header ${HEADER_APP_ID} !`;
        }
        else {
          var options =  {
            headers : {
                  "Authorization": "Basic Y2VydGlmaWNhY2lvbjpZMlZ5ZEdsbWFXTmhZMmx2Ymw4eU1ERTNNRGd3TkE9PQ=="
            }
          };

          //Example POST Request with headers
          //const response = await client.invoker.invoke(
          //serviceAppId, serviceMethod, HttpMethod.POST,  { hello: "world" }, { headers: { "X-User-ID": "123" } },);
          const result = await client.invoker.invoke(DAPR_APP_ID , "/oauth2/v1/token", HttpMethod.POST, {}, options);
          
          //TODO Send to message broker 
          /*if(result) {
            save(DAPR_TOKEN_STORE_NAME, key, result);
          }*/

          code = 200;
          msg = result;
        }

        _res.status(code).json({message: msg});
    }
    catch (error) {
      if (error && error.message) {
          const obj = JSON.parse(error.message);

          code = (obj.status || HTTP_CODE);
          msg = (obj.error_msg || HTTP_MSG);
      }
      
      _res.status(code).json({message: msg});
    }
});

//TODO Change with a message broker
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

app.listen(APP_PORT, () => console.log(`Node App listening on port ${APP_PORT}!`));