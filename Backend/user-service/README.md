# User Service

## Description
Ce service gère la gestion des utilisateurs pour la plateforme : authentification, inscription, profils, fichiers KYC, avatars, rôles, tokens, etc. Il expose des endpoints REST sécurisés et s’intègre avec le gateway et d’autres microservices.

## Fonctionnalités principales
- **Inscription, login, refresh, logout** (JWT)
- **Gestion du profil utilisateur** (lecture, modification)
- **Upload de fichiers** (avatar, KYC recto/verso) avec stockage local (ou S3 si besoin)
- **Gestion des rôles et permissions**
- **Réinitialisation de mot de passe par email**
- **Vérification d’email et de wallet Ethereum**
- **Endpoints internes pour communication inter-service**

## Structure
- `controller/` : Endpoints REST (auth, admin, user, fichiers)
- `service/` : Logique métier (auth, user, fichiers, tokens, etc.)
- `entity/` : Entités JPA (User, RefreshToken, etc.)
- `repository/` : Accès base de données
- `dto/` : Objets de transfert (requêtes/réponses)
- `exception/` : Gestion des erreurs globales

## Stockage des fichiers
- Par défaut : stockage local dans `/uploads` (configurable)
- Peut être remplacé par S3 via l’interface `FileStorageService`

## Sécurité
- Authentification JWT (header `Authorization: Bearer <token>`)
- Filtres et propagation des infos utilisateur via headers
- Rôles : USER, ADMIN, etc.

## Configuration
- `application.yml` : DB, mail, JWT, gateway, stockage fichiers
- Variables d’environnement supportées pour override (voir `application.yml`)

## Lancement local
1. **Prérequis** : Java 21+, Maven, PostgreSQL
2. **Configurer** : DB, mail, gateway, etc. dans `src/main/resources/application.yml`
3. **Build & Run** :
   ```bash
   mvn clean package
   java -jar target/user-service-0.0.1-SNAPSHOT.jar
   ```
4. **Port par défaut** : 8081

## Exemples de routes
- `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh` ...
- `/api/users/me` (profil)
- `/api/users/me/photo`, `/api/users/me/kyc-recto`, `/api/users/me/kyc-verso` (upload fichiers)
- `/api/admin/**` (admin)
- `/internal/users/**` (interne)

## Dépendances principales
- Spring Boot (Web, Security, Data JPA, Mail)
- PostgreSQL
- jjwt (JWT)
- Lombok
- Web3j (wallet Ethereum)

---

Pour toute extension (ex : S3, nouveaux rôles, etc.), voir l’interface `FileStorageService` et les services associés.
