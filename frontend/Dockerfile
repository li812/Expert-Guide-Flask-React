# Use an official Node.js runtime as a parent image
FROM node:20-alpine


# Set the working directory in the container
WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./

# Install all dependencies including react-markdown
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Update healthcheck to use correct port
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4173 || exit 1

# Update exposed port to match Vite's preview port
EXPOSE 4173

# Start the application
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]