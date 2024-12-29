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

<img width="1651" alt="Screenshot 2024-12-17 at 18 53 13" src="https://github.com/user-attachments/assets/2f060802-63ff-4c77-b454-cbe41cc4224d" />

<img width="923" alt="Screenshot 2024-12-17 at 19 00 49" src="https://github.com/user-attachments/assets/1ad51603-e88d-4228-b5ac-0ce54f6a02b2" />

<img width="605" alt="Screenshot 2024-12-17 at 19 01 31" src="https://github.com/user-attachments/assets/69f49a26-3c94-477e-ac26-88b64c33fb90" />

<img width="640" alt="Screenshot 2024-12-17 at 19 01 50" src="https://github.com/user-attachments/assets/4d6f2aa1-125a-433b-bd39-dc4e9b6ecc49" />

<img width="627" alt="Screenshot 2024-12-17 at 19 02 39" src="https://github.com/user-attachments/assets/e2bef4e2-cd1c-4817-8cb9-4cc32f391e2b" />

<img width="658" alt="Screenshot 2024-12-17 at 19 02 59" src="https://github.com/user-attachments/assets/f06cd237-59c8-4016-b59b-3673ae412209" />

<img width="1502" alt="Screenshot 2024-12-17 at 19 04 10" src="https://github.com/user-attachments/assets/d5125b30-b587-4a18-96d2-6a5e12ebef66" />

<img width="1517" alt="Screenshot 2024-12-17 at 19 04 34" src="https://github.com/user-attachments/assets/f49e75dd-6e72-4b90-8329-f39ffc23d2fb" />

<img width="1723" alt="Screenshot 2024-12-17 at 19 08 44" src="https://github.com/user-attachments/assets/09e09d52-fc86-446e-af79-ec10ae523b92" />















