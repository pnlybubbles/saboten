import type { IncomingMessage } from 'http'
import http from 'http'
import httpProxy from 'http-proxy'
import chalk from 'chalk'

type Target = { host: string; port: number }
type PathMapping = { '*': Target } & { [key: `/${string}`]: Target }

const MAPPING = {
  // http://localhost:8080/api/hello -> http://localhost:8787/api/hello
  '/api': { port: 8787, host: 'localhost' },
  // http://localhost:8080/otherwise -> http://localhost:5173/otherwise
  '*': { port: 5173, host: 'localhost' },
} satisfies PathMapping
const PROXY = { port: 8080, host: 'localhost' }

const { '*': DEFAULT_TARGET, ...PRIORITY_MAPPING } = MAPPING

function target(req: IncomingMessage) {
  const { pathname } = new URL(req.url ?? '', `http://${req.headers.host}`)
  for (const [path, target] of Object.entries(PRIORITY_MAPPING)) {
    if (pathname === path || pathname?.startsWith(`${path}/`)) {
      return target
    }
  }
  return DEFAULT_TARGET
}

const proxy = httpProxy.createProxyServer({})

const server = http.createServer((req, res) => {
  proxy.web(req, res, { target: target(req) })
})

server.on('upgrade', function (req, socket, head) {
  proxy.ws(req, socket, head, { target: target(req) })
})

server.listen(PROXY.port, () => {
  const PAD = '  '
  const TO = chalk.green('  →  ')
  console.log(
    `${chalk.whiteBright.bold('Proxy:')} ${chalk.cyan(`http://${PROXY.host}:`)}${chalk.cyanBright.bold(PROXY.port)}`,
  )
  const maxPath = Math.max(...Object.keys(PRIORITY_MAPPING).map((v) => v.length))
  for (const [path, { host, port }] of Object.entries(PRIORITY_MAPPING)) {
    console.log(
      `${PAD}${chalk.gray(`${PROXY.host}:${PROXY.port}`)}${chalk.whiteBright.bold(path.padEnd(maxPath))}${TO}${chalk.gray(`${host}:`)}${chalk.whiteBright.bold(port)}${chalk.gray(path)}`,
    )
  }
  console.log(
    `${PAD}${chalk.gray(`${PROXY.host}:${PROXY.port}`)}${chalk.whiteBright.bold('/*'.padEnd(maxPath))}${TO}${chalk.gray(`${DEFAULT_TARGET.host}:`)}${chalk.whiteBright.bold(DEFAULT_TARGET.port)}${chalk.gray('/*')}`,
  )
})
