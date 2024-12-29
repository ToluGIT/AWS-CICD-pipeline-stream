# Stream app with Secure AWS CI/CD Pipeline

[![AWS](https://img.shields.io/badge/AWS-Pipeline-orange.svg)](https://aws.amazon.com/)
[![Security](https://img.shields.io/badge/Security-DevSecOps-blue.svg)](https://aws.amazon.com/security/)
[![React](https://img.shields.io/badge/React-Frontend-blue.svg)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![SonarCloud](https://img.shields.io/badge/Secure-SonarCloud-blue.svg)](https://sonarcloud.io/)

A stream application featuring a secure CI/CD pipeline built with AWS cloud-native services. This project demonstrates modern web development practices with DevSecOps implementation.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features & Tech Stack](#features--tech-stack)
3. [Prerequisites](#prerequisites)
4. [Local Development](#local-development)
5. [CI/CD Pipeline Setup](#cicd-pipeline-setup)
6. [Security Implementation](#security-implementation)
7. [Deployment Guide](#deployment-guide)
8. [Monitoring & Troubleshooting](#monitoring--troubleshooting)

## Project Overview

<p align="center">
  <img src="https://github.com/user-attachments/assets/668c1371-5e52-4499-9a2f-2a3b9c6788a0" alt="Architecture Diagram" width="800">
</p>

A fully functional Netflix clone with a secure CI/CD pipeline featuring:
- Enterprise-grade DevSecOps practices
- Multi-layer security controls
- Automated deployment process
- Continuous security monitoring

## Features & Tech Stack

### Security Features

#### Pre-commit Hooks
- Automatic secret scanning
- Code formatting verification
- Commit message validation

#### Code Analysis
- SonarCloud integration
- Static code analysis
- Code quality metrics
- Security vulnerability scanning

#### Container Security
- Trivy container scanning
- Base image security checks

#### AWS Security
- IAM roles with least privilege
- Parameter Store encryption
- VPC security groups

### Technical Stack
```yaml
Frontend:
  - React 18 with TypeScript
  - Material-UI v5
  - Redux Toolkit
  - React Router v6
  - Framer Motion
  - Video.js
  - Emotion/styled-components
  - Vite

DevOps:
  - AWS CodePipeline/CodeBuild/CodeDeploy
  - Docker
  - SonarCloud
  - Trivy
  - GitHub
  - npm audit
```

## Prerequisites

### Required Accounts
- AWS Account (with Appropriate access)
- GitHub Account
- Docker Hub Account
- SonarCloud Account
- TMDB API Account

### Development Tools
```bash
# Required Software
- Node.js 18.x
- Git
- Docker Desktop
- AWS CLI

# Access Keys
- TMDB API Key
- Docker Hub credentials
- SonarCloud token
- GitHub Secret token
```

## Local Development

1. **Clone & Setup**
   ```bash
   # Clone repository
   git clone https://github.com/ToluGIT/AWS-CICD-pipeline-stream.git
   cd AWS-CICD-pipeline-stream

   # Install dependencies
   yarn install

   # Configure environment
   cp .env.example .env
   ```

2. **Environment Configuration**
   ```env
   VITE_APP_TMDB_V3_API_KEY=your_api_key
   VITE_APP_API_ENDPOINT_URL=https://api.themoviedb.org/3
   ```

3. **Start Development Server**
   ```bash
   yarn dev
   ```

## CI/CD Pipeline Setup

### 1. AWS Parameter Store Setup
Navigate to AWS Systems Manager > Parameter Store and create:
```yaml
Secure Parameters:
  - /myapp/sonarcloud/token
  - /myapp/docker-credentials/username
  - /myapp/docker-credentials/password
  - /myapp/api/key

String Parameters:
  - /myapp/sonarcloud/project-key
```

<img width="829" alt="Screenshot 2024-12-29 at 13 17 18" src="https://github.com/user-attachments/assets/76d9d56a-8510-4141-aa9f-daa96d599321" />

### 2. CodeBuild Configuration

1. **Navigate to CodeBuild Console**

2. **Create Build Project**
   ```yaml
   Project Configuration:
     Name: Stream-app-build
     Source: GitHub (master branch)
     Environment:
       Type: MANAGED_IMAGE
       OS: Ubuntu
       Runtime: Standard
       Image: aws/codebuild/standard:7.0
     Buildspec: Use buildspec.yml
     Artifacts: Amazon S3
     Logs: CloudWatch
   ```

3. **Configure IAM Role**

   A default role will be created for the service role for CodeBuild. Modify it and add the inline policy to the existing role:
   
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Effect": "Allow",
               "Action": "ssm:GetParameters",
               "Resource": "arn:aws:ssm:*:aws_account_id:parameter/*"
           }
       ]
   }
   ```

<img width="885" alt="Screenshot 2024-12-29 at 12 40 17" src="https://github.com/user-attachments/assets/eae38285-e273-43b3-9acb-9fbdc4f36ed5" />

<img width="831" alt="Screenshot 2024-12-29 at 12 41 51" src="https://github.com/user-attachments/assets/e1f7b3b7-34ff-47bd-b277-c1aa2f577415" />

<img width="831" alt="Screenshot 2024-12-29 at 12 42 14" src="https://github.com/user-attachments/assets/63ba2877-226a-43cf-a220-ed400f5cd356" />

<img width="831" alt="Screenshot 2024-12-29 at 12 48 36" src="https://github.com/user-attachments/assets/1aa20af1-d215-4807-a613-11a731e139ad" />

<img width="831" alt="Screenshot 2024-12-29 at 12 48 53" src="https://github.com/user-attachments/assets/834e7c29-a28a-470c-b71e-b8649c31279d" />

<img width="831" alt="Screenshot 2024-12-29 at 12 52 35" src="https://github.com/user-attachments/assets/4ec79680-b460-4947-af6d-cf71fb02b65e" />

<img width="831" alt="Screenshot 2024-12-29 at 12 56 29" src="https://github.com/user-attachments/assets/23366900-ba2b-4d28-b73b-844a04a66ed6" />

<img width="1726" alt="Screenshot 2024-12-29 at 15 19 00" src="https://github.com/user-attachments/assets/b33352c8-2310-4424-a289-9a701708ba88" />

<img width="1726" alt="Screenshot 2024-12-29 at 15 28 22" src="https://github.com/user-attachments/assets/3daa509b-cd9b-45ea-ac49-9e86b8bff044" />

4. Test the build and verify it runs successfully review the build logs to see output from the build for npm audit, trivy and check sonar cloud for static analysis code output review
   
<img width="1316" alt="Screenshot 2024-12-29 at 18 29 01" src="https://github.com/user-attachments/assets/8a9834e7-27d2-4b6a-876c-52a541a1e904" />

<img width="1337" alt="Screenshot 2024-12-29 at 18 29 28" src="https://github.com/user-attachments/assets/995b0f6a-3d0c-4808-9cb8-8cd374998937" />

<img width="1725" alt="Screenshot 2024-12-29 at 15 51 36" src="https://github.com/user-attachments/assets/4a05eb3f-5944-4026-bf2e-4be6ec9fcdb0" />

<img width="1477" alt="Screenshot 2024-12-29 at 15 59 21" src="https://github.com/user-attachments/assets/8b344404-f8de-493a-8ec0-556bd254387a" />

<img width="1590" alt="Screenshot 2024-12-29 at 16 04 02" src="https://github.com/user-attachments/assets/f6946b80-3770-42c7-858c-f8629ebd8340" />

![image](https://github.com/user-attachments/assets/4996de2e-b4a6-4175-a214-38457aad1507)


### 3. EC2 Instance Setup

1. **Create Service Role**
   Required permissions:
   - AmazonEC2FullAccess
   - AmazonEC2RoleforAWSCodeDeploy
   - AmazonS3FullAccess
   - AWSCodeDeployFullAccess

2. **Launch EC2 Instance**
   - Type: t2.micro (minimum)
   - AMI: Amazon Linux 2 or Ubuntu
   - Security Group: Ports 80, 443, 22

3. **Configure User Data**

   For Amazon Linux:
   ```bash
   #!/bin/bash
   sudo yum -y update
   sudo yum install -y docker ruby wget
   sudo service docker start
   sudo usermod -aG docker ec2-user
   cd /home/ec2-user
   wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install
   sudo chmod +x ./install
   sudo ./install auto
   ```

   For Ubuntu:
   ```bash
   #!/bin/bash
   sudo apt update
   sudo install docker.io ruby-full
   cd /home/ubuntu
   wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install
   chmod +x ./install
   sudo ./install auto
   sudo service codedeploy-agent status
   ```

<img width="1151" alt="Screenshot 2024-12-29 at 16 18 25" src="https://github.com/user-attachments/assets/aa72f44d-1a54-4ab2-a43f-3133b497a6a7" />

<img width="1124" alt="Screenshot 2024-12-29 at 16 19 57" src="https://github.com/user-attachments/assets/129767bd-26a5-4a6a-96ff-f16d763c9adb" />

<img width="1727" alt="Screenshot 2024-12-29 at 18 44 28" src="https://github.com/user-attachments/assets/c747dbf1-45ad-4570-90ed-cbef3a390a5e" />

<img width="1149" alt="Screenshot 2024-12-29 at 16 31 57" src="https://github.com/user-attachments/assets/61ffc8f5-d3bf-4114-9524-afc5fde1edd6" />

<img width="1149" alt="Screenshot 2024-12-29 at 16 32 07" src="https://github.com/user-attachments/assets/9be4a179-afdd-4328-950b-2eb95154473b" />

<img width="1490" alt="Screenshot 2024-12-29 at 17 33 16" src="https://github.com/user-attachments/assets/35635f47-1eaa-4dba-a5bc-38619fb98184" />


### 4. CodeDeploy Setup

Navigate to CodeDeploy console and configure service role with these AWS managed policies:

1. AmazonEC2FullAccess
2. AmazonEC2RoleforAWSCodeDeploy
3. AmazonS3FullAccess
4. AWSCodeDeployeFullAccess
5. AWSCodeDeployRole
6. AmazonEC2RoleforAWSCodeDeployLimitaccesstoS3

```yaml
Application:
  Name: Stream-app-deploy
  Platform: EC2/On-premises
  
Deployment Group:
  Name: netflix-clone-deployment
  Type: In-place
  Configuration: Amazon EC2 instances
  Tag: Name: <name assigned to Ec2 instances>
```

<img width="1644" alt="Screenshot 2024-12-29 at 16 11 14" src="https://github.com/user-attachments/assets/340a9a35-512c-4a9b-8a88-0cff8b442dc3" />

<img width="871" alt="Screenshot 2024-12-29 at 16 26 29" src="https://github.com/user-attachments/assets/2fe7f75f-a2bc-4247-bef3-32bb88a03b1a" />

<img width="804" alt="Screenshot 2024-12-29 at 16 40 49" src="https://github.com/user-attachments/assets/0b28ae5d-a206-4ecf-aaab-5c2fa68b9dcc" />

<img width="804" alt="Screenshot 2024-12-29 at 16 37 41" src="https://github.com/user-attachments/assets/92f0be29-58d2-45a3-8c3e-a4aac5d4f1a3" />


### 5. CodePipeline Configuration

Navigate to CodePipeline console 

```yaml
Pipeline:
  Name: Stream-app
  Stages:
    Source:
      Provider: GitHub
      Detection: Webhooks
    Build:
      Provider: CodeBuild
      Project: Stream-app-build
    Deploy:
      Provider: CodeDeploy
      Application: Stream-app-deploy
```

<img width="1489" alt="Screenshot 2024-12-17 at 19 17 28" src="https://github.com/user-attachments/assets/94a7da82-ea9b-4ef7-add3-ab20a0862735" />
<img width="1726" alt="Screenshot 2024-12-29 at 15 32 24" src="https://github.com/user-attachments/assets/e93a7c22-9240-4aa4-a1a2-d6b90ab18b44" />
<img width="1588" alt="Screenshot 2024-12-29 at 15 33 57" src="https://github.com/user-attachments/assets/6f98d389-e2a9-4c52-8997-0d269a8614bb" />
<img width="1479" alt="Screenshot 2024-12-29 at 18 32 33" src="https://github.com/user-attachments/assets/a8d6d400-0df0-4d6c-ba58-34502a853bf5" />

<img width="1728" alt="Screenshot 2024-12-17 at 19 05 43" src="https://github.com/user-attachments/assets/18cab4f9-d727-4734-a42d-944d4bbf00ad" />



## Security Implementation

### 1. Pre-commit Setup
```bash
# Install and configure
pip install pre-commit
pre-commit install
```

### 2. SonarCloud Configuration
```properties
sonar.projectKey=${SONAR_PROJECT_KEY}
sonar.organization=your-org
sonar.sources=src
sonar.tests=src/__tests__
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

### 3. Trivy Scanner
```bash
# Install Trivy
sudo apt-get install trivy             # Ubuntu

# Scan images
trivy image toluid/netflix-react-app:latest
```

## Deployment Guide

### Docker Deployment
```bash
# Build and run
docker build -t netflix .
docker run -p 8080:80 netflix
```

### Pipeline Deployment
1. Push to GitHub
2. Monitor AWS Console
3. Verify EC2 deployment
   
   Application is automatically deployed to EC2 through CodeDeploy
   Uses the scripts in /scripts directory for start/stop operations

   ### Scripts
   
   1. scripts/start.sh: Starts the application container
   2. scripts/stop.sh: Stops and removes the container

## Monitoring & Troubleshooting

### Common Issues
1. Build Failures
   - Check CodeBuild logs
   - Verify parameter store values
   - Review Docker build process

2. Deployment Failures
   - Verify EC2 instance tags
   - Check CodeDeploy agent status
   - Review instance permissions

### Quick Commands
```bash
# Check deployments
sudo service codedeploy-agent status
aws deploy get-deployment --deployment-id <id>

# View logs
docker logs netflix

# Check EC2 tags
aws ec2 describe-tags
```
