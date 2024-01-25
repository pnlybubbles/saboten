import { uuidToCompressedPrintableString } from '../../utils/uuid.ts'

export const withCompressedUserId = <T extends { id: string }>(user: T) =>
  ({
    ...user,
    // TOOD: 消す可能性があるのでoptionalにしておく
    compressedId: uuidToCompressedPrintableString(user.id),
  }) as typeof user & { compressedId?: string }
