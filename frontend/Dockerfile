# ---- Giai đoạn 1: biên dịch Next.js ----
FROM node:20-alpine AS build
WORKDIR /app
# Địa chỉ API được "đóng cứng" vào mã giao diện lúc build (biến NEXT_PUBLIC_*), nên phải truyền khi build
ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV BUILD_STANDALONE=1
ENV NEXT_TELEMETRY_DISABLED=1
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Giai đoạn 2: ảnh chạy thật (Next.js standalone, không cần node_modules đầy đủ) ----
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
