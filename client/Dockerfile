FROM node:20-alpine AS dependencies

WORKDIR /app
COPY client/package.json client/package-lock.json ./
RUN npm ci

FROM dependencies AS development

COPY client ./
ENV VITE_API_URL=/api
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM dependencies AS build

ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
COPY client ./
RUN npm run build

FROM nginx:1.27-alpine AS production

COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=5 CMD wget --spider -q http://127.0.0.1/healthz || exit 1
