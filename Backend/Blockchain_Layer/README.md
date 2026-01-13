# Blockchain Layer (BCback)

## Description
Ce service fait l’interface entre la plateforme et la blockchain (Ethereum/Sepolia). Il gère l’enregistrement des utilisateurs, la vérification des transactions, la gestion des paiements en escrow, et la communication avec les smart contracts déployés. Il expose des endpoints REST et s’intègre avec les autres microservices via RabbitMQ et Feign.

## Fonctionnalités principales
- **Enregistrement d’utilisateurs sur la blockchain** (endpoint `/bc/users/register`)
- **Vérification et gestion des paiements blockchain** (endpoint `/bc/payments/...`)
- **Lecture des soldes d’escrow**
- **Écoute et gestion d’événements blockchain**
- **Communication avec user-service et autres via Feign et RabbitMQ**
- **Gestion des smart contracts (RealEstateManager, Escrow, PropertyRegistry)**

## Structure
- `controller/` : Endpoints REST (blockchain, paiement, health, user)
- `service/` : Logique métier (utilisateur blockchain, paiement, vérification, events)
- `config/` : Configuration RabbitMQ, Web3j, etc.
- `dto/` : Objets de transfert (requêtes/réponses)
- `listener/` : Listeners d’événements blockchain

## Configuration
- `application.properties` : Web3j, adresses des contrats, RabbitMQ, services internes, port, logging
- Variables d’environnement supportées pour override (voir `application.properties`)

## Lancement local
1. **Prérequis** : Java 17+, Maven, accès à un nœud Ethereum (Sepolia), RabbitMQ
2. **Configurer** : Web3j, adresses des contrats, RabbitMQ, user-service dans `src/main/resources/application.properties`
3. **Build & Run** :
   ```bash
   mvn clean package
   java -jar target/BCback-0.0.1-SNAPSHOT.jar
   ```
4. **Port par défaut** : 8085

## Exemples de routes
- `/bc/users/register` (POST) : enregistrement utilisateur sur la blockchain
- `/bc/payments/{rentalId}/balance` (GET) : solde escrow
- `/bc/payments/{bookingId}/verify` (POST) : vérification paiement

## Dépendances principales
- Spring Boot (Web, Validation, AMQP, OpenFeign)
- Web3j (Ethereum)
- RabbitMQ
- Lombok
- BitcoinJ (si besoin)

---

Pour toute extension (ex : nouveaux contrats, nouveaux events, etc.), voir les services et listeners associés.
