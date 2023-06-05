# Naas Sketch

It is a scratch environment to verify the functionality of the services.

## CAMARA Project

[Product documentation at Camara](https://camaraproject.org/)

[CAMARA Project](https://github.com/camaraproject)


## Run proxy to Microcks Backend with Dapr

see Start Dapr services.

[Start microcks](https://microcks.io/documentation/getting-started/)

cd naas-sketch/services/wrapper-provider

npm install

export TARGET_PROXY=http://localhost:8080/rest/camara-device-identifier-and-token-api/0.0.1

dapr run --app-port 6001 --app-id dapr-proxy-microcks --app-protocol http --dapr-http-port 3601 -- npm start


## Kill proxy to microcks backend

lsof -i :6001

kill -9 <PID>

## Start Dapr services

docker start dapr_placement dapr_zipkin dapr_redis


## Stop Dapr services

docker stop dapr_placement dapr_zipkin dapr_redis


## Run Business Operator Token Service with Dapr

cd naas-sketch/services/business-operator-token

npm install

export DAPR_APP_ID=dapr-proxy-microcks

export DAPR_TOKEN_STORE_NAME=tokenstore

dapr run --app-port 7001 --app-id business-operator-token --app-protocol http --dapr-http-port 3701 -- npm start 


## Run Business Operator Egress Service with Dapr

cd naas-sketch/services/business-operator-egress

export DAPR_APP_ID=business-operator-token

export DAPR_TOKEN_STORE_NAME=tokenstore

export TARGET_PROXY_HOST=localhost

export TARGET_PROXY_PORT=3601

npm install

dapr run --app-port 9010 --app-id business-operator-egress --app-protocol http --dapr-http-port 3910 -- npm start 


## Add Dapr resources

On Windows, under %UserProfile%\.dapr\components\tokenstore-redis.yaml

On Linux/MacOS, under ~/.dapr/components/tokenstore-redis.yaml


## Run Interchange Traffic Service (NGINX)

cd naas-sketch

docker run --network="host" --name interchange-traffic-service -v $PWD/nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro -d nginx:1.25.0

## Stop & remove Interchange Traffic Service

docker stop interchange-traffic-service

docker rm interchange-traffic-service


## Run KrakenD API Gateway

cd naas-sketch

docker run --network="host" --name api-gateway -v $PWD/krakend/krakend.json:/etc/krakend/krakend.json:ro -v $PWD/krakend/.htpasswd:/etc/krakend/.htpasswd:ro -d devopsfaith/krakend run --config /etc/krakend/krakend.json


## Stop & remove KrakenD API Gateway

docker stop api-gateway

docker rm api-gateway

## Start docker compose

cd naas-sketch\docker-compose

docker-compose up -d

## Stop docker compose

docker-compose down