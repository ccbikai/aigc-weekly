# Builder image

FROM node:22-bookworm AS builder

ENV CI=true
ENV SKIP_INSTALL_SIMPLE_GIT_HOOKS=true

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

ENV NODE_ENV=production

RUN corepack enable

COPY . /app
WORKDIR /app

FROM builder AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile --ignore-scripts

FROM builder AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build:agent

## Production image

FROM nikolaik/python-nodejs:python3.12-nodejs22-bookworm AS prod

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY --from=build /app/package.json /app/package.json

COPY --from=build --chown=pn:pn /app/agent/.claude /home/pn/app/.claude

# Clean up unnecessary files to reduce image size
RUN find /app/node_modules -path '*claude-code-jetbrains-plugin*' -prune -exec rm -rf {} +
RUN find /app/node_modules -path '*-darwin*' -prune -exec rm -rf {} +
RUN find /app/node_modules -path '*-win32*' -prune -exec rm -rf {} +
RUN set -euo pipefail; \
  arch="$(dpkg --print-architecture)"; \
  case "$arch" in \
    amd64) patterns='linux-arm64 arm64-linux' ;; \
    arm64) patterns='linux-x64 x64-linux' ;; \
    *) patterns='' ;; \
  esac; \
  if [ -n "$patterns" ]; then \
    for pattern in $patterns; do \
      find /app/node_modules -path "*${pattern}*" -prune -exec rm -rf {} +; \
    done; \
  fi

ENV NODE_ENV=production
ENV CWD=/home/pn/app

WORKDIR /home/pn/app
USER pn
EXPOSE 2442

CMD [ "node", "/app/dist/index.mjs" ]
