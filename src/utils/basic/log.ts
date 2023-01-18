export const log = (title: string, payload: unknown) => {
  console.log(
    `%c${getTimeString()} %c${title}%c %o`,
    styleObjectToString({
      color: '#aaa',
    }),
    styleObjectToString({
      'font-weight': 'bold',
      color: '#7c7',
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
    .map((key) => `${key}: ${style[key] as string};`)
    .join('\n')
