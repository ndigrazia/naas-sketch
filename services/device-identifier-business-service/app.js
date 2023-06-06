import { DaprClient, HttpMethod, CommunicationProtocolEnum } from '@dapr/dapr';

import express from 'express';

import bodyParser from 'body-parser';

const APP_PORT = process.env.APP_PORT ?? "9030";

const DAPR_PROTOCOL = process.env.DAPR_PROTOCOL ?? "http";

const DAPR_HOST = process.env.DAPR_HOST ?? "localhost";

const HTTP_CODE = 500;

const HTTP_MSG = "An unexpected condition has prevented from fulfilling the request.";

var DAPR_PORT  
switch (DAPR_PROTOCOL) {
  case "http": {
    DAPR_PORT = process.env.DAPR_HTTP_PORT;
    if(!DAPR_PORT)
      DAPR_PORT = 3930;
    break;
  }
  case "grpc": {
    DAPR_PORT = process.env.DAPR_GRPC_PORT;
    break;
  }
  default: {
    DAPR_PORT = 3930;
  }
}

const DAPR_APP_ID = process.env.DAPR_APP_ID ?? "business-operator-egress-peru";

const client = new DaprClient(DAPR_HOST, DAPR_PORT, DAPR_PROTOCOL);
console.log("-----------------------------------------------------");
console.log("business-operator-token------------------------------");
console.log(`DaprClient:  Host:${DAPR_HOST}-Port:${DAPR_PORT}-Protocol:${DAPR_PROTOCOL}`);
console.log("-----------------------------------------------------");
console.log("-----------------------------------------------------");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/dvi/v0/device-identifier', async (_req, _res) => {
    console.log(`GET method.`);

    console.log("Headers: " + JSON.stringify(_req.headers));

    var code = HTTP_CODE;
    var msg = HTTP_MSG;
    
    try {
        var options =  {
          headers : {
            ..._req.headers
          }
        };
   
        const result = await client.invoker.invoke(DAPR_APP_ID , "/dvi/v0/device-identifier", HttpMethod.GET, {}, options);
          
        code = 200;
        msg = result;      

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

app.listen(APP_PORT, () => console.log(`Node App listening on port ${APP_PORT}!`));