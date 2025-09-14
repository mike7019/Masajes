FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Generar cliente Prisma
RUN npx prisma generate

# Construir la aplicación
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]