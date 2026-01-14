import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const resolveCertPath = (envKey, fallbackPath) => {
  const envValue = process.env[envKey]
  if (envValue && fs.existsSync(envValue)) {
    return envValue
  }
  if (fallbackPath && fs.existsSync(fallbackPath)) {
    return fallbackPath
  }
  return null
}

const certFallback = path.resolve(process.cwd(), '..', 'backend', 'certs', 'cert.pem')
const keyFallback = path.resolve(process.cwd(), '..', 'backend', 'certs', 'key.pem')
const pfxFallback = path.resolve(process.cwd(), '..', 'backend', 'certs', 'localhost.pfx')
const pfxPassphrase = process.env.VITE_SSL_PFX_PASSPHRASE || ''

const certPath = resolveCertPath('VITE_SSL_CERT_PATH', certFallback)
const keyPath = resolveCertPath('VITE_SSL_KEY_PATH', keyFallback)
const pfxPath = resolveCertPath('VITE_SSL_PFX_PATH', pfxFallback)

const httpsConfig = pfxPath
  ? { pfx: fs.readFileSync(pfxPath), passphrase: pfxPassphrase }
  : certPath && keyPath
    ? { cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) }
    : false

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const passphrase = env.VITE_SSL_PFX_PASSPHRASE || pfxPassphrase

  const resolvedHttpsConfig = pfxPath
    ? { pfx: fs.readFileSync(pfxPath), passphrase }
    : certPath && keyPath
      ? { cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) }
      : false

  return {
    plugins: [react()],
    server: {
      https: resolvedHttpsConfig || false
    }
  }
})
