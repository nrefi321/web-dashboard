# ── Stage 1: Build ────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Bake env vars into the static build
ARG VITE_API_BASE=
ARG VITE_MEDIA_BASE=

ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_MEDIA_BASE=$VITE_MEDIA_BASE

RUN npm run build-only

# ── Stage 2: Serve ────────────────────────────────────────────────────
FROM nginx:1.25-alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8010
CMD ["nginx", "-g", "daemon off;"]