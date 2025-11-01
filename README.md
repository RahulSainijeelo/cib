# CIB - Code in Browser

A cloud-native, browser-based VS Code environment with auto-scaling capabilities and real-time multi-user collaboration. Deploy and scale your development environment effortlessly using Docker containers and intelligent routing.

## 🌟 Features

- **Browser-Based IDE**: Full-featured VS Code experience directly in your web browser
- **Docker-Powered**: Containerized environments for consistency and portability
- **Auto-Scaling**: Automatic scaling based on demand using AWS Auto Scaling Groups or similar orchestration
- **Multi-User Collaboration**: Real-time collaborative editing with conflict resolution
- **Smart Routing**: Intelligent load balancing and session management for optimal performance
- **Isolated Environments**: Each user session runs in its own secure container
- **Persistent Storage**: User data and workspace configurations are preserved across sessions

## 🏗️ Architecture

CIB leverages a microservices architecture to provide a scalable and robust development environment:

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Load Balancer  │  ◄── Routes traffic to available instances
└────────┬────────┘
         │
         ▼
┌────────────────────────────┐
│   Auto Scaling Group       │
│  ┌──────┐  ┌──────┐       │
│  │ CIB  │  │ CIB  │  ...  │  ◄── Docker containers with VS Code
│  │ Node │  │ Node │       │
│  └──────┘  └──────┘       │
└────────────────────────────┘
         │
         ▼
┌─────────────────┐
│ Collaboration   │  ◄── WebSocket server for real-time sync
│     Server      │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Storage Layer  │  ◄── Persistent volume for user data
└─────────────────┘
```

### Components

1. **Router/Load Balancer**: Distributes incoming connections across available CIB instances
2. **CIB Nodes**: Docker containers running browser-based VS Code instances
3. **Auto Scaling Manager**: Monitors load and scales instances up or down
4. **Collaboration Server**: Handles real-time synchronization between users
5. **Storage Backend**: Persistent storage for user workspaces and configurations

## 📋 Prerequisites

Before getting started, ensure you have the following installed:

- **Docker** (20.10+)
- **Docker Compose** (2.0+)
- **Node.js** (18+) - For local development
- **AWS CLI** (optional, for cloud deployment)
- **Kubernetes/EKS** (optional, for production scaling)

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/RahulSainijeelo/cib.git
   cd cib
   ```

2. **Build the Docker image**
   ```bash
   docker build -t cib:latest .
   ```

3. **Run a single instance**
   ```bash
   docker run -p 8080:8080 -v $(pwd)/workspace:/workspace cib:latest
   ```

4. **Access the IDE**
   
   Open your browser and navigate to `http://localhost:8080`

### Docker Compose Setup

For a complete local setup with collaboration features:

```bash
docker-compose up -d
```

This will start:
- Multiple CIB instances
- Collaboration server
- Load balancer (nginx)
- Redis for session management

Access the application at `http://localhost`

## 🐳 Docker Configuration

### Building Custom Images

The `Dockerfile` includes:
- Base VS Code Server image
- Required extensions and tools
- Node.js runtime
- Collaboration client

Customize the image by editing the `Dockerfile`:

```dockerfile
FROM codercom/code-server:latest

# Install additional tools
RUN sudo apt-get update && \
    sudo apt-get install -y git curl

# Install VS Code extensions
RUN code-server --install-extension ms-python.python
RUN code-server --install-extension dbaeumer.vscode-eslint

# Configure collaboration client
COPY collaboration-client /opt/collaboration-client
```

### Environment Variables

Configure your CIB instance using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `CIB_PORT` | Port for the web interface | `8080` |
| `CIB_PASSWORD` | Access password | `changeme` |
| `COLLAB_SERVER` | Collaboration server URL | `ws://localhost:3001` |
| `WORKSPACE_DIR` | Directory for user workspaces | `/workspace` |
| `MAX_USERS_PER_INSTANCE` | Maximum concurrent users | `10` |

## ⚖️ Auto-Scaling Configuration

### AWS Auto Scaling Groups

Deploy CIB with automatic scaling on AWS:

1. **Create Launch Template**
   ```bash
   aws ec2 create-launch-template \
     --launch-template-name cib-template \
     --version-description "CIB v1.0" \
     --launch-template-data file://launch-template.json
   ```

2. **Create Auto Scaling Group**
   ```bash
   aws autoscaling create-auto-scaling-group \
     --auto-scaling-group-name cib-asg \
     --launch-template LaunchTemplateName=cib-template \
     --min-size 2 \
     --max-size 10 \
     --desired-capacity 2 \
     --vpc-zone-identifier "subnet-xxxxx,subnet-yyyyy"
   ```

3. **Configure Scaling Policies**
   
   Scale up when CPU usage exceeds 70%:
   ```bash
   aws autoscaling put-scaling-policy \
     --auto-scaling-group-name cib-asg \
     --policy-name scale-up \
     --scaling-adjustment 1 \
     --adjustment-type ChangeInCapacity
   ```

### Kubernetes/EKS Auto-Scaling

For Kubernetes deployment, use Horizontal Pod Autoscaler (HPA):

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: cib-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: cib-deployment
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

Apply the configuration:
```bash
kubectl apply -f hpa.yaml
```

## 🔀 Router Functionality

The router component provides intelligent load balancing and session management:

### Features

- **Session Affinity**: Users are routed to the same instance for the duration of their session
- **Health Checks**: Automatically removes unhealthy instances from the pool
- **WebSocket Support**: Maintains persistent connections for real-time collaboration
- **SSL/TLS Termination**: Handles encryption at the edge

### Nginx Configuration Example

**Option 1: Using IP Hash for Session Affinity**

```nginx
upstream cib_backend {
    ip_hash;  # Routes client to same backend based on IP
    server cib-node-1:8080 max_fails=3 fail_timeout=30s;
    server cib-node-2:8080 max_fails=3 fail_timeout=30s;
    server cib-node-3:8080 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name cib.example.com;

    location / {
        proxy_pass http://cib_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Option 2: Using Least Connections (No Session Affinity)**

```nginx
upstream cib_backend {
    least_conn;  # Routes to backend with fewest connections
    server cib-node-1:8080 max_fails=3 fail_timeout=30s;
    server cib-node-2:8080 max_fails=3 fail_timeout=30s;
    server cib-node-3:8080 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name cib.example.com;

    location / {
        proxy_pass http://cib_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Note**: For advanced cookie-based session affinity, consider using:
- **Nginx Plus**: Built-in sticky cookie directive
- **nginx-sticky-module-ng**: Third-party module for open-source Nginx
- **IP Hash**: Use `ip_hash;` directive in upstream block for simpler session persistence

### AWS Application Load Balancer

For AWS deployments, configure an ALB with target groups:

```bash
aws elbv2 create-load-balancer \
  --name cib-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx

aws elbv2 create-target-group \
  --name cib-targets \
  --protocol HTTP \
  --port 8080 \
  --vpc-id vpc-xxxxx \
  --health-check-path /healthz
```

## 👥 Multi-User Collaboration

CIB enables multiple developers to work on the same codebase simultaneously with real-time synchronization.

### Features

- **Real-time Editing**: See changes from other users instantly
- **Cursor Tracking**: View where other users are working
- **Conflict Resolution**: Automatic merge of simultaneous edits
- **User Presence**: Know who's online in your workspace
- **Chat Integration**: Built-in communication for team members

### Setting Up Collaboration

1. **Start the Collaboration Server**
   ```bash
   docker run -d -p 3001:3001 cib-collaboration-server
   ```

2. **Configure CIB Instances**
   
   Set the collaboration server URL:
   ```bash
   export COLLAB_SERVER=ws://collaboration-server:3001
   ```

3. **Share Your Workspace**
   
   Generate a shareable link from the IDE or use the CLI:
   ```bash
   cib share --workspace /path/to/workspace
   ```

### Collaboration Architecture

```
┌────────────┐         ┌────────────┐
│  User A    │         │  User B    │
│  Browser   │         │  Browser   │
└─────┬──────┘         └──────┬─────┘
      │                       │
      │    WebSocket          │
      ├───────────┬───────────┤
      │           │           │
      │    ┌──────▼──────┐    │
      │    │ Collab      │    │
      └────► Server      ◄────┘
           │ (WebRTC/WS)│
           └─────┬───────┘
                 │
          ┌──────▼──────┐
          │  Operational│
          │ Transform   │
          │   Engine    │
          └─────────────┘
```

### Operational Transform (OT)

CIB uses Operational Transformation to ensure consistency:
- Handles concurrent edits from multiple users
- Maintains document integrity
- Preserves user intent across transformations

## 📊 Monitoring and Metrics

### Health Checks

Each CIB instance exposes health check endpoints:

- **Liveness**: `GET /healthz/live` - Is the instance running?
- **Readiness**: `GET /healthz/ready` - Can it accept traffic?
- **Metrics**: `GET /metrics` - Prometheus-formatted metrics

### Key Metrics

Monitor these metrics for optimal performance:

- **Active Sessions**: Number of concurrent users
- **CPU Usage**: Per-instance CPU utilization
- **Memory Usage**: RAM consumption per instance
- **Response Time**: Average request latency
- **WebSocket Connections**: Active collaboration connections

### Prometheus Configuration

```yaml
scrape_configs:
  - job_name: 'cib'
    static_configs:
      - targets:
        - 'cib-node-1:9090'
        - 'cib-node-2:9090'
        - 'cib-node-3:9090'
```

## 🔒 Security

### Best Practices

1. **Authentication**: Integrate with OAuth2/OIDC providers
2. **Network Isolation**: Use VPC and security groups
3. **Encryption**: Enable TLS for all traffic
4. **Container Security**: Scan images for vulnerabilities
5. **Access Control**: Implement RBAC for workspaces

### Example OAuth2 Configuration

```yaml
oauth:
  provider: github
  client_id: ${GITHUB_CLIENT_ID}
  client_secret: ${GITHUB_CLIENT_SECRET}
  redirect_uri: https://cib.example.com/oauth/callback
```

## 🛠️ Configuration

### config.yaml

```yaml
server:
  port: 8080
  host: 0.0.0.0

workspace:
  root: /workspace
  max_size: 10GB

collaboration:
  enabled: true
  server: ws://collaboration-server:3001
  max_users_per_workspace: 5

scaling:
  min_instances: 2
  max_instances: 20
  target_cpu: 70
  target_memory: 80

storage:
  type: s3
  bucket: cib-workspaces
  region: us-east-1
```

## 📖 Usage Examples

### Creating a Workspace

```bash
# CLI
cib create-workspace --name my-project --template node

# API
curl -X POST https://cib.example.com/api/workspaces \
  -H "Content-Type: application/json" \
  -d '{"name": "my-project", "template": "node"}'
```

### Inviting Collaborators

```bash
# Generate invitation link
cib invite --workspace my-project --email colleague@example.com

# Set permissions
cib permissions --workspace my-project --user colleague@example.com --role editor
```

### Scaling Operations

```bash
# Manual scaling
cib scale --instances 5

# View current capacity
cib status

# Set auto-scaling parameters
cib autoscale --min 2 --max 10 --cpu-threshold 70
```

## 🧪 Development

### Running Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Local Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [code-server](https://github.com/coder/code-server) - VS Code in the browser
- [Operational-Transformation](https://github.com/Operational-Transformation) - Real-time collaboration
- [Docker](https://www.docker.com/) - Containerization platform
- [AWS](https://aws.amazon.com/) - Cloud infrastructure

## 📞 Support

- **Documentation**: [https://docs.cib.example.com](https://docs.cib.example.com)
- **Issues**: [GitHub Issues](https://github.com/RahulSainijeelo/cib/issues)
- **Discussions**: [GitHub Discussions](https://github.com/RahulSainijeelo/cib/discussions)
- **Email**: support@cib.example.com

## 🗺️ Roadmap

- [ ] Kubernetes Operator for simplified deployment
- [ ] Built-in debugging tools
- [ ] Language server protocol support
- [ ] Integrated terminal sharing
- [ ] Voice/video chat for collaboration
- [ ] Workspace templates marketplace
- [ ] Advanced analytics and insights
- [ ] Mobile app support

---

Made with ❤️ by the CIB Team
