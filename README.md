# Naas Sketch


## CAMARA Project

[Product documentation at Camara](https://camaraproject.org/)

[CAMARA Project](https://github.com/camaraproject)


## Run proxy to microcks backend with Dapr

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


## Run Business Operator Token with Dapr
export DAPR_APP_ID=dapr-proxy-microcks

dapr run --app-port 7001 --app-id business-operator-token --app-protocol http --dapr-http-port 3701 -- npm start

