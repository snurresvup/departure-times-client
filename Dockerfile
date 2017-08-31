FROM node:latest
ADD build build
ADD cert.pem cert.pem
ADD key.pem key.pem
RUN npm install -g http-server
ADD http-server.js usr/local/lib/node_modules/http-server/lib/http-server.js
CMD http-server build -p 5000 -P https://178.62.31.37:8080 -S -C cert.pem
EXPOSE 5000
