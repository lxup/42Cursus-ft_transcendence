FROM debian:bullseye AS default

ARG NAME=vault

# Set environment variables
ENV NAME=${NAME}

# Install dependencies
RUN apt-get update && apt-get install -y && apt-get upgrade -y \
	wget \
	gpg \
	lsb-release \
	wait-for-it \
	&& rm -rf /var/lib/apt/lists/*

# Install Vault
RUN wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg \
	&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/hashicorp.list \
	&& apt-get update && apt-get install -y vault \
	&& rm -rf /var/lib/apt/lists/*

# Create directories
RUN mkdir -p /vault/logs \
	&& mkdir -p /vault/data \
	&& mkdir -p /vault/config \
	# && mkdir -p /vault/tls \
	&& chown -R ${NAME}:${NAME} /vault

# Generate self-signed certificate
# RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /vault/tls/vault.key -out /vault/tls/vault.crt -subj "/C=FR/ST=IDF/L=Paris/O=42/OU=42/CN=vault"

# Expose volumes
# VOLUME /vault/logs
# VOLUME /vault/data

# Expose ports
EXPOSE 8200

# Copy configuration
COPY config.hcl /vault/config/config.hcl

# Copy entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

# Make sure the entrypoint is executable
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]


