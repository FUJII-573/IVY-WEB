CREATE TABLE `requisitions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeName` varchar(255) NOT NULL,
	`items` text NOT NULL,
	`totalAmount` int NOT NULL,
	`note` text,
	`status` enum('pending','approved','completed','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `requisitions_id` PRIMARY KEY(`id`)
);
