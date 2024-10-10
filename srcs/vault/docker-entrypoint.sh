#!/bin/bash

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

# Keep the container running
tail -f /dev/null





