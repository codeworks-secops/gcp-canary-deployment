#### 
# - 0 -  Build Docker images
#### 
$> cd nodeapp/stable
$> docker build -t app-stable:latest .
$> docker tag app-stable:latest elyhamza/app-stable:latest
$> docker push elyhamza/app-stable:latest

$> cd nodeapp/canary
$> docker build -t app-canary:latest .
$> docker tag app-canary:latest elyhamza/app-canary:latest
$> docker push elyhamza/app-canary:latest

#### 
# - 2 - Create new NameSpace 
#### 
kubectl create ns stable-canary

#### 
# - 2 - Create Deployment Resource 
#### 
$> kubectl create -f app-stable.deployment.yml -n stable-canary --save-config --record

$> kubectl create -f app-canary.deployment.yml  -n stable-canary --save-config --record

#### 
# - 3 - Create Service Resource 
#### 

$> kubectl create -f app.service.yml -n stable-canary --save-config --record

#### 
# - 4 -  Execute curl Script to the Minikube service for this app 
#### 

$> minikube list service

update the script ./curl_minikube_node_service.sh

$> ./curl_minikube_node_service.sh

#### 
# - 5 -  Update Deployment Resource to route all traffic to the Canary Deployment 
#### 

update app-stable.deployment.yml => replicas: 0

update app-canary.deployment.yml => replicas: 4

$> kubectl apply -f app-stable.deployment.yml -n stable-canary --record

$> kubectl apply -f app-canary.deployment.yml -n stable-canary --record