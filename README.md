Projet - Rapport d'ensemble

**Aperçu**
- **But :** Plateforme décentralisée de location/gestion immobilière composée d'un frontend React, d'un backend microservices (Spring Boot), d'un ensemble de contrats Ethereum et de services ML/IA.
- **Langages & tech :** Java (Spring Boot), TypeScript/React (Vite), Solidity/Hardhat, Python (IA), Docker, Kubernetes, PostgreSQL, RabbitMQ.

**Architecture**
- **Backend (microservices) :** code Java Spring Boot dans le dossier [Backend](Backend). Services principaux :
  - `Blockchain_Layer` : intégration blockchain et clients (Hardhat/contrats).
  - `booking-service` : gestion des réservations.
  - `gateway_service` : API Gateway (proxy, routage, sécurité).
  - `notification-service` : notifications asynchrones.
  - `property-service` : gestion des biens.
  - `user-service` : gestion des utilisateurs et auth.
- **Contrats & déploiement local Ethereum :** dossier [Block-chain](Block-chain) contient les contrats Solidity, la configuration Hardhat (`Block-chain/hardhat.config.ts`) et les scripts de déploiement.
- **Frontend web :** dossier [rentChain](rentChain) — application React + Vite (TypeScript). Intégration web3 via `rentChain/src/blockchain` et composants UI dans `rentChain/src/components`.
- **Service IA / ML :** dossier [ia_service](ia_service) — modèles de pricing et risque, pipeline d'analyse (`analytics_engine.py`, `main.py`) et `requirements.txt`.
- **Infrastructure & Orchestration :** manifests Kubernetes dans [K8s](K8s) et compose / Dockerfiles à la racine pour composition locale (`docker-compose.yaml`).

**Démarrage local (rapide)**
- Démarrer les dépendances (Postgres, RabbitMQ) :

  ```powershell
  docker-compose up -d postgres rabbitmq
  ```
- Backend : pour chaque service Java (ex. `booking-service`) :

  ```powershell
  cd Backend/booking-service
  ./mvnw spring-boot:run
  ```
- Frontend :

  ```powershell
  cd rentChain
  npm install
  npm run dev
  ```
- Blockchain (développement) :

  ```powershell
  cd Block-chain
  npm install
  npx hardhat node
  npx hardhat run scripts/deploy.ts --network localhost
  ```
- IA service :

  ```powershell
  cd ia_service
  pip install -r requirements.txt
  python main.py
  ```

**Variables d'environnement importantes**
- Frontend : `VITE_API_BASE_URL` (définit l'URL de l'API backend exposée au navigateur).
- IA : fichier `.env.example` dans `ia_service` contient les variables recommandées.
- Services Java : paramètres de connexion PostgreSQL et RabbitMQ (généralement via `application.yml`/`application.properties` dans chaque service).

**Déploiement**
- Les manifests Kubernetes sont fournis dans [K8s](K8s) pour déploiement cluster (deployments, services, ingress, secrets, PVC).
- Chaque service a un `Dockerfile` pour construire l'image. Plusieurs `Jenkinsfile` sont présents pour CI/CD dans les sous-modules.

**Tests & Qualité**
- Tests unitaires et d'intégration : regarder `src/test` dans chaque service Java et `Block-chain/test` pour les tests de contrats. Frontend contient des composants testables (vérifier `rentChain` structure de tests si ajoutés).

**Points d'attention / Recommandations**
- Vérifier la synchronisation des adresses des contrats : `Block-chain/deployed-addresses.json` doit être mis à jour après chaque déploiement.
- Variables d'environnement côté client : assurez-vous que `VITE_API_BASE_URL` pointe vers l'API Gateway (`gateway_service`).
- Sécurité : gérer correctement les secrets Kubernetes (`K8s/secret.yaml`, `pg-secret.yaml`, `rabbitmq-secret.yaml`) et limiter l'exposition de l'API.
- Observabilité : ajouter métriques/logs centralisés (Prometheus/Grafana, ELK) si non présents.

**Fichiers clés**
- `docker-compose.yaml` : orchestration locale des services essentiels.
- [Block-chain/hardhat.config.ts](Block-chain/hardhat.config.ts) : configuration réseau et plugins Hardhat.
- [rentChain/src/blockchain](rentChain/src/blockchain) : intégration frontend → blockchain.
- [ia_service/main.py](ia_service/main.py) : point d'entrée du service IA.
- [K8s](K8s) : manifests Kubernetes pour production/staging.

**Prochaines étapes suggérées**
- Documenter les variables d'environnement spécifiques par service dans chaque `README.md` de sous-dossier.
- Automatiser le déploiement des contrats et la mise à jour de `deployed-addresses.json` dans CI.
- Ajouter un guide `local-dev.md` pour développer en mode full-stack (front + backend + blockchain + IA).

---
Rapport généré automatiquement — si vous souhaitez des détails supplémentaires (diagramme d'architecture, checklist de déploiement, ou documentation pour un service précis), dites quel service je dois détailler.
## Le projet complet avec les fichiers de DevOps