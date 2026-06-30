import Keycloak from 'keycloak-js'

const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8180',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'academic-platform',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'academic-frontend',
}

const keycloak = new Keycloak(keycloakConfig)

export default keycloak
