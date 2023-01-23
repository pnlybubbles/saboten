import prisma from '../../prisma.ts'
import { publicProcedure } from '../server.ts'

export default publicProcedure.mutation(async ({ ctx: { userId, setCookie, removeCookie } }) => {
  if (!userId) {
    return null
  }
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (user) {
    // ユーザーが見つかったらcookieを延長
    setCookie('id', userId, { maxAge: 60 * 60 * 24 * 365 * 2 })
  } else {
    // ユーザーが見つからないのであればcookieを削除する
    removeCookie('id')
  }
  return user
})
