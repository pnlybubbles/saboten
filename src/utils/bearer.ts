const BEARER_PREFIX = 'Bearer '

export const affixBearerToken = (token: string) => {
  return `${BEARER_PREFIX}${token}`
}

export const extractBearerToken = (authorization: string) => {
  if (!authorization.startsWith(BEARER_PREFIX)) {
    return null
  }
  const token = authorization.slice(BEARER_PREFIX.length)
  return token
}
