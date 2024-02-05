import hash from 'string-hash'

export default function log(title: string, message: string, payload: unknown) {
  const deg = (hash(title) / 4294967295) * 360
  console.log(
    `%c${getTimeString()} %c${title}%c ${abbreviateUUID(message)}%c %o`,
    styleObjectToString({
      color: '#aaa',
    }),
    styleObjectToString({
      'text-decoration': 'underline',
      'font-weight': 'bold',
      color: `hsl(${deg}deg 70% 48%)`,
    }),
    styleObjectToString({
      color: `hsl(${deg}deg 15% 40%)`,
    }),
    styleObjectToString({}),
    payload,
  )
}

const getTimeString = () => {
  const date = new Date()
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  const second = date.getSeconds().toString().padStart(2, '0')
  const millisecond = date.getMilliseconds().toString().padStart(4, '0')
  return `${hour}:${minute}:${second}.${millisecond}`
}

const styleObjectToString = (style: Record<string, string>) =>
  Object.keys(style)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .map((key) => `${key}: ${style[key]!};`)
    .join('\n')

const abbreviateUUID = (str: string) =>
  str.replaceAll(/([0-9a-f]{6})[0-9a-f]{2}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, '$1..')
