FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_AUTH_API_BASE_URL=/accounts-api
ENV VITE_AUTH_API_BASE_URL=$VITE_AUTH_API_BASE_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
