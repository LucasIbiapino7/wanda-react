######################## 1ª etapa – build ########################
FROM node:20-alpine AS builder

WORKDIR /app

# copia package.json, lock e resto do código
COPY . .

# instala dependências
RUN npm ci

# define um valor-padrão para a URL da API
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=${VITE_API_URL}

# build (usa o VITE_API_URL acima)
RUN npm run build

####################### 2ª etapa – runtime #######################
FROM nginx:1.25-alpine

# copia o resultado do build Vite
COPY --from=builder /app/dist /usr/share/nginx/html

# configuração mínima do Nginx com fallback para React Router
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  location / {\n    try_files $uri /index.html;\n  }\n}\n' \
    > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
