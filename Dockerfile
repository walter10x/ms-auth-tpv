FROM node:20-alpine

WORKDIR /usr/src/app

# Copiar archivos de dependencias primero (para aprovechar la caché)
COPY package.json tsconfig.json ./
COPY yarn.lock ./

# Instalar dependencias (sin --frozen-lockfile)
RUN yarn install

# Instalar CLI de NestJS globalmente con flag para ignorar versiones
RUN yarn global add @nestjs/cli --ignore-engines

# Copiar el código fuente
COPY . .

# Depuración: ver la estructura de directorios
RUN echo "Estructura de directorios:"
RUN find . -type d | grep -v node_modules

# Compilar la aplicación
RUN yarn build

# Verificar que dist existe
RUN ls -la && echo "¿Existe dist?" && ls -la dist || echo "¡Carpeta dist no existe!"

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar
CMD ["node", "dist/main.js"]
