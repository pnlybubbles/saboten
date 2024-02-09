CREATE TABLE `Event` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`roomId` text NOT NULL,
	`label` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `EventMember` (
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`eventId` text NOT NULL,
	`memberId` text NOT NULL,
	PRIMARY KEY(`eventId`, `memberId`),
	FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`memberId`) REFERENCES `RoomMember`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `EventPayment` (
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`amount` integer NOT NULL,
	`currency` text NOT NULL,
	`paidByMemberId` text,
	`eventId` text NOT NULL,
	PRIMARY KEY(`eventId`, `paidByMemberId`),
	FOREIGN KEY (`paidByMemberId`) REFERENCES `RoomMember`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Room` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`title` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `RoomCurrencyRate` (
	`roomId` text NOT NULL,
	`toCurrency` text NOT NULL,
	`currency` text NOT NULL,
	`rate` real NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`currency`, `roomId`, `toCurrency`),
	FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `RoomMember` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`roomId` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`userId` text,
	FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`secret` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `User_secret_unique` ON `User` (`secret`);