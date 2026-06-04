import { createApp } from './app.js'
import { loadGatewayConfig } from './config/env.js'

const config = loadGatewayConfig()
const app = createApp({ config })

app.listen(config.port, '0.0.0.0', () => {
  console.log(`[web-gateway-service] listening on port ${config.port}`)
  console.log(`[web-gateway-service] forwarding requests to ${config.academicServiceUrl}`)
})
