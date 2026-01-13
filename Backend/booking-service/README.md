# Booking Service

## Description
Ce service gère les réservations de propriétés sur la plateforme : création, modification, annulation, gestion des risques, communication avec les autres microservices (user, property, AI, etc.). Il expose des endpoints REST et s’intègre avec le gateway.

## Fonctionnalités principales
- **CRUD réservations** (création, modification, annulation, consultation)
- **Gestion des risques** (endpoints dédiés, scoring, etc.)
- **Communication avec property-service, user-service, ai-service** via Feign clients
- **Gestion des messages et notifications via RabbitMQ**
- **Tâches planifiées** (nettoyage, notifications, etc.)
- **Endpoints internes pour communication inter-service**

## Structure
- `controller/` : Endpoints REST (booking, risk, interne)
- `service/` : Logique métier (booking, tâches planifiées)
- `entity/` : Entités JPA (Booking, etc.)
- `repository/` : Accès base de données
- `dto/` : Objets de transfert (requêtes/réponses)
- `messaging/` : Gestion des messages RabbitMQ
- `exception/` : Gestion des erreurs globales

## Configuration
- `application.yml` : DB, RabbitMQ, Feign, services externes, etc.
- Variables d’environnement supportées pour override (voir `application.yml`)

## Lancement local
1. **Prérequis** : Java 21+, Maven, PostgreSQL, RabbitMQ
2. **Configurer** : DB, RabbitMQ, services externes dans `src/main/resources/application.yml`
3. **Build & Run** :
   ```bash
   mvn clean package
   java -jar target/booking-service-0.0.1-SNAPSHOT.jar
   ```
4. **Port par défaut** : 8083

## Exemples de routes
- `/api/bookings` (GET, POST, PUT, DELETE)
- `/api/risk/**` (gestion des risques)
- `/internal/bookings/**` (interne)

## Dépendances principales
- Spring Boot (Web, Data JPA, Validation, AMQP, OpenFeign)
- PostgreSQL
- Lombok

---

Pour toute extension (ex : nouveaux algos de scoring, intégration AI, etc.), voir les services et clients Feign associés.
