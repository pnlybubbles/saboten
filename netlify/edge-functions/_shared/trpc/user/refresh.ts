import { z } from 'zod'
import prisma from '../../prisma.ts'
import { COMPRESSED_USER_ID_SCHEMA } from '../../utils/schema.ts'
import { compressedPrintableStringToUuid } from '../../utils/uuid.ts'
import { publicProcedure } from '../server.ts'
import { withCompressedUserId } from './_helper.ts'

export default publicProcedure
  .input(z.object({ compressedUserId: COMPRESSED_USER_ID_SCHEMA }).optional())
  .mutation(async ({ input, ctx: { userId: contextUserId, setCookie, removeCookie } }) => {
    const overrideUserId =
      input?.compressedUserId !== undefined ? compressedPrintableStringToUuid(input.compressedUserId) : undefined
    const userId = overrideUserId ?? contextUserId
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
    return user ? withCompressedUserId(user) : null
  })
