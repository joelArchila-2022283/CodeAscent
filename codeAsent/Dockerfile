FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package.json frontend/pnpm-lock.yaml ./

RUN corepack enable && pnpm install --frozen-lockfile --config.ignore-scripts=false

COPY frontend/ ./

RUN sed -i "s#http://127.0.0.1:3000/api#/api#g" src/environments/environment.ts

RUN pnpm build


FROM node:22-alpine AS backend-build

WORKDIR /app/backend

COPY backend/package.json backend/pnpm-lock.yaml ./

RUN corepack enable && pnpm install --frozen-lockfile --config.ignore-scripts=false

COPY backend/ ./

RUN pnpm construir


FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable

COPY backend/package.json backend/pnpm-lock.yaml ./backend/

RUN cd backend && pnpm install --prod --frozen-lockfile --config.ignore-scripts=false

COPY --from=backend-build /app/backend/dist ./backend/dist

COPY --from=frontend-build /app/frontend/dist/codeasent-frontend/browser ./backend/public

WORKDIR /app/backend

EXPOSE 3000

CMD ["node", "dist/server.js"]