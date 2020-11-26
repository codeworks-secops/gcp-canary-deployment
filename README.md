1- Architecture
===

[Link to the Architecture Diagram](https://app.diagrams.net/#G128JG979SFk0PAHYAi3uj1BWMQYXsDPSt)

2- Create new GCP Project
===

* Get the billing accounts list

    ```bash
    gcloud alpha billing accounts list
    ```

* Get the Organisation ID

    ```bash
    ORGANISATION_ID=$(gcloud organizations describe codeworks.fr --format=json | jq '.name' | cut -f 2 -d '/' | sed 's/"//g')
    ```
* Name the project

    ```bash
    PROJECT_NAME=codeday-canary-deployment-demo
    ```
* Create new project

    ```bash
    gcloud projects create ${PROJECT_NAME} --organization=${ORGANISATON_ID}
    ```

* Get the project number

    ```bash
    PROJECT_NUMBER=$(gcloud projects describe $PROJECT_NAME --format='value(projectNumber)')
    ```

* Link the project to the billing account

    ```bash
    gcloud alpha billing accounts projects link ${PROJECT_NUMBER} --account-id=0150EE-171E17-3E357F
    ```

* Inspects

    * From your terminal
        ```bash
        gcloud projects list
        ```

    * From the Google Cloud Console

3- Init GCP configuration
===

* Configure the gcloud tool to match account / project / zone to use from scratch
    ```bash
    gcloud init
    ```
* Display zones list
    ```bash
    gcloud compute zones list
    ```
* Another init !! to init the compute zone
    ```bash
    gcloud init
    ```
* Checl all of the configuration
    ```bash
    gcloud config list
    ```

4- Google Container Registry
===

- Build docker images

    - Stable version

    ```bash
    cd nodeapp/stable
    
    docker build -t gcr.io/${PROJECT_NAME}/nodeapp-stable:1.0.0 .
    ```

    - Canary version
    
    ```bash
    cd nodeapp/canary
    
    docker build -t gcr.io/${PROJECT_NAME}/nodeapp-canary:1.0.0 .
    ```

- Launch the Docker image in your local host 

    - Launch the stable image
        ```bash
        docker run --publish 9000:7070 --detach --name stable-app gcr.io/${PROJECT_NAME}/nodeapp-stable:1.0.0
        ```

    - Launch the canary image
        ```bash
        docker run --publish 9001:7070 --detach --name canary-app gcr.io/${PROJECT_NAME}/nodeapp-canary:1.0.0
        ```

    - Test containers using localhost

        [Stable Version](localhost:9000)

        [Canary Version](localhost:9001)

    - Test containers using internal IP address

        [Stable Version](STABLE_CONTAINER_IP_ADDRESS:7070)

        [Canary Version](CANARY_CONTAINER_IP_ADDRESS:7070)

- Login :set up a credential helper

    ```bash
    gcloud auth configure-docker
    ```

- Push all of images to the GCR
    
    - Stable version
        ```bash
        docker push gcr.io/${PROJECT_NAME}/nodeapp-stable:1.0.0
        ```

    - Canary version
        ```bash
        docker push gcr.io/${PROJECT_NAME}/nodeapp-canary:1.0.0
        ```

5- Create new cluster
===

```bash
gcloud container clusters create stable-canary-cluster --num-nodes=2
```

6- It's time to use Kubectl !
===

- Create a new Namespace 

    ```bash
    kubectl create ns stable-canary
    ```

- Create Deployment Resource  

    * Stable Application

        ```bash
        cat ./k8s/app-stable.deployment.yml | sh ./k8s/config.sh | kubectl create --save-config --record -f -
        ```

    * Canary Application

        ```bash
        cat ./k8s/app-canary.deployment.yml | sh ./k8s/config.sh | kubectl create --save-config --record -f -
        ```

- Create Service Resource 

    ```bash
    kubectl create -f ./k8s/app.service.yml -n stable-canary --save-config --record
    ```

7-  Check Running Applications
=== 

- Open a browser and pick the external service IP address and launch it

- Using a shell script : update the script **./curl_loadbalancer_service.sh** with the right external service IP address

    ```bash
    ./curl_loadbalancer_service.sh
    ```

8 -  Scale Canary / Stable version : 50% / 50 %
=== 

- Stable version

    update app-stable.deployment.yml => **replicas: 2**

    ```bash
    cat ./k8s/app-stable.deployment.yml | sh ./k8s/config.sh | kubectl apply --record -f -
    ```

- Canary version

    update app-canary.deployment.yml => **replicas: 2**

    ```bash
    cat ./k8s/app-canary.deployment.yml | sh ./k8s/config.sh | kubectl apply --record -f -
    ```

9 -  Scale down Stable version  and route all traffic to the Canary version :0% / 100%
=== 

- Stable version

    update app-stable.deployment.yml => **replicas: 0**

    ```bash
    cat ./k8s/app-stable.deployment.yml | sh ./k8s/config.sh | kubectl apply --record -f -
    ```

- Canary version

    update app-canary.deployment.yml => **replicas: 4**

    ```bash
    cat ./k8s/app-canary.deployment.yml | sh ./k8s/config.sh | kubectl apply --record -f -
    ```

10- Deleting your GCP resources
===

- Delete the Services
    
    ```bash
    kubectl delete service nodeapp-service -n stable-canary
    ```

- Delete the Deloyments

    ```bash
    kubectl delete deployment stable -n stable-canary
    kubectl delete deployment canary -n stable-canary
    ```

- Delete the Namespace

    ```bash
    kubectl delete ns stable-canary
    ```

- Delete the Cluster
    
    ```bash
    gcloud container clusters delete stable-canary-cluster
    ```

- Delete the specific images

    ```bash
    gcloud container images delete gcr.io/${PROJECT_NAME}/nodeapp-stable:1.0.0
    gcloud container images delete gcr.io/${PROJECT_NAME}/nodeapp-canary:1.0.0
    ```

- Delete the GCP Project

    ```bash
    gcloud projects delete $PROJECT_NAME
    ```