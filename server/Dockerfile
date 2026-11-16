FROM node:20-alpine AS development

WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY server/src ./src
COPY server/migrations ./migrations
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM node:20-alpine AS production

WORKDIR /app
ENV NODE_ENV=production
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node server/src ./src
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=5 CMD node -e "fetch('http://127.0.0.1:3000/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["npm", "start"]
