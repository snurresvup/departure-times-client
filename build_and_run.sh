docker build --no-cache -t departure-times-client:latest .
docker rm -f departure-times-client
docker run --restart always --name departure-times-client -p 5000:5000 -tid departure-times-client
