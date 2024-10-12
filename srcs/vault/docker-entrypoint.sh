#!/bin/bash

# Build certificates
echo "Building certificates..."
tls_cert_file=$(grep 'tls_cert_file' /vault/config/config.hcl | awk '{print $3}' | tr -d '"')
tls_key_file=$(grep 'tls_key_file' /vault/config/config.hcl | awk '{print $3}' | tr -d '"')
echo "tls_cert_file: ${tls_cert_file}"
echo "tls_key_file: ${tls_key_file}"
openssl req -x509 -nodes -newkey rsa:2048 \
  -keyout ${tls_key_file} -out ${tls_cert_file} -days 365 \
  -subj "/C=FR/ST=IDF/L=Paris/O=42/OU=42/CN=vault" \
  -extensions req_ext -config <(cat <<-EOF
[ req ]
default_bits        = 2048
prompt              = no
default_md          = sha256
distinguished_name  = dn
req_extensions      = req_ext
x509_extensions     = v3_ca

[ dn ]
C = FR
ST = IDF
L = Paris
O = 42
OU = 42
CN = vault.local

[ req_ext ]
subjectAltName = @alt_names

[ v3_ca ]
subjectAltName = @alt_names

[ alt_names ]
DNS.1 = vault.local
IP.1 = 127.0.0.1
EOF
)

# Start the vault server
echo "Starting the vault server"
vault server -config=/vault/config/config.hcl > /vault/logs/vault.log 2>&1 &
wait-for-it 127.0.0.1:8200 --timeout=60 --strict -- echo "Vault is ready!"
cat /vault/logs/vault.log

# Set the VAULT_ADDR environment variable
export VAULT_ADDR=$(grep 'Api Address' /vault/logs/vault.log | awk '{print $3}')
echo "VAULT_ADDR: ${VAULT_ADDR}"

# Initialize the vault server
echo "Initializing the vault server"
vault operator init -key-shares=1 -key-threshold=1 > /vault/logs/init.log
echo "Vault server initialized"
cat /vault/logs/init.log

export VAULT_TOKEN=$(grep 'Initial Root Token' /vault/logs/init.log | awk '{print $4}')
echo "VAULT_TOKEN: ${VAULT_TOKEN}"

# Unseal the vault server
echo "Unsealing the vault server..."
# Unseal Key 1: Ym0Yrc8D+LHzzFdd2dG3/lm4yebwgyoKKoSAYLLkCtw=
vault operator unseal $(grep 'Unseal Key 1' /vault/logs/init.log | awk '{print $4}')
echo "Vault server unsealed"

# Enable the kv secrets engine
echo "Enabling the kv secrets engine..."
vault secrets enable -path=secret kv
echo "KV secrets engine enabled"

# Store the secrets
echo "Storing the secrets..."
vault kv put secret/ft_transcendence \
	DB_NAME="${DB_NAME}" \
	DB_USER="${DB_USER}" \
	DB_PASSWORD="${DB_PASSWORD}" \
	DB_HOST="${DB_HOST}" \
	DB_PORT="${DB_PORT}" \
	OAUTH_CLIENT_ID="${OAUTH_CLIENT_ID}" \
	OAUTH_CLIENT_SECRET="${OAUTH_CLIENT_SECRET}"
echo "Secrets stored"

# Show the secrets
echo "List of secrets:"
vault kv get secret/ft_transcendence

echo "VAULT_ADDR: ${VAULT_ADDR}"

# Keep the container running
tail -f /dev/null





