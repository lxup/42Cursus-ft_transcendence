storage "raft" {
	path = "/vault/data"
	node_id = "node1"
}

listener "tcp" {
	address		= "127.0.0.1:8200"
	tls_cert_file = "/vault/tls/vault.crt"
  	tls_key_file  = "/vault/tls/vault.key"
}

disable_mlock = true

api_addr = "https://127.0.0.1:8200"
cluster_addr = "https://127.0.0.1:8201"
ui = true