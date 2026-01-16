# Cloud Infrastructure

## Overview

The infrastructure is deployed on **AWS** using **Infrastructure as Code (IaC)**, and applications are containerized with **Docker** and orchestrated using **Kubernetes**.

---

## Cloud Architecture

The cloud layer follows a **cloud-native microservices architecture**:

* **AWS** as the cloud provider
* **Docker** for containerization
* **Kubernetes** for orchestration
* **Amazon S3** for media storage (property images, documents)
* **Amazon RDS**

---

## AWS Services Used

### Core Services

* **EC2** – Compute resources for Kubernetes worker nodes
* **EKS (or self-managed Kubernetes)** – Container orchestration
* **VPC** – Network isolation and security
* **IAM** – Role-based access control and permissions
* **S3** – Object storage for real estate media assets
* **Elastic Load Balancer (ALB/NLB)** – Traffic distribution

---

## Infrastructure

All cloud resources are provisioned to ensure:

* Reproducibility
* Version control
* Easy environment recreation

### Responsibilities

* Create and configure VPC, subnets, and routing
* Provision EC2 instances or EKS cluster
* Configure IAM roles and policies
* Provision S3 buckets with secure access policies
* Output infrastructure variables for Kubernetes integration

---

## Kubernetes Integration

The application is deployed on Kubernetes to ensure:

* Scalability
* Fault tolerance
* Rolling updates

### Kubernetes Responsibilities

* Deploy Spring Boot microservices
* Deploy Angular frontend
* Manage service discovery and internal networking
* Expose services via Ingress / LoadBalancer

### Kubernetes Resources

* **Deployments** – Application containers
* **Services** – Internal communication
* **Ingress** – External access
* **ConfigMaps & Secrets** – Configuration management

---

## Storage Strategy

### Amazon S3

Used for storing:

* Property images
* Rental documents
* Metadata related to listings

---

## Security

Cloud security is enforced through:

* **IAM Roles & Policies** (least privilege principle)
* **Private Subnets** for backend services
* **Security Groups** for traffic filtering
* **Secrets management** via Kubernetes Secrets
* **HTTPS termination** at Load Balancer level

---

## Monitoring & Observability

### Metrics Tracked

* Microservice health
* Request latency
* Resource usage (CPU, memory)
* Rental transaction metrics

---

## Cost Optimization

Cost efficiency is addressed by:

* Right-sizing EC2 instances
* Auto-scaling Kubernetes workloads
* S3 lifecycle rules
* Infrastructure modularization with Terraform

---

## Local Development (Cloud Simulation)

For local testing and development:

* **Minikube** is used instead of EKS
* **LocalStack** (optional) for AWS service emulation
