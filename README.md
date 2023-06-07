# Naas Sketch

It is a scratch environment to verify the functionality of the services.

See [API for “Device Location”](./api/api_definitions/camara/device-Identifier/camara-device-identifier-api-0.0.2.yaml).

Knowing about [the Global Gateway design](./design_global_gateway/blueprint/NaaS-GG-070620231300.drawio.png) and [the Multiple Gateway design](./design_multiple_gateway/blueprint/NaaS-MG-070620231300.drawio.png) can help you understand the components of your solution.

## CAMARA Project

Please visit [Product documentation at Camara](https://camaraproject.org/).

Please visit [CAMARA Project](https://github.com/camaraproject).

## Config Microcks

First at all, [Start microcks](https://microcks.io/documentation/getting-started/).

After that, upload the mock service from microcks' importers. Choose the [mock service](./microcks/camara-device-identifier-and-token-api.postman_collection.json).

Finally, config rules. You can find dispatching rules in [device-identifier rule](./microcks/rules/device-identifier.script_dispatcher_rules) & [token rule](./microcks/rules/token.script_dispatcher_rules).

## Run standalone 

### Run proxy to Microcks Backend with Dapr

Please see "Install the Dapr" & "Start Dapr services".

Please visit [Start microcks](https://microcks.io/documentation/getting-started/).

```console
cd ./services/wrapper-provider

npm install

export TARGET_PROXY=http://localhost:8080/rest/camara-device-identifier-and-token-api/0.0.1

dapr run --app-port 6001 --app-id dapr-proxy-microcks --app-protocol http --dapr-http-port 3601 -- npm start
```

### Kill proxy to microcks backend

```console
lsof -i :6001

kill -9 <PID>
```

### Install the Dapr

Please visit [the getting started section](https://docs.dapr.io/getting-started/).

### Start Dapr services

```console
docker start dapr_placement dapr_zipkin dapr_redis
```

### Stop Dapr services

```console
docker stop dapr_placement dapr_zipkin dapr_redis
```

### Run Business Operator Token Service with Dapr

```console
cd ./services/business-operator-token

npm install

export DAPR_APP_ID=dapr-proxy-microcks

export DAPR_TOKEN_STORE_NAME=tokenstore

dapr run --app-port 7001 --app-id business-operator-token --app-protocol http --dapr-http-port 3701 -- npm start 
```

### Run Business Operator Egress Service with Dapr

```console
cd ./services/business-operator-egress

export DAPR_APP_ID=business-operator-token

export DAPR_TOKEN_STORE_NAME=tokenstore

export TARGET_PROXY_HOST=localhost

export TARGET_PROXY_PORT=3601

npm install

dapr run --app-port 9010 --app-id business-operator-egress --app-protocol http --dapr-http-port 3910 -- npm start 
```

### Add Dapr resources

Copy ./localhost/dapr/tokenstore-redis.yaml to:

On Windows, under %UserProfile%\.dapr\components\tokenstore-redis.yaml

On Linux/MacOS, under ~/.dapr/components/tokenstore-redis.yaml

### Run Interchange Traffic Service (NGINX)

```console
cd ./localhost

docker run --network="host" --name interchange-traffic-service -v $PWD/nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro -d nginx:1.25.0
```

### Stop & remove Interchange Traffic Service

```console
docker stop interchange-traffic-service

docker rm interchange-traffic-service
```

### Run KrakenD API Gateway

```console
cd ./localhost

docker run --network="host" --name api-gateway -v $PWD/krakend/krakend.json:/etc/krakend/krakend.json:ro -v $PWD/krakend/.htpasswd:/etc/krakend/.htpasswd:ro -d devopsfaith/krakend run --config /etc/krakend/krakend.json
```

### Stop & remove KrakenD API Gateway

```console
docker stop api-gateway

docker rm api-gateway
```

## Global Gateway design

### Start docker compose

```console
cd ./design_global_gateway/docker-compose

docker-compose up -d
```

### Stop docker compose

```console
cd ./design_global_gateway/docker-compose

docker-compose down
```