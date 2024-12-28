# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container to /usr/src/app
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container at /usr/src/app
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Bundle app source inside Docker image
COPY . .

# Make port 3000 available to the world outside this container
EXPOSE 4173

# Define environment variable
ENV NODE_ENV production

RUN npm run build

# Run app.js when the container launches
CMD ["npm", "run", "preview","--","--host", "0.0.0.0", "--port", "4173"]