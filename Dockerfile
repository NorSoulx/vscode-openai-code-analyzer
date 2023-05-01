# Use an official Node.js runtime as a parent image
FROM node:lts

# Set the working directory to /app
WORKDIR /app

# Copy the shell script into the container at /app
COPY ./run.sh /app

# Install any needed packages specified in package.json
COPY ./package.json /app
COPY ./package-lock.json /app

# Set environment variable for the OpenAI API key
ARG OPENAI_API_KEY
ENV OPENAI_API_KEY=$OPENAI_API_KEY

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Run the shell script when the container launches
CMD ["./run.sh"]

