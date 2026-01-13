# Notification Service

## Description
Ce service gère les notifications utilisateurs pour la plateforme : stockage, consultation, marquage comme lue, suppression, et envoi d’emails. Il expose des endpoints REST et s’intègre avec les autres microservices via RabbitMQ et Feign.

## Fonctionnalités principales
- **Stockage des notifications** en base (PostgreSQL)
- **Consultation des notifications** (toutes, non lues)
- **Marquage comme lue** (individuelle ou toutes)
- **Suppression** (individuelle ou toutes)
- **Envoi d’emails** via SMTP (service dédié)
- **Réception de messages via RabbitMQ** (pour notifications asynchrones)

## Structure
- `controller/` : Endpoints REST (notifications)
- `service/` : Logique métier (email)
- `model/` : Entités JPA (Notification)
- `repository/` : Accès base de données
- `messaging/` : Gestion des messages RabbitMQ
- `dto/` : Objets de transfert (requêtes/réponses)

## Configuration
- `application.yml` : DB, RabbitMQ, mail, user-service, port
- Variables d’environnement supportées pour override (voir `application.yml`)

## Lancement local
1. **Prérequis** : Java 21+, Maven, PostgreSQL, RabbitMQ
2. **Configurer** : DB, RabbitMQ, mail dans `src/main/resources/application.yml`
3. **Build & Run** :
   ```bash
   mvn clean package
   java -jar target/notification-service-0.0.1-SNAPSHOT.jar
   ```
4. **Port par défaut** : 8086

## Exemples de routes
- `/api/notifications/me` (GET) : notifications de l’utilisateur
- `/api/notifications/me/unread` (GET) : notifications non lues
- `/api/notifications/{id}/read` (POST) : marquer comme lue
- `/api/notifications/me/read-all` (POST) : marquer toutes comme lues
- `/api/notifications/{id}` (DELETE) : supprimer une notification
- `/api/notifications/me` (DELETE) : supprimer toutes les notifications

## Dépendances principales
- Spring Boot (Web, Data JPA, AMQP, Mail, OpenFeign)
- PostgreSQL
- RabbitMQ
- Lombok

---

Pour toute extension (ex : nouveaux canaux de notification, templates email, etc.), voir les services et la structure associée.
