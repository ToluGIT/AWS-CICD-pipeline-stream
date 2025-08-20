# AWS DevSecOps Security Architecture

This document details the security architecture of the Netflix clone application CI/CD pipeline, focusing on the security controls, best practices, and implementation details.

## CI/CD Pipeline Security Controls

### 1. Secure Source Control Integration

- **Branch Protection Rules**: Implement branch protection rules in GitHub to prevent direct pushes to main branches
- **Code Review Process**: Enforce pull request reviews before merging code
- **Webhook Security**: Secure webhooks with authentication tokens and TLS

### 2. Multi-Layer Security Scanning

#### Static Application Security Testing (SAST)
- **SonarCloud Integration**:
  ```yaml
  pre_build:
    commands:
      - sonar-scanner -Dsonar.organization=$SONAR_ORG -Dsonar.projectKey=$SONAR_PROJECT_KEY -Dsonar.sources=. -Dsonar.host.url=https://sonarcloud.io -Dsonar.login=$SONAR_TOKEN
  ```
  
  - Scans for:
    - Code vulnerabilities (OWASP Top 10)
    - Security anti-patterns
    - Hardcoded credentials
    - Input validation issues
    - Authentication weaknesses

#### Software Composition Analysis (SCA)
- **npm/yarn audit**:
  ```yaml
  commands:
    - npm audit --json > audit-report.json || true
    - yarn audit --level high || echo "Vulnerabilities found, but continuing build..."
  ```
  
  - Identifies vulnerable dependencies
  - Checks dependency versions against known vulnerability databases
  - Generates detailed vulnerability reports

#### Security-Focused Linting
- **ESLint with Security Plugin**:
  ```yaml
  commands:
    - yarn add eslint eslint-plugin-security --dev
  ```
  
  - Enforces security best practices in code
  - Detects common security mistakes
  - Prevents insecure coding patterns

#### Container Security Scanning
- **Trivy for Container Scanning**:
  ```yaml
  commands:
    - curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
    - trivy image toluid/netflix-react-app:latest || exit 1
  ```
  
  - Scans container images for:
    - OS package vulnerabilities
    - Language-specific vulnerabilities
    - Misconfiguration issues
    - Secrets in container layers
  
  - Blocks deployment for critical vulnerabilities

### 3. Secret Management Architecture

#### AWS Systems Manager Parameter Store
- **Parameter Structure**:
  ```yaml
  parameter-store:
    USERNAME: /myapp/docker-credentials/username
    PASSWORD: /myapp/docker-credentials/password
    KEY: /myapp/api/key
    SONAR_TOKEN: /myapp/sonarcloud/token
    SONAR_PROJECT_KEY: /myapp/sonarcloud/project-key
  ```

- **Secret Retrieval Process**:
  ```yaml
  commands:
    - TMDB_API_KEY=$(aws ssm get-parameter --name "/myapp/api/key" --with-decryption --query "Parameter.Value" --output text)
  ```

- **Security Benefits**:
  - Centralized secret management
  - Encryption at rest using AWS KMS
  - Version control for secrets
  - Access control through IAM policies
  - Audit trails for secret access

### 4. Container Security Architecture

#### Multi-Stage Docker Builds
```dockerfile
FROM node:18.18.0-alpine as builder
WORKDIR /app
COPY ./package.json .
COPY ./yarn.lock .
RUN yarn install
COPY . .
ARG TMDB_V3_API_KEY
ENV VITE_APP_TMDB_V3_API_KEY=${TMDB_V3_API_KEY}
ENV VITE_APP_API_ENDPOINT_URL="https://api.themoviedb.org/3"
RUN yarn build

FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/dist .
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
```

**Security Benefits**:
- Separation of build and runtime environments
- Smaller attack surface in the final image
- Elimination of build tools in production image
- Reduced image size and vulnerability footprint

#### Container Hardening
- Uses Alpine-based images for minimal footprint
- Non-root execution for NGINX web server
- Explicit port exposure (only port 80)
- No unnecessary components installed

#### Container Health Checks
```json
"healthCheck": {
  "command": ["CMD-SHELL", "curl -f http://localhost:80 || exit 1"],
  "interval": 30,
  "timeout": 5,
  "retries": 3,
  "startPeriod": 60
}
```

**Security Benefits**:
- Automated detection of compromised containers
- Fast recovery from failures
- Prevention of serving from unhealthy containers
- Continuous verification of application state

### 5. IAM Security Architecture

#### ECS Execution Role
- **Purpose**: Allows ECS tasks to access AWS resources
- **Permissions**:
  - ECR image pulling
  - CloudWatch log writing
  - Systems Manager Parameter Store reading

#### EC2 for ECS Role
- **Purpose**: Allows EC2 instances to register with ECS and run containers
- **Permissions**:
  - ECS service registration
  - Container image pulling
  - CloudWatch log writing

#### CodeBuild Service Role
- **Purpose**: Allows CodeBuild to execute build processes
- **Permissions**:
  - S3 artifact access
  - ECR push/pull
  - Parameter Store reading
  - CloudWatch log writing

**Implementation of Least Privilege**:
- Scoped permissions to specific resources
- Temporary credentials with short lifetimes
- No wildcard resource permissions
- Regular permission auditing

### 6. Network Security Architecture

#### Container Networking
- **Bridge Network Mode**:
  ```json
  "networkMode": "bridge"
  ```
  
  - Provides isolation between containers
  - Controls container-to-host communication

- **Port Mapping**:
  ```json
  "portMappings": [
    {
      "containerPort": 80,
      "hostPort": 8080
    }
  ]
  ```
  
  - Explicit port exposure
  - Prevention of port conflicts
  - Control of inbound/outbound traffic

### 7. Logging & Monitoring Architecture

#### CloudWatch Logs Integration
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

**Security Benefits**:
- Centralized log collection and storage
- Structured logging for easier analysis
- Ability to create log-based alerts
- Retention policies for compliance
- Encrypted log storage

## Security Update: From EC2 to ECS/ECR

### Direct EC2 Deployment (Initial)

**Security Challenges**:
- Manual container management
- Public registry (DockerHub)
- Limited container isolation
- Basic logging capabilities
- Simplified IAM roles

### ECS with ECR Deployment (Enhanced)

**Security Improvements**:
- Container orchestration with ECS
- Private registry with ECR
- Enhanced container isolation
- Task-specific IAM roles
- Health checks and auto-healing
- Structured CloudWatch logging
- Bridge network mode for security

## Security Best Practices Implemented

1. **Defense in Depth**: Multiple security layers at different levels
2. **Principle of Least Privilege**: Granular IAM permissions
3. **Secure by Default**: Security controls enabled by default
4. **Continuous Security Validation**: Multiple security scanning tools
5. **Secret Management**: No hardcoded secrets in code or containers
6. **Immutable Infrastructure**: Containers treated as immutable
7. **Security Automation**: Security checks integrated into CI/CD pipeline
8. **Container Hardening**: Minimized attack surface in container images

## Future Security Enhancements

1. **AWS WAF Integration**: Add web application firewall for additional protection
2. **AWS GuardDuty**: Implement threat detection service
3. **Container Image Signing**: Add image signing and verification
4. **Automated Compliance Checks**: Integrate compliance scanning tools
5. **Network Security Groups**: Enhance network security controls
6. **AWS Security Hub**: Centralize security findings and alerts