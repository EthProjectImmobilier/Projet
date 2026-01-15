# Rapport DevOps — Projet Immobilier Décentralisé

Ce document détaille la partie DevOps du projet : CI/CD, conteneurs, orchestration Kubernetes, configuration des services stateful (PostgreSQL, RabbitMQ), gestion des secrets, et recommandations d'observabilité et sécurité.

## Vue d'ensemble
- Dossier `K8s` contient les manifests Kubernetes pour chaque service (deployments, services, ingress, PVC, secrets).
- Chaque microservice Java dans `Backend/*` possède un `Dockerfile` et un `Jenkinsfile` (CI/CD).
- Le frontend `rentChain` est packagé via Vite et dispose d'un `Dockerfile` et d'un manifest (`rent-chain-deployment.yaml`).
- Les contrats Ethereum sont dans `Block-chain` (Hardhat). Le déploiement des contrats génère `deployed-addresses.json`.

## CI/CD

Observations actuelles :
- Plusieurs `Jenkinsfile` sont présents (racine des sous-projets). Ils indiquent une architecture CI centrée sur Jenkins pour build, test, et push d'images Docker.
- Pipeline typique attendu : checkout → tests unitaires → build → docker build → push registry → déploiement (k8s apply / helm / kubectl rollout).

Recommandations :
- Centraliser la construction d'images et la publication vers un registry Docker Hub.

- Ajouter validations de sécurité (scan d'images : Trivy, Snyk) et checks IaC (kube-lint, kubeval, conftest) dans pipeline.

Exemple de commandes CI simplifiées :

```bash
# build Java
./mvnw -DskipTests package

# build image
docker build -t registry.example.com/projet/booking-service:$BRANCH-$BUILD_ID .
docker push registry.example.com/projet/booking-service:$BRANCH-$BUILD_ID


```

## Conteneurs & images
- Chaque service a un `Dockerfile` ; privilégier des images légères (OpenJDK slim, distroless).
- Tagging sémantique : `registry/projet/service:git-commit` + `:latest` pour environnements non-production.

## Architecture de projet
```
Projet/
├── Backend/
│   ├── Blockchain_Layer/
│   │   ├── Dockerfile        # Dockerfile contenant les dépendances du service Blockchain_Layer
│   │   └── Jenkinsfile       # Pipeline CI/CD du service Blockchain_Layer
│   │
│   ├── booking-service/
│   │   ├── Dockerfile        # Dockerfile du service Booking
│   │   └── Jenkinsfile       # Pipeline CI/CD du service Booking
│   │
│   ├── gateway-service/
│   │   ├── Dockerfile        # Dockerfile du service Gateway
│   │   └── Jenkinsfile       # Pipeline CI/CD du service Gateway
│   │
│   ├── notification-service/
│   │   ├── Dockerfile        # Dockerfile du service Notification
│   │   └── Jenkinsfile       # Pipeline CI/CD du service Notification
│   │
│   ├── property-service/
│   │   ├── Dockerfile        # Dockerfile du service Property
│   │   └── Jenkinsfile       # Pipeline CI/CD du service Property
│   │
│   └── user-service/
│       ├── Dockerfile        # Dockerfile du service User
│       └── Jenkinsfile       # Pipeline CI/CD du service User
│
├── Block-chain/
│   ├── Dockerfile            # Dockerfile principal de la blockchain
│   └── Jenkinsfile           # Pipeline CI/CD du module Blockchain
│
├── ia_service/
│   ├── Dockerfile            # Dockerfile du service IA
│   └── Jenkinsfile           # Pipeline CI/CD du service IA
│
├── rentChain/
│   ├── Dockerfile            # Dockerfile du Frontend
│   └── Jenkinsfile           # Pipeline CI/CD du Frontend
│
├── k8s/
│   ├── namespace.yaml                 # Définition du namespace du projet
│   │
│   ├── configmaps/
│   │   ├── gateway-config.yaml        # Variables de configuration du Gateway
│   │   ├── user-service-config.yaml   # ConfigMap du service User
│   │   ├── property-service-config.yaml
│   │   └── blockchain-config.yaml
│   │
│   ├── secrets/
│   │   └── secret.yaml                # Données sensibles (mots de passe, clés, etc.)
│   │
│   ├── gateway/
│   │   ├── gateway-deployment.yaml    # Deployment du Gateway
│   │   ├── gateway-service.yaml       # Service Kubernetes du Gateway
│   │   └── gateway-ingress.yaml       # Ingress pour exposer l’API Gateway
│   │
│   ├── user-service/
│   │   ├── user-deployment.yaml       # Deployment microservice User
│   │   ├── user-service.yaml          # Service interne User
│   │   └── user-hpa.yaml              # Autoscaling du service User
│   │
│   ├── property-service/
│   │   ├── property-deployment.yaml
│   │   ├── property-service.yaml
│   │   └── property-hpa.yaml
│   │
│   ├── blockchain-layer/
│   │   ├── blockchain-deployment.yaml # Déploiement du service Blockchain
│   │   ├── blockchain-service.yaml    # Service interne Blockchain
│   │   └── blockchain-pvc.yaml        # Stockage persistant Blockchain
│   │
│   ├── database/
│   │   ├── postgres-deployment.yaml   # Déploiement PostgreSQL
│   │   ├── postgres-service.yaml      # Service de base de données
│   │   ├── postgres-pvc.yaml          # Volume persistant PostgreSQL
│   │   └── postgres-config.yaml       # Configuration PostgreSQL
│   │
│   ├── monitoring/
│   │   ├── prometheus-deployment.yaml # Supervision avec Prometheus
│   │   ├── grafana-deployment.yaml    # Dashboard Grafana
│   │   └── metrics-service.yaml       # Service de métriques
│   │
│   ├── ingress/
│   │   └── ingress.yaml               # Règles d’accès externes globales
│   │
│   ├── volumes/
│   │   ├── pv.yaml                    # Persistent Volumes
│   │   └── storage-class.yaml         # Définition des classes de stockage
│   │
│   ├── network/
│   │   ├── network-policy.yaml        # Politiques réseau entre pods
│   │   └── service-mesh.yaml          # Configuration service mesh (optionnel)
│   │
└── └── Jenkinsfile                    # Orchestration globale des pipelines Kubernetes
```


## Orchestration Kubernetes

Structure importante dans `K8s` :
- `namespace.yaml` — namespace recommandé pour isoler ressources.
- `pg-statefulset.yaml` + `pg-pvc.yaml` — PostgreSQL est stateful ; vérifier storageClass et backups.
- `rabbitmq-deployment.yaml` + `rabbitmq-pvc.yaml` — RabbitMQ nécessite stockage persistant pour queues durables.
- `ingress.yaml` — définit routes externes (ingress controller requis : nginx/Traefik).

Bonnes pratiques et vérifications :
- Utiliser `Readiness` et `Liveness` probes pour chaque service.
- Resource requests/limits CPU/Mem pour éviter contention.
- S'assurer que les secrets (cf. `K8s/secret.yaml`, `pg-secret.yaml`, `rabbitmq-secret.yaml`) ne contiennent pas de valeurs en clair dans le repo.
- Mettre en place `PodDisruptionBudget` pour services critiques.

## Configuration stateful
- PostgreSQL : vérifier `pg-statefulset.yaml` pour rétention des données, snapshot/backups (Velero ou solution cloud).
- RabbitMQ : configurer clustering si haute disponibilité nécessaire.

## Réseau & sécurité
- Frontend -> Gateway : `gateway_service` est le point d'entrée. L'Ingress doit limiter les IP et activer TLS.
- Activer mTLS entre services si sensibilité élevée.
- Restreindre RBAC Kubernetes : définir ServiceAccounts par service et permissions minimales.



## Backups & DR
- Sauvegardes PostgreSQL régulières (pg_dump ou solutions de snapshot). Tester restauration.
- Exporter et conserver `deployed-addresses.json` lors des déploiements de contrats.


## Checklist rapide avant production
- [ ] Secrets déplacés vers un vault (HashiCorp Vault, Kubernetes Secrets + KMS).
- [ ] Scans d'images ajoutés dans pipeline.
- [ ] Monitoring et alerting configurés.
- [ ] Backups automatisés testés.
- [ ] Processus de rollback documenté et automatisé.

## Diagrammes
Architecture haute-niveau et pipeline CI/CD sont fournis dans `docs/images/architecture.svg` et `docs/images/cicd.svg`.

---
Si vous voulez, je peux :
- Générer des fichiers `helm` charts pour chaque service.
- Ajouter des workflows GitHub Actions équivalents aux `Jenkinsfile`.
- Créer des manifests k8s corrigés avec probes, ressources et PDB.
