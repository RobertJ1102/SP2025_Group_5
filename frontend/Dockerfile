# Use Node.js 22 base image
FROM node:22

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json .
RUN npm install

# Copy all frontend files
COPY . .

# Start React development server
CMD ["npm", "start"]
