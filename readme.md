1 -  Build Docker images
===

### Stable Application

```bash
$> cd nodeapp/stable
$> docker build -t app-stable:latest .
$> docker tag app-stable:latest elyhamza/app-stable:latest
$> docker push elyhamza/app-stable:latest
```
### Canary Application

```bash
$> cd nodeapp/canary
$> docker build -t app-canary:latest .
$> docker tag app-canary:latest elyhamza/app-canary:latest
$> docker push elyhamza/app-canary:latest
```

2 - Create a new Namespace 
===

```bash
$> kubectl create ns stable-canary
```

2 - Create Deployment Resource 
=== 

### Stable Application

```bash
$> kubectl create -f app-stable.deployment.yml -n stable-canary --save-config --record
```

### Canary Application

```bash
$> kubectl create -f app-canary.deployment.yml  -n stable-canary --save-config --record
```

3 - Create Service Resource 
=== 

```bash
$> kubectl create -f app.service.yml -n stable-canary --save-config --record
```

4 -  Check Running Applications
=== 

- Using browsers 

```bash
$> minikube list service
```

- Using script : update the script ./curl_minikube_node_service.sh with the right service IP address

```bash
$> ./curl_minikube_node_service.sh
```

5 -  Scale Canary / Stable Deployment
=== 

update app-stable.deployment.yml => **replicas: 2**

update app-canary.deployment.yml => **replicas: 2**

```bash
$> kubectl apply -f app-stable.deployment.yml -n stable-canary --record

$> kubectl apply -f app-canary.deployment.yml -n stable-canary --record
```

6 -  Scale down Stable Deployment / Route all traffic to the Canary Deployment
=== 

update app-stable.deployment.yml => **replicas: 0**

update app-canary.deployment.yml => **replicas: 4**

```bash
$> kubectl apply -f app-stable.deployment.yml -n stable-canary --record

$> kubectl apply -f app-canary.deployment.yml -n stable-canary --record
```