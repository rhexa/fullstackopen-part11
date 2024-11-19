# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=18
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Install packages needed to build node modules
FROM base as build
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Throw-away build stage to reduce size of final image
FROM build as build-fe

# Install node modules
COPY bloglist-frontend/ .
RUN npm ci --include=dev

# Build application
RUN npm run build

# Throw-away build stage to reduce size of final image
FROM build as build-be

# Install node modules
COPY blog/ .

RUN npm ci --omit=dev

# Final stage for app image
FROM base

# Copy built application
COPY --from=build-be /app /app

COPY --from=build-fe /app/dist /app/dist

# Start the server by default, this can be overwritten at runtime
EXPOSE 3003
CMD [ "npm", "run", "start" ]