docker build --provenance=false --platform=linux/arm64 -t smart/typebot-builder:v1 -f Dockerfile.builder .

docker run --rm \
 --network mysql_mysql \
 -e "ENCRYPTION_SECRET=hROPBuSRkaIL/CYoLhyp5k46xTPcB7rG" \
 -e "DATABASE_URL=mysql://root:password@mysql:3306/typebot" \
 -e "NEXTAUTH_URL=http://localhost:8081" \
 -e "NEXT_PUBLIC_VIEWER_URL=http://localhost:3001" \
 -e "DEFAULT_WORKSPACE_PLAN=UNLIMITED" \
 -e "S3_ACCESS_KEY=minio" \
 -e "S3_SECRET_KEY=minio123" \
 -e "S3_BUCKET=typebot" \
 -e "S3_PORT=9000" \
 -e "S3_ENDPOINT=localhost" \
 -e "S3_SSL=false" \
 -e "NODE_OPTIONS=--no-node-snapshot" \
 -e "NEXT_PUBLIC_PARTYKIT_HOST=localhost:1999" \
 -p 8081:3000 \
 smart/typebot-builder:v1


docker run --rm \
 --network mysql_mysql \
 -e "ENCRYPTION_SECRET=hROPBuSRkaIL/CYoLhyp5k46xTPcB7rG" \
 -e "DATABASE_URL=mysql://root:password@mysql:3306/typebot" \
 -e "NEXTAUTH_URL=http://localhost:8081" \
 -e "NEXT_PUBLIC_VIEWER_URL=http://localhost:3001" \
 -e "DEFAULT_WORKSPACE_PLAN=UNLIMITED" \
 -e "S3_ACCESS_KEY=minio" \
 -e "S3_SECRET_KEY=minio123" \
 -e "S3_BUCKET=typebot" \
 -e "S3_PORT=9000" \
 -e "S3_ENDPOINT=localhost" \
 -e "S3_SSL=false" \
 -e "NODE_OPTIONS=--no-node-snapshot" \
 -e "NEXT_PUBLIC_PARTYKIT_HOST=localhost:1999" \
 -p 8081:3000 \
 smart/typebot-viewer:v1

docker build --provenance=false --platform=linux/arm64 -t smart/typebot-viewer:v1 -f Dockerfile.viewer .


minikube image load smart/typebot-builder:v1
minikube image load smart/typebot-viewer:v1


<!-- npx prisma migrate dev --schema=packages/prisma/postgresql/schema.prisma -->

<!-- -v "./packages/prisma/mysql:/app/packages/prisma/postgresql" \ -->
