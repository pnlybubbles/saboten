export default function isEmoji(str: string) {
  return /<a?:.+?:\d{18}>|\p{Extended_Pictographic}/u.test(str)
}
