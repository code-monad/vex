# Use the official Node.js image as the base image
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript code (if applicable)
RUN npm run build

# Expose the port the app runs on (change if your app uses a different port)
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]