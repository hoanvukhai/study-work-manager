# ---- Giai đoạn 1: cài thư viện, sinh Prisma Client, biên dịch ----
FROM node:20-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run build
# Bỏ thư viện chỉ dùng khi phát triển (Prisma CLI được giữ lại để áp migration lúc khởi động)
RUN npm prune --omit=dev

# ---- Giai đoạn 2: ảnh chạy thật, nhỏ gọn ----
FROM node:20-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package*.json ./
EXPOSE 3001
# Áp mọi migration chưa chạy rồi mới khởi động API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
