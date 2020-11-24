1- Architecture
===

[Link to the Architecture Diagram](https://app.diagrams.net/#G128JG979SFk0PAHYAi3uj1BWMQYXsDPSt)

2- Create new GCP Project
===

```bash
# Get billing accounts list
$> gcloud alpha billing accounts list
# Get the Organisation ID
ORGANISATION_ID=$(gcloud organizations describe codeworks.fr --format=json | jq '.name' | cut -f 2 -d '/' | sed 's/"//g')
# Export a new environment variable named `PROJECT_NAME`
$> export PROJECT_NAME=codeday-canary-deployment-demo
# Create a new project
$> gcloud projects create ${PROJECT_NAME} --organization=${ORGANISATON_ID}
# Grap the project number
$> PROJECT_NUMBER=$(gcloud projects list --format=json | jq -c '.[] | select(.name == env.PROJECT_NAME) | .projectNumber' | sed 's/"//g')
# Link the project to the billing account
$> gcloud alpha billing accounts projects link ${PROJECT_NUMBER} --account-id=0150EE-171E17-3E357F
# Check the console if you want !!!
```

3- Init glcoud
===

```bash
# Configure gcloud to match account / project / zone to use from scratch
$> gcloud init
# Display zones list
$> gcloud compute zones list
# Checl all of the configuration
$> gcloud config list
```

4- Google Container Registry
===

- Build docker images

    ```bash
    # Stable version
    $> cd nodeapp/stable
    $> docker build -t gcr.io/${PROJECT_NAME}/nodeapp-stable:1.0.0 .

    # Canary version
    $> cd nodeapp/canary
    $> docker build -t gcr.io/${PROJECT_NAME}/nodeapp-canary:1.0.0 .
    ```

- Launch the Docker image in your local host 

    ```bash
    # Launch stable image
    docker run --publish 9000:7070 --detach --name stable-app gcr.io/${PROJECT_NAME}/nodeapp-stable:1.0.0

    # Launch canary image
    docker run --publish 9001:7070 --detach --name canary-app gcr.io/${PROJECT_NAME}/nodeapp-canary:1.0.0
    ```

    - Test containers using localhost

        [Stable Version](localhost:9000)

        [Canary Version](localhost:9001)

    - Test containers using internal IP address

        [Stable Version](STABLE_CONTAINER_IP_ADDRESS:7070)

        [Canary Version](CANARY_CONTAINER_IP_ADDRESS:7070)

- Login

    ```bash
    # set up a credential helper
    $> gcloud auth configure-docker
    ```

- Push all of images to the GCR
    
    ```bash
    # Stable version
    $> docker push gcr.io/${PROJECT_NAME}/nodeapp-stable:1.0.0

    # Canary version
    $> docker push gcr.io/${PROJECT_NAME}/nodeapp-canary:1.0.0
    ```

5- Create new cluster
===

```bash
$> gcloud container clusters create stable-canary-cluster --num-nodes=2
```

6- It's time to use Kubectl !
===

- Create a new Namespace 

    ```bash
    $> kubectl create ns stable-canary
    ```

- Create Deployment Resource  

    * Stable Application

        ```bash
        $> cat ./k8s/app-stable.deployment.yml | sh ./k8s/config.sh | kubectl create --save-config --record -f -
        ```

    * Canary Application

        ```bash
        $> cat ./k8s/app-canary.deployment.yml | sh ./k8s/config.sh | kubectl create --save-config --record -f -
        ```

- Create Service Resource 

    ```bash
    $> kubectl create -f ./k8s/app.service.yml -n stable-canary --save-config --record
    ```

7-  Check Running Applications
=== 

- Using browsers and the external service IP address

- Using a shell script : update the script ./curl_loadbalancer_service.sh with the right external service IP address

    ```bash
    $> ./curl_loadbalancer_service.sh
    ```
8 -  Scale Canary / Stable version
=== 

update app-stable.deployment.yml => **replicas: 2**

update app-canary.deployment.yml => **replicas: 2**

```bash
$> cat ./k8s/app-stable.deployment.yml | sh ./k8s/config.sh | kubectl apply --record -f -

$> cat ./k8s/app-canary.deployment.yml | sh ./k8s/config.sh | kubectl apply --record -f -
```

9 -  Scale down Stable version / Route all traffic to the Canary version
=== 

update app-stable.deployment.yml => **replicas: 0**

update app-canary.deployment.yml => **replicas: 4**

```bash
$> cat ./k8s/app-stable.deployment.yml | sh ./k8s/config.sh | kubectl apply --record -f -

$> cat ./k8s/app-canary.deployment.yml | sh ./k8s/config.sh | kubectl apply --record -f -
```

10- Deleting your GCP resources
===

- Delete Services
    
    ```bash
    $> kubectl delete service nodeapp-service -n stable-canary
    ```

- Delete Deloyments

    ```bash
    $>  kubectl delete deployment stable -n stable-canary
    $>  kubectl delete deployment canary -n stable-canary
    ```

- Delete Namespace

    ```bash
    $>  kubectl delete ns stable-canary
    ```

- Delete Cluster
    
    ```bash
    $> gcloud container clusters delete stable-canary-cluster
    ```

- Delete a specific images

    ```bash
    $> gcloud container images delete gcr.io/${PROJECT_NAME}/nodeapp-stable:1.0.0
    $> gcloud container images delete gcr.io/${PROJECT_NAME}/nodeapp-canary:1.0.0
    ```

- Delete GCP Project

    ```bash
    $> gcloud projects delete $PROJECT_NAME
    ```