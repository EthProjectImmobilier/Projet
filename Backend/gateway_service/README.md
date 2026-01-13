# Gateway Service

## Description
Ce service est une API Gateway basée sur Spring Cloud Gateway. Il agit comme point d'entrée unique pour toutes les requêtes vers les microservices du projet (user, property, booking, payment, blockchain, notification, etc.). Il gère le routage, la sécurité JWT, et la délégation des appels.

## Fonctionnalités principales
- **Routage dynamique** vers les microservices selon l'URL.
- **Filtrage et authentification JWT** via un filtre custom (`JwtAuthenticationFilter`).
- **Gestion des routes publiques et protégées** (auth, fichiers, propriétés, etc.).
- **Configuration centralisée** des endpoints des services via `application.yml`.
- **Support OpenAPI/Swagger** pour la documentation des routes.

## Structure
- `GatewayRoutes.java` : Déclare toutes les routes et applique les filtres de sécurité.
- `JwtAuthenticationFilter.java` : Filtre qui valide le JWT et ajoute les headers d'utilisateur.
- `JwtTokenProvider.java` : Utilitaire pour parser et valider les tokens JWT.
- `application.yml` : Configuration des URI des services, du secret JWT, du port, etc.

## Lancement local
1. **Prérequis** : Java 21+, Maven
2. **Configuration** :
   - Renseigner les URI des microservices et le secret JWT dans `src/main/resources/application.yml` ou via variables d'environnement.
3. **Build & Run** :
   ```bash
   mvn clean package
   java -jar target/gateway-0.0.1-SNAPSHOT.jar
   ```
4. **Port par défaut** : 8080

## Variables d'environnement utiles
- `JWT_SECRET` : Secret pour signer/valider les JWT
- `USER_SERVICE_URI`, `PROPERTY_SERVICE_URI`, ... : URI des microservices

## Exemples de routes
- `/api/auth/login` → user-service
- `/api/properties` → property-service
- `/api/bookings/**` → booking-service
- `/api/payments/**` → payment-service
- `/files/avatar/**` → user-service (pour les fichiers utilisateurs)

## Sécurité
- Les routes protégées nécessitent un JWT valide dans l'en-tête `Authorization: Bearer <token>`.
- Les infos utilisateur sont propagées via headers (`X-Auth-User-Id`, etc.)

## Documentation
- Swagger UI : `/swagger-ui.html` (si activé sur les microservices)

## Dépendances principales
- Spring Cloud Gateway
- Spring Boot
- jjwt (JSON Web Token)

---

Pour toute modification de routage ou de sécurité, voir `GatewayRoutes.java` et `JwtAuthenticationFilter.java`.
