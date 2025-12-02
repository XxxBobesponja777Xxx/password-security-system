FROM node:18-alpine
WORKDIR /app

COPY package*.json ./

# Instalamos dependencias sin exigir package-lock.json
RUN npm install --omit=dev

COPY . .

CMD ["node", "src/index.js"]
