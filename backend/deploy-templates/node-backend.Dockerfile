# deploy-templates/node-backend.Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
# optional build step (if repo has `build` script)
RUN npm run build || true
EXPOSE 3000
CMD ["npm", "start"]
