function base64UrlEncode(obj: unknown) {
  return btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function creerFauxToken(payload: unknown) {
  const header = base64UrlEncode({ alg: 'HS256', typ: 'JWT' })
  const body = base64UrlEncode(payload)
  return `${header}.${body}.signature-de-test`
}
