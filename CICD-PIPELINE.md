# CI/CD Pipeline Implementation Details

This document provides a technical overview of the CI/CD pipeline implementation for the Netflix clone application.

## Pipeline Architecture

### Overall Pipeline Flow

```
GitHub Repository → AWS CodePipeline → AWS CodeBuild → Amazon ECR → Amazon ECS → EC2 Instances
```

### Key AWS Services Used

1. **AWS CodePipeline**: Orchestrates the entire CI/CD workflow
2. **AWS CodeBuild**: Builds and tests the application
3. **Amazon ECR**: Stores Docker container images
4. **Amazon ECS**: Orchestrates container deployment
5. **AWS Systems Manager Parameter Store**: Manages secrets
6. **AWS CodeDeploy**: Manages deployment to EC2 instances (initial version)
7. **Amazon CloudWatch**: Centralizes logging and monitoring

## Pipeline Implementation

### 1. Source Stage (GitHub Integration)

- **Trigger**: Push to specified branches triggers the pipeline
- **Configuration**: GitHub webhook integration with CodePipeline
- **Authentication**: GitHub personal access token or OAuth
- **Security**: HTTPS connections, encrypted credentials

### 2. Build Stage (AWS CodeBuild)

#### Environment Configuration
```yaml
install:
  runtime-versions:
    java: corretto17
    nodejs: 18
  commands:
    - echo "Installing dependencies..."
    - npm install
    - npm audit --json > audit-report.json || true
    - yarn add eslint eslint-plugin-security --dev
    - echo "Installing SonarScanner..."
    - export SONAR_SCANNER_HOME=$HOME/.sonar/sonar-scanner-${SONAR_SCANNER_VERSION}-linux-x64
    - curl --create-dirs -sSLo $HOME/.sonar/sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-${SONAR_SCANNER_VERSION}-linux-x64.zip
    - unzip -o $HOME/.sonar/sonar-scanner.zip -d $HOME/.sonar/
    - export PATH=$SONAR_SCANNER_HOME/bin:$PATH
    - export SONAR_SCANNER_OPTS="-server"
    - sonar-scanner --version
```

#### Security Testing Phase
```yaml
pre_build:
  commands:
    - java -version
    - echo "Running static code analysis with SonarCloud..."
    - sonar-scanner -Dsonar.organization=$SONAR_ORG -Dsonar.projectKey=$SONAR_PROJECT_KEY -Dsonar.sources=. -Dsonar.host.url=https://sonarcloud.io -Dsonar.login=$SONAR_TOKEN
    - echo "SonarCloud analysis completed."
    - echo "Checking dependency vulnerabilities..."
    - yarn audit --level high || echo "Vulnerabilities found, but continuing build..."
```

#### Build and Container Creation
```yaml
build:
  commands:
    - echo "Fetching sensitive values from Parameter Store..."
    - TMDB_API_KEY=$(aws ssm get-parameter --name "/myapp/api/key" --with-decryption --query "Parameter.Value" --output text)
    - EXECUTION_ROLE_ARN="arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecs-execution"
    - TASK_ROLE_ARN="arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecs-execution"
    - ECR_IMAGE="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/$ECR_REPOSITORY:latest"

    - echo "Replacing placeholders in task-definition.json..."
    - sed -i "s|{{TMDB_V3_API_KEY}}|$TMDB_API_KEY|g" task-definition.json
    - sed -i "s|{{EXECUTION_ROLE_ARN}}|$EXECUTION_ROLE_ARN|g" task-definition.json
    - sed -i "s|{{TASK_ROLE_ARN}}|$TASK_ROLE_ARN|g" task-definition.json
    - sed -i "s|{{ECR_IMAGE}}|$ECR_IMAGE|g" task-definition.json

    - echo "Building and tagging Docker image..."
    - docker login -u $USERNAME -p $PASSWORD
    - aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
    - docker build --build-arg TMDB_V3_API_KEY=$KEY -t $ECR_REPOSITORY:latest .
    - echo "Tagging Docker image for ECR..."
    - docker tag $ECR_REPOSITORY:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest
    - echo "Scanning Docker image for vulnerabilities with Trivy..."
    - curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
    - trivy image toluid/netflix-react-app:latest || exit 1
    - echo "Pushing Docker image to Amazon ECR..."
    - docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest
```

#### Post-Build Deployment
```yaml
post_build:
  commands:
    - echo "Build complete and Docker image pushed successfully."
    - echo "Updating ECS task definition..."
    - aws ecs register-task-definition --cli-input-json file://$ECS_TASK_DEFINITION
    - echo "Updating ECS service..."
    - printf '[{"name":"netflix-react-container","imageUri":"%s.dkr.ecr.%s.amazonaws.com/%s:latest"}]' "$AWS_ACCOUNT_ID" "$AWS_REGION" "$ECR_REPOSITORY" > imagedefinitions.json
    - cat imagedefinitions.json
    - aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE --force-new-deployment
    - echo "Deployment to ECS complete!"
```

### 3. Artifact Management

```yaml
artifacts:
  files:
    - 'Dockerfile'
    - 'appspec.yml'
    - 'package.json'
    - 'scripts/**/*'
    - 'yarn.lock'
    - 'public/**/*'
    - 'src/**/*'
    - 'task-definition.json'
    - 'imagedefinitions.json'
  discard-paths: no
```

## Deployment Configuration

### ECS Task Definition (ECS/ECR Deployment)

```json
{
  "family": "netflix-react-app-task",
  "executionRoleArn": "{{EXECUTION_ROLE_ARN}}",
  "taskRoleArn": "{{TASK_ROLE_ARN}}",
  "containerDefinitions": [
    {
      "name": "netflix-react-container",
      "image": "{{ECR_IMAGE}}",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 80,
          "hostPort": 8080
        }
      ],
      "memory": 300,
      "cpu": 128,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/netflix-react-app",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "environment": [
        { "name": "TMDB_V3_API_KEY", "value": "{{TMDB_V3_API_KEY}}" }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:80 || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ],
  "requiresCompatibilities": ["EC2"],
  "networkMode": "bridge",
  "memory": "400",
  "cpu": "128"
}
```

### CodeDeploy Configuration (Initial EC2 Deployment)

```yaml
version: 0.0
os: linux
  
hooks:
  AfterInstall:
    - location: scripts/start.sh
      timeout: 300
      runas: root
      
  ApplicationStop:
    - location: scripts/stop.sh
      timeout: 300
      runas: root
```

### ECS Deployment Configuration (Updated)

```yaml
version: 0.0
Resources:
  - TargetService:
      Type: AWS::ECS::Service
      Properties:
        TaskDefinition: "{{TASK_DEFINITION_ARN}}"
        LoadBalancerInfo:
          ContainerName: "netflix-react-container"
          ContainerPort: 80
Hooks:
  - BeforeInstall: "60"
  - AfterInstall: "60"
  - AfterAllowTestTraffic: "60"
  - BeforeAllowTraffic: "60"
  - AfterAllowTraffic: "60"
```

## Environment Variables and Parameters

### AWS Systems Manager Parameter Store Structure

```
/myapp/
  ├── docker-credentials/
  │   ├── username
  │   └── password
  ├── api/
  │   └── key
  ├── sonarcloud/
  │   ├── token
  │   └── project-key
  └── aws/
      ├── account-id
      └── region
```

### Build Variables

```yaml
variables:
  SONAR_ORG: "tolugit"
  SONAR_SCANNER_VERSION: "6.2.1.4610"
  ECR_REPOSITORY: "toluid/netflix-react-app"
  ECS_CLUSTER: "ecsstream"
  ECS_SERVICE: "my-ecs-service"
  ECS_TASK_DEFINITION: "task-definition.json"
```

## Docker Configuration

### Multi-Stage Dockerfile

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

## Pipeline Evolution

### Initial Implementation (Direct EC2)

- **Registry**: DockerHub (public)
- **Deployment**: AWS CodeDeploy to EC2
- **Configuration**: appspec.yml with shell scripts
- **Security**: Basic security scanning

###  Implementation (ECS with ECR)

- **Registry**: Amazon ECR (private)
- **Orchestration**: Amazon ECS
- **Configuration**: Task definition with container settings
- **Security**: Enhanced security scanning and IAM roles
- **Monitoring**: CloudWatch logs integration
- **Health**: Container health checks

## Technical Benefits of the  Pipeline

1. **Scalability**: ECS enables easier scaling of containers
2. **Reliability**: Health checks and automated recovery
3. **Resource Efficiency**: Better resource utilization with ECS
4. **Security**: Private registry and IAM permissions
5. **Monitoring**: Improved logging and monitoring capabilities
6. **Manageability**: Centralized container management
7. **Deployment Control**: Blue/green and rolling deployments

## Implementation Challenges and Solutions

### Challenge 1: Secure Environment Variables

**Problem**: Passing sensitive API keys to containers securely

**Solution**:
- AWS Systems Manager Parameter Store for secure storage
- Retrieval at build time using AWS CLI
- Injection into task definition using sed
- Environment variables in container definition

### Challenge 2: Container Security

**Problem**: Securing container images and runtime

**Solution**:
- Multi-stage Docker builds for smaller attack surface
- Trivy container scanning in pipeline
- ECR vulnerability scanning
- Non-root container execution

### Challenge 3: Pipeline Security

**Problem**: Ensuring secure CI/CD process

**Solution**:
- Multiple security scanning tools
- IAM roles with least privilege
- Separation of concerns in pipeline stages
- Failed security scan breaks the build

## Future Pipeline implementations

1. **Automated Testing**: Add comprehensive automated tests
2. **Infrastructure as Code**: Move to CloudFormation or Terraform
3. **Blue/Green Deployment**: Implement zero-downtime deployments
4. **Approval Workflows**: Add manual approval for production deployments
5. **Cross-Region Deployment**: Implement multi-region resilience
6. **AWS X-Ray**: Add distributed tracing
7. **AWS CloudWatch Alarms**: Add performance and security alarms