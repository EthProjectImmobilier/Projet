# Property Service

## Description
Ce service gère la gestion des propriétés immobilières pour la plateforme : création, modification, recherche, disponibilité, images, avis, analytics, etc. Il expose des endpoints REST et s’intègre avec le gateway, le user-service et d’autres microservices.

## Fonctionnalités principales
- **CRUD propriétés** (création, modification, suppression, consultation)
- **Recherche avancée** (filtres, pagination, destinations populaires, propriétés similaires)
- **Gestion des disponibilités**
- **Gestion des images de propriétés** (upload, suppression, listing)
- **Gestion des avis/reviews** (admin et public)
- **Analytics sur les propriétés**
- **Endpoints internes pour communication inter-service**

## Structure
- `controller/` : Endpoints REST (propriétés, images, reviews, analytics, admin, disponibilité)
- `service/` : Logique métier (propriétés, images, reviews, recherche, analytics, etc.)
- `entity/` : Entités JPA (Property, Review, etc.)
- `repository/` : Accès base de données
- `dto/` : Objets de transfert (requêtes/réponses)
- `exception/` : Gestion des erreurs globales

## Stockage des fichiers
- Par défaut : stockage local dans `/uploads` (configurable)
- Peut être remplacé par S3 via l’interface `FileStorageService`

## Configuration
- `application.yml` : DB, RabbitMQ, gateway, stockage fichiers, recherche, etc.
- Variables d’environnement supportées pour override (voir `application.yml`)

## Lancement local
1. **Prérequis** : Java 21+, Maven, PostgreSQL, RabbitMQ
2. **Configurer** : DB, RabbitMQ, gateway, etc. dans `src/main/resources/application.yml`
3. **Build & Run** :
   ```bash
   mvn clean package
   java -jar target/property-service-0.0.1-SNAPSHOT.jar
   ```
4. **Port par défaut** : 8082

## Exemples de routes
- `/api/properties` (GET, POST, PUT, DELETE)
- `/api/properties/search` (recherche)
- `/api/properties/{id}/images` (upload/listing images)
- `/api/properties/{id}/availability` (gestion disponibilité)
- `/api/properties/{id}/reviews` (avis)
- `/api/analytics/**` (analytics)
- `/api/admin/properties/**` (admin)
- `/internal/properties/**` (interne)

## Dépendances principales
- Spring Boot (Web, Data JPA, Validation, AMQP)
- PostgreSQL
- Lombok

---

Pour toute extension (ex : S3, nouveaux filtres de recherche, etc.), voir l’interface `FileStorageService` et les services associés.
