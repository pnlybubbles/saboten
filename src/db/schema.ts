import { relations, sql } from 'drizzle-orm'
import { integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

const NOW = sql`(STRFTIME('%Y-%m-%d %H:%M:%f+00', 'NOW'))`

export const event = sqliteTable('Event', {
  id: text('id').notNull().primaryKey(),
  createdAt: text('createdAt').notNull().default(NOW),
  roomId: text('roomId')
    .notNull()
    .references(() => room.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  label: text('label').notNull().default(''),
})

export const eventRelations = relations(event, ({ one, many }) => ({
  room: one(room, { fields: [event.roomId], references: [room.id] }),
  members: many(eventMember),
  payments: many(eventPayment),
}))

export const eventMember = sqliteTable(
  'EventMember',
  {
    createdAt: text('createdAt').notNull().default(NOW),
    eventId: text('eventId')
      .notNull()
      .references(() => event.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    memberId: text('memberId')
      .notNull()
      .references(() => roomMember.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.eventId, table.memberId] }),
  }),
)

export const eventMemberRelations = relations(eventMember, ({ one }) => ({
  event: one(event, { fields: [eventMember.eventId], references: [event.id] }),
}))

export const eventPayment = sqliteTable(
  'EventPayment',
  {
    createdAt: text('createdAt').notNull().default(NOW),
    amount: integer('amount').notNull(),
    currency: text('currency').notNull(),
    paidByMemberId: text('paidByMemberId').references(() => roomMember.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    eventId: text('eventId')
      .notNull()
      .references(() => event.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.eventId, table.paidByMemberId] }),
  }),
)

export const eventPaymentRelations = relations(eventPayment, ({ one }) => ({
  event: one(event, { fields: [eventPayment.eventId], references: [event.id] }),
}))

export const room = sqliteTable('Room', {
  id: text('id').notNull().primaryKey(),
  createdAt: text('createdAt').notNull().default(NOW),
  title: text('title').notNull().default(''),
  archive: integer('archive', { mode: 'boolean' }).notNull().default(false),
})

export const roomRelations = relations(room, ({ many }) => ({
  members: many(roomMember),
  events: many(event),
  currencyRate: many(roomCurrencyRate),
}))

export const roomCurrencyRate = sqliteTable(
  'RoomCurrencyRate',
  {
    roomId: text('roomId')
      .notNull()
      .references(() => room.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    toCurrency: text('toCurrency').notNull(),
    currency: text('currency').notNull(),
    rate: real('rate').notNull(),
    createdAt: text('createdAt').notNull().default(NOW),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.roomId, table.toCurrency, table.currency] }),
  }),
)

export const roomCurrencyRateRelations = relations(roomCurrencyRate, ({ one }) => ({
  room: one(room, { fields: [roomCurrencyRate.roomId], references: [room.id] }),
}))

export const roomMember = sqliteTable('RoomMember', {
  id: text('id').notNull().primaryKey(),
  createdAt: text('createdAt').notNull().default(NOW),
  roomId: text('roomId')
    .notNull()
    .references(() => room.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  name: text('name').notNull().default(''),
  userId: text('userId').references(() => user.id, { onDelete: 'set null', onUpdate: 'cascade' }),
})

export const roomMemberRelations = relations(roomMember, ({ one }) => ({
  user: one(user, { fields: [roomMember.userId], references: [user.id] }),
  room: one(room, { fields: [roomMember.roomId], references: [room.id] }),
}))

export const user = sqliteTable('User', {
  id: text('id').notNull().primaryKey(),
  createdAt: text('createdAt').notNull().default(NOW),
  name: text('name').notNull().default(''),
  secret: text('secret').notNull().unique(),
})

const schema = {
  event,
  eventRelations,
  eventMember,
  eventMemberRelations,
  eventPayment,
  eventPaymentRelations,
  room,
  roomRelations,
  roomCurrencyRate,
  roomCurrencyRateRelations,
  roomMember,
  roomMemberRelations,
  user,
}

export default schema
