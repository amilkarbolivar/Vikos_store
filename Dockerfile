FROM node:24-slim
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Estas dos variables se incrustan en el JavaScript al compilar
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_WHATSAPP_NUMBER
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_WHATSAPP_NUMBER=$NEXT_PUBLIC_WHATSAPP_NUMBER

# URL falsa solo para esta línea: prisma.config.ts exige DATABASE_URL al generar
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate \
    && npm run build

ENV NODE_ENV=production
RUN chown -R node:node /app
USER node
EXPOSE 3000
CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0"]