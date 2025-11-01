## Things to do
 - Complete the orchestrator. Its an empty folder right now. It should talk to ASGs and scale them up/drain them when a worker becomes idle
 - Send the user response back to the LLM. If a user is changing a file, the LLM needs to be aware of this. 
 - UI cleanups
 - Figure out why npm install doesnt work from time to time. Most probably we need to run them sequentially so create some sort of async queue to do it.
- Create a load balancer service that routes requests from id.worker.100xdevs.com to the respective worker for that project
- Add multiplayer mode
- Backup folders to S3 (can use s3-mount for this)


## Setup procedure
 - Clone the project
 - git clone https://github.com/code100x/base-react-native-expo.git /tmp/bolty-worker
 - cd /tmp/bolty-worker && npm install
 - Build and run the code-server image
 ```
    cd apps/code-server
    docker build -t code-server-update .
    docker run -p 8080:8080 -p 8081:8081 code-sever-update
 ```
 - Install dependencies globally
 ```
    bun install
 ```
 - Start postgres locally
 ```
 docker run -p 5432:5432 -d -e POSTGRES_PASSWORD=mysupersecretpassword postgres
 ```
 - Copy packages/db/.env.example over to packages/db/.env
 - Migrate the db , generate the client
 ```
    cd packages/db
    npx prisma migrate dev
    npx prisma generate
 ```
 - Sign up to clerk, create a new dev app. 
 - Start the frontend, update .env in apps/frontend
 ```
    cd apps/frontend
    bun dev
 ```
 - Copy apps/primary-backend/.env.example over to apps/primary-backend/.env, update the clerk credentials
 - Start the primary backend
 - Go to claude and get api keys, update apps/worker/.env
 - Start a single worker locally
 ```
    cd apps/worker
    bun index.ts
  ```