# Infrastructure Changes

## Major Changes from Previous Version

![ECS-ECR2 signed Untitled Diagram drawio](https://github.com/user-attachments/assets/c6500077-ffb7-464d-89e3-bda5d5286957)

### 1. CI/CD Pipeline Enhancement
- **Previous**: Basic CI/CD with GitHub and Docker
- **Current**: Full AWS CI/CD Integration
  ```
  GitHub → CodePipeline → CodeBuild → ECR → ECS → EC2
  ```
  - CodePipeline orchestrates the entire deployment flow
  - CodeBuild handles building and testing

### 2. IAM Roles & Permissions
Added two and modified one IAM roles:
1. **ECS Execution Role**
   - Permissions for ECS tasks
   - Access to:
     - ECR pull images
     - CloudWatch logs
     - Systems Manager parameters
   ```json
   "executionRoleArn": "arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecs-execution"
   ```

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

### 3. Container Registry Change
- **Previous**: DockerHub (`toluid/netflix-react-app:latest`)
- **Current**: Amazon ECR
  ```
  ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:latest
  ```

### 4. Security Enhancements
- SonarCloud integration
- NPM Audit scanning
- Trivy container scanning
- Systems Manager Parameter Store
- IAM role-based access control

### 5. Task Definition Updates
```json
{
  "family": "netflix-react-app-task",
  "executionRoleArn": "arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecs-execution",
  "taskRoleArn": "arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecs-execution",
  "containerDefinitions": [{
    "name": "netflix-react-container",
    "image": "{{ECR_IMAGE}}",
    "memory": 300,
    "cpu": 128,
    "essential": true,
    "portMappings": [{
      "containerPort": 80,
      "hostPort": 8080
    }],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/netflix-react-app",
        "awslogs-region": "us-east-1",
        "awslogs-stream-prefix": "ecs"
      }
    }
  }],
  "requiresCompatibilities": ["EC2"]
}
```
