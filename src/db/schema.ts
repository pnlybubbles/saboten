import { sql } from 'drizzle-orm'
import { integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

const NOW = sql`CURRENT_TIMESTAMP`

const event = sqliteTable('Event', {
  id: text('id').notNull().primaryKey(),
  createdAt: text('createdAt').notNull().default(NOW),
  roomId: text('roomId')
    .notNull()
    .references(() => room.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  label: text('label').notNull().default(''),
})

const eventMember = sqliteTable(
  'EventMember',
  {
    createdAt: text('createdAt').notNull().default(NOW),
    eventId: text('eventId')
      .notNull()
      .references(() => event.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    memberId: text('memberId')
      .notNull()
      .references(() => roomMember.id, { onDelete: 'no action', onUpdate: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.eventId, table.memberId] }),
  }),
)

const eventPayment = sqliteTable(
  'EventPayment',
  {
    createdAt: text('createdAt').notNull().default(NOW),
    amount: integer('amount').notNull(),
    currency: text('currency').notNull(),
    paidByMemberId: text('paidByMenberId')
      .notNull()
      .references(() => roomMember.id, { onDelete: 'no action', onUpdate: 'cascade' }),
    eventId: text('eventId')
      .notNull()
      .references(() => event.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.eventId, table.paidByMemberId] }),
  }),
)

const room = sqliteTable('Room', {
  id: text('id').notNull().primaryKey(),
  createdAt: text('createdAt').notNull().default(NOW),
  title: text('title').notNull().default(''),
})

const roomCurrencyRate = sqliteTable(
  'RoomCurrencyRate',
  {
    createdAt: text('createdAt').notNull().default(NOW),
    roomId: text('roomId')
      .notNull()
      .references(() => room.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    toCurrency: text('toCurrency').notNull(),
    currency: text('currency').notNull(),
    rate: real('rate').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.roomId, table.toCurrency, table.currency] }),
  }),
)

const roomMember = sqliteTable('RoomMember', {
  id: text('id').notNull(),
  createdAt: text('createdAt').notNull().default(NOW),
  roomId: text('roomId')
    .notNull()
    .references(() => room.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  name: text('name').notNull().default(''),
  userId: text('userId').references(() => user.id, { onDelete: 'set null', onUpdate: 'cascade' }),
})

const user = sqliteTable('User', {
  id: text('id').notNull().primaryKey(),
  secret: text('secret').notNull().unique(),
  createdAt: text('createdAt').notNull().default(NOW),
  name: text('name').notNull().default(''),
})

const schema = {
  event,
  eventMember,
  eventPayment,
  room,
  roomCurrencyRate,
  roomMember,
  user,
}

export default schema
