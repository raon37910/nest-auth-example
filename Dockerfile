# 기본 이미지 설정
FROM node:18 AS base
WORKDIR /app
RUN npm install -g pnpm @nestjs/cli

# 의존성 설치 단계
FROM base AS dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# 개발 환경
FROM dependencies AS development
COPY . .
CMD ["pnpm", "run", "start:dev"]

# 빌드 단계
FROM dependencies AS build
COPY . .
RUN pnpm build

# 프로덕션 환경
FROM base AS production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./
EXPOSE 3000
CMD ["pnpm", "run", "start:prod"]