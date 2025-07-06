# frontend/Dockerfile

FROM node:18-alpine

WORKDIR /app

# Copy package files and install deps first
COPY package*.json ./
RUN npm install

# Copy everything else including src and public
COPY . .

# Build the app
RUN npm run build

# Serve the build
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]

EXPOSE 3000
