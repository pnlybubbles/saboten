import http from 'http'
import httpProxy from 'http-proxy'
import chalk from 'chalk'

type PathMapping = { '*': number } & { [key: `/${string}`]: number }

const MAPPING = {
  '/api': 8787,
  '*': 5173,
} satisfies PathMapping
const PROXY_PORT = 8080
const HOST = 'http://localhost:'

const { '*': DEFAULT_PORT, ...PRIORITY_MAPPING } = MAPPING

const proxy = httpProxy.createProxyServer({})

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url ?? '', `http://${req.headers.host}`)
  for (const [path, port] of Object.entries(PRIORITY_MAPPING)) {
    if (pathname === path || pathname?.startsWith(`${path}/`)) {
      proxy.web(req, res, { target: `${HOST}${port}` })
      return
    }
  }
  proxy.web(req, res, { target: `${HOST}${DEFAULT_PORT}` })
})

server.listen(PROXY_PORT, () => {
  const TO = chalk.gray('→')
  console.log(`${chalk.whiteBright('Proxy:')} ${chalk.cyan(HOST)}${chalk.cyanBright(PROXY_PORT)}`)
  for (const [path, port] of Object.entries(PRIORITY_MAPPING)) {
    console.log(
      `  ${chalk.gray(`${HOST}${PROXY_PORT}`)}${chalk.whiteBright(path)} ${TO} ${chalk.gray(HOST)}${chalk.whiteBright(port)}`,
    )
  }
  console.log(
    `  ${chalk.gray(`${HOST}${PROXY_PORT}`)}${chalk.whiteBright('/*')} ${TO} ${chalk.gray(HOST)}${chalk.whiteBright(DEFAULT_PORT)}`,
  )
})
