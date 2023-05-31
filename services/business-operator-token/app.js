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

const HTTP_CODE = 500;

const HTTP_MSG = "An unexpected condition has prevented from fulfilling the request.";

const client = new DaprClient(DAPR_HOST, DAPR_PORT, DAPR_PROTOCOL);

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/token', async (_req, res) => {
    console.log("Post method.");

    try {

        var options =  {
          headers : {
                "Authorization": "Basic Y2VydGlmaWNhY2lvbjpZMlZ5ZEdsbWFXTmhZMmx2Ymw4eU1ERTNNRGd3TkE9PQ=="
          }
        };

        //Example POST Request with headers
        //const response = await client.invoker.invoke(
        //serviceAppId, serviceMethod, HttpMethod.POST,  { hello: "world" }, { headers: { "X-User-ID": "123" } },);
        const result = await client.invoker.invoke(DAPR_APP_ID , "/oauth2/v1/token", HttpMethod.POST, {}, options);
        
        if(result) {
          console.log(result.access_token);
        }

        res.send(result);
    }
    catch (error) {
      var code = HTTP_CODE;
      var msg = HTTP_MSG;

      if (error && error.message) {
          const obj = JSON.parse(error.message);

          code = (obj.status || HTTP_CODE);
          msg = (obj.error_msg || HTTP_MSG);
      }
      
      res.status(code).json({message: msg});
    }
});

app.listen(APP_PORT, () => console.log(`Node App listening on port ${APP_PORT}!`));