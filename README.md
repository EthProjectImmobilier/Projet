<div align="center">

# 🏠 RentChain
## Plateforme Décentralisée de Location Immobilière

> **Une DApp Web3 complète pour la location immobilière sans intermédiaire, bâtie sur Ethereum Sepolia**

<br/>

[![Ethereum Sepolia](https://img.shields.io/badge/Ethereum-Sepolia-blue?style=for-the-badge&logo=ethereum)](https://sepolia.etherscan.io/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=for-the-badge&logo=spring-boot)](https://spring.io/projects/spring-boot)
[![Solidity 0.8.28](https://img.shields.io/badge/Solidity-0.8.28-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)

<br/><br/>

</div>

---

## 📋 Résumé du Projet

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; margin-bottom: 30px;">

**RentChain** est une plateforme Web3 décentralisée de location immobilière, inspirée d'Airbnb, construite sur la blockchain Ethereum (Sepolia testnet). Le projet démontre l'intégration complète de technologies modernes :

</div>

<table>
<tr>
<td width="50%">

**⛓️ Blockchain**
Smart contracts Solidity pour transactions transparentes et sécurisées

</td>
<td width="50%">

**🔧 Backend**
Architecture microservices Spring Boot avec 6 services indépendants

</td>
</tr>
<tr>
<td width="50%">

**🎨 Frontend**
Interface React 19 moderne avec intégration MetaMask

</td>
<td width="50%">

**🤖 Intelligence Artificielle**
Modèles ML pour recommandations et tarification dynamique

</td>
</tr>
<tr>
<td colspan="2" style="text-align: center;">

**☁️ DEVOPS**
Déploiement conteneurisé avec Docker, Kubernetes,Jenkins CI/CD

</td>
</tr>
</table>

### 👥 Rôles des Utilisateurs

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">

<div style="background: #f0f4ff; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea;">
<strong>👤 Visiteur</strong><br/>
Navigation, recherche et consultation des propriétés
</div>

<div style="background: #f0f4ff; padding: 15px; border-radius: 8px; border-left: 4px solid #764ba2;">
<strong>🏠 Locataire</strong><br/>
Réservation sécurisée, paiement via MetaMask
</div>

<div style="background: #fff4f0; padding: 15px; border-radius: 8px; border-left: 4px solid #fa8231;">
<strong>🏢 Propriétaire</strong><br/>
Création d'annonces, gestion, suivi revenus
</div>

<div style="background: #f0fff4; padding: 15px; border-radius: 8px; border-left: 4px solid #27ae60;">
<strong>⚙️ Administrateur</strong><br/>
Modération, gestion utilisateurs, analytics
</div>

</div>

---

## ✨ Fonctionnalités Principales

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">

<div style="background: #fff3e0; padding: 20px; border-radius: 10px; border-top: 4px solid #ff9800;">
<h3>🔎 Recherche Avancée</h3>
Filtres temps réel (prix, dates, localisation), carte interactive, favoris
</div>

<div style="background: #e3f2fd; padding: 20px; border-radius: 10px; border-top: 4px solid #2196f3;">
<h3>💳 Paiements Web3</h3>
MetaMask + smart contracts avec escrow sécurisé
</div>

<div style="background: #f3e5f5; padding: 20px; border-radius: 10px; border-top: 4px solid #9c27b0;">
<h3>🏢 Gestion d'Annonces</h3>
Création, édition, calendrier, suivi revenus
</div>

<div style="background: #e0f2f1; padding: 20px; border-radius: 10px; border-top: 4px solid #009688;">
<h3>⚡ Communications Temps Réel</h3>
RabbitMQ asynchrone, emails SMTP, notifications
</div>

<div style="background: #f1f8e9; padding: 20px; border-radius: 10px; border-top: 4px solid #8bc34a;">
<h3>🤖 IA Intégrée</h3>
Recommandations, prévisions XGBoost, risk scoring
</div>

<div style="background: #fce4ec; padding: 20px; border-radius: 10px; border-top: 4px solid #e91e63;">
<h3>🔐 Sécurité Avancée</h3>
JWT, OpenZeppelin, ReentrancyGuard, validations
</div>

</div>

---

## 🏗️ Architecture Système

L'application repose sur une **architecture microservices orientée événements** :

```
┌──────────────────────────────────┐
│   Utilisateur (Web/MetaMask)     │
└───────┬──────────────────────────┘
        │ HTTPS/REST API
        ⇅
┌──────────────────────────────────┐
│   Frontend (React 19/TypeScript)  │
│   - Recherche propriétés         │
│   - Réservation & paiement       │
│   - Dashboards                   │
│   - IA & Blockchain              │
└───────┬──────────────────────────┘
        │ REST/gRPC
        ⇅
┌──────────────────────────────────┐
│  API Gateway (Spring Cloud)      │
│  - Routage dynamique             │
│  - Authentification JWT          │
│  - Configuration centralisée     │
└───────┬──────────────────────────┘
        │
    ┌───┴──────────┬──────────┬─────────┐
    │              │          │         │
    ⇅              ⇅          ⇅         ⇅
┌────────┐    ┌────────┐  ┌────────┐ ┌─────────┐
│ User   │    │Property│  │Booking │ │Blockchain
│Service │    │Service │  │Service │ │Layer
│(8081)  │    │(8082)  │  │(8083)  │ │(8085)
└────────┘    └────────┘  └────────┘ └─────────┘

        ⇅                       ⇅
   ┌──────────────┐    ┌──────────────┐
   │Notification  │    │IA Service    │
   │Service       │    │(FastAPI)     │
   │(8086)        │    │(8000)        │
   └──────────────┘    └──────────────┘

        ⇅ RabbitMQ Async

        ┌──────────────────────────┐
        │  Smart Contracts         │
        │  (Solidity / Sepolia)    │
        └──────────────────────────┘
```

---

## 🛠️ Stack Technologique

| Domaine | Technologies |
|---------|---|
| **Backend** | ![Java](https://img.shields.io/badge/Java%2021-ED8B00?style=flat-square&logo=java) ![Spring Boot 3](https://img.shields.io/badge/Spring%20Boot%203-6DB33F?style=flat-square&logo=spring) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql) ![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=flat-square&logo=rabbitmq) ![Web3j](https://img.shields.io/badge/Web3j-blue?style=flat-square) |
| **Frontend** | ![React 19](https://img.shields.io/badge/React%2019-61DAFB?style=flat-square&logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=flat-square&logo=tailwindcss) ![ethers.js](https://img.shields.io/badge/ethers.js-8B3885?style=flat-square&logo=ethereum) |
| **Blockchain** | ![Solidity](https://img.shields.io/badge/Solidity%200.8.28-363636?style=flat-square&logo=solidity) ![Hardhat](https://img.shields.io/badge/Hardhat-yellow?style=flat-square) ![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-4AB0F7?style=flat-square) ![Sepolia](https://img.shields.io/badge/Ethereum%20Sepolia-blue?style=flat-square&logo=ethereum) |
| **IA/ML** | ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi) ![scikit--learn](https://img.shields.io/badge/scikit--learn-F7931E?style=flat-square&logo=scikit-learn) ![XGBoost](https://img.shields.io/badge/XGBoost-orange?style=flat-square) ![Python](https://img.shields.io/badge/Python%203.10-3776AB?style=flat-square&logo=python) |
| **DevOps/Cloud** | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker) ![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=flat-square&logo=kubernetes) ![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=flat-square&logo=jenkins) ![Terraform](https://img.shields.io/badge/Terraform-7B42BC?style=flat-square&logo=terraform) ![AWS](https://img.shields.io/badge/AWS-FF9900?style=flat-square&logo=amazonaws) |

---
## Les rôles et le responsable 


| Role       | Responsable          | Documentation |
|------------|----------------------|---------------|
| Backend    | Marouane Faik        | [README](./Backend/Backend.md)      |
| Frontend   | Omar Gennone         | [README](./rentChain/README.md)         |
| Blockchain | Chikh Imane          | [README](./Block-chain/test1.md)          |
| DevOps     | Salah Eddine Khazri  | [README](./K8s/DevOps.md)          |
| Cloud      | Youssef El Ajbari    | [README](./K8s/Cloud.md)          |
| IA         | Marouane Faik        | [README](./ia_service/README.md)          |