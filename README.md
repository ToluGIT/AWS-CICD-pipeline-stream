# AWS DevSecOps Pipeline for Netflix Clone Application

## Project Overview

This project demonstrates the implementation of secure CI/CD pipelines and infrastructure on AWS. The application is a Netflix-like streaming platform with a modern deployment pipeline that incorporates security at every stage of the software development lifecycle.

### Project Highlights

- **DevSecOps Implementation**: Security integrated throughout the development, build, and deployment process
- **CI/CD Pipeline**: Fully automated delivery pipeline using AWS CodePipeline, CodeBuild, and CodeDeploy
- **Infrastructure Upgrade**: From direct EC2 deployment to ECS with EC2 architecture
- **Container Security**: Multi-layered container security with scanning, hardening, and orchestration
- **IAM Security**: Principle of least privilege with role-based access control
- **Secret Management**: Secure handling of sensitive information using AWS Systems Manager Parameter Store
- **Security Scanning**: Integration of multiple security tools (SonarCloud, npm audit, Trivy)
- **Logging & Monitoring**: Comprehensive logging with CloudWatch integration

## Application Details

The Netflix clone application is a modern web application built with:

- **Frontend**: React 18, TypeScript, Material UI
- **State Management**: Redux Toolkit
- **Video Playback**: Video.js with YouTube integration
- **Container Runtime**: NGINX serving static content
- **API Integration**: The Movie Database (TMDB) API for content

### Key Application Features

- Netflix-like user interface with responsive design
- Video playback functionality
- Content browsing by genre
- Search capabilities
- Detail views for media content
- Animations and transitions

## Project Upgrade: Two Deployment Architectures

The project demonstrates this through two distinct deployment architectures, each with progressively security controls.

### Architecture 1: Direct EC2 Deployment (Master Branch)

The initial architecture deploys the containerized application directly to EC2 instances:

```
GitHub → CodePipeline → CodeBuild → DockerHub → CodeDeploy → EC2
```

**Key Security Features:**
- Static code analysis with SonarCloud
- Dependency scanning with npm/yarn audit
- Container vulnerability scanning with Trivy
- Secret management with AWS Systems Manager Parameter Store
- Basic IAM roles for AWS services

### Architecture 2: ECS with EC2 Deployment (Patch-2 Branch)

The architecture uses Amazon ECS for container orchestration:

```
GitHub → CodePipeline → CodeBuild → Amazon ECR → Amazon ECS → EC2 Cluster
```

**Enhanced Security Features:**
- Private container registry with Amazon ECR
- ECS task definitions with security configurations
- Enhanced IAM roles with principle of least privilege
- Container health checks and automated recovery
- CloudWatch logging integration
- Bridge network mode for container isolation
- Non-root container execution

## CI/CD Pipeline Implementation

### Build & Security Testing Phase

The build process implemented in AWS CodeBuild includes:

**Security Scanning:**
- SonarCloud for static code analysis
- npm/yarn audit for dependency vulnerability scanning
- eslint-plugin-security for security anti-pattern detection
- Trivy for container vulnerability assessment

**Container Build & Security:**
- Multi-stage Docker builds
- Container vulnerability scanning
- Private registry integration

## Security Features & Best Practices

### Secure Secret Management

All sensitive information is stored securely in AWS Systems Manager Parameter Store:
```yaml
parameter-store:
  USERNAME: /myapp/docker-credentials/username
  PASSWORD: /myapp/docker-credentials/password
  KEY: /myapp/api/key
  SONAR_TOKEN: /myapp/sonarcloud/token
  SONAR_PROJECT_KEY: /myapp/sonarcloud/project-key
```

### Container Security Best Practices

The project implements container security best practices including:

**Multi-stage Docker Builds:**
```dockerfile
FROM node:18.18.0-alpine as builder
WORKDIR /app
# Build stage commands...

FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html
# Runtime stage commands...
```

**Container Health Checks:**
```json
"healthCheck": {
  "command": ["CMD-SHELL", "curl -f http://localhost:80 || exit 1"],
  "interval": 30,
  "timeout": 5,
  "retries": 3,
  "startPeriod": 60
}
```

### IAM Security & Role-Based Access

Implementation of IAM roles with least privilege principle:
```json
"executionRoleArn": "arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecs-execution",
"taskRoleArn": "arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecs-execution"
```

### Logging & Monitoring

CloudWatch integration for centralized logging:
```json
"logConfiguration": {
  "logDriver": "awslogs",
  "options": {
    "awslogs-group": "/ecs/netflix-react-app",
    "awslogs-region": "us-east-1",
    "awslogs-stream-prefix": "ecs"
  }
}
```

## Key DevSecOps Principles Demonstrated

1. **Shift-Left Security**: Security integrated from the beginning of the development process
2. **Defense in Depth**: Multiple layers of security controls
3. **Automation**: Fully automated security scanning and deployment
4. **Infrastructure as Code**: Infrastructure defined in version-controlled configuration files
5. **Least Privilege**: Fine-grained access control with role-based permissions
6. **Continuous Security Monitoring**: Logging and health checks for ongoing security awareness
7. **Secure Configuration**: Hardened container configurations and network security

## Infrastructure Changes - ECS with EC2 and ECR

![ECS-ECR2 signed Untitled Diagram drawio](https://github.com/user-attachments/assets/c6500077-ffb7-464d-89e3-bda5d5286957)

### Major Changes from Previous Version

#### 1. Deployment Infrastructure
  - Previous: Direct EC2 deployment with Docker
  - Current
      - ECS (Elastic Container Service) with EC2 launch type
      - Uses task definitions for container configuration
      - Implements ECS service for management
      - Bridge network mode for containers

#### 2. CI/CD Pipeline Enhancement
  ```
  GitHub → CodePipeline → CodeBuild → ECR → ECS → EC2
  ```

#### 3. IAM Roles & Permissions
Added two and modified one IAM roles:
1. **ECS Execution Role**
   - Permissions for ECS tasks
   - Access to:
     - ECR pull images
     - CloudWatch logs
     - Systems Manager parameters

2. **EC2ForECSDeploy Role**
   - Allows EC2 instances to:
     - Register with ECS cluster
     - Pull container images
     - Write logs
     - Access required AWS services

3. **CodeBuild Service Role** 
   - Permissions modified:
     - S3 artifact access
     - ECR push/pull
     - Parameter Store read
     - CloudWatch logs

#### 4. Container Registry Change
- **Previous**: DockerHub (`toluid/netflix-react-app:latest`)
- **Current**: Amazon ECR
  ```
  ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:latest
  ```

#### 5. Security Enhancements
- SonarCloud integration
- NPM Audit scanning
- Trivy container scanning
- Systems Manager Parameter Store
- IAM role-based access control

## Note
All core application features remain the same. Changes only affect deployment and infrastructure.