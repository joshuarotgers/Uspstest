FROM node:18

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Expose server port
EXPOSE 4000

# Start server
CMD ["npm", "start"]
