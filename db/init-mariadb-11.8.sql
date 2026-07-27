-- MariaDB 11.8 schema for local development
-- Compatible with the passwd Node.js backend
-- Seed data below is intentionally fake (example.dev) — not real credentials.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `passwd` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `passwd`;

CREATE TABLE IF NOT EXISTS `site` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(200) DEFAULT NULL,
  `libelle` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `compte` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `login` varchar(50) NOT NULL,
  `mdp` varchar(500) NOT NULL,
  `id_site` int(11) NOT NULL,
  `user` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_compte_site` (`id_site`),
  KEY `fk_user_compte` (`user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user` (
  `login` varchar(20) NOT NULL,
  `password` varchar(1000) NOT NULL,
  `date_quota` date DEFAULT NULL,
  `used_quota` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`login`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `site` (`id`, `url`, `libelle`) VALUES
(1, 'https://example.dev/shop', 'Example Shop'),
(2, 'https://example.dev/forum', 'Demo Forum'),
(3, 'https://example.dev/store', 'Fake Store'),
(4, 'https://example.dev/tabs', 'Sample Tabs'),
(5, 'https://example.dev/vendor', 'Mock Vendor'),
(6, 'https://example.dev/mutuelle', 'Test Mutuelle'),
(7, 'https://example.dev/parts', 'Dummy Parts'),
(8, 'https://example.dev/mall', 'Placeholder Mall'),
(9, 'https://example.dev/insurance', 'Fixture Insurance')
ON DUPLICATE KEY UPDATE `url` = VALUES(`url`), `libelle` = VALUES(`libelle`);

INSERT INTO `compte` (`id`, `login`, `mdp`, `id_site`, `user`) VALUES
(1, 'demo_user_1', 'fake-service-password-1', 1, 'devuser'),
(2, 'demo_user_2', 'fake-service-password-2', 2, 'devuser'),
(3, 'user@example.dev', 'fake-service-password-3', 3, 'devuser'),
(4, 'demo_user_4', 'fake-service-password-4', 4, 'devuser'),
(5, 'user@example.dev', 'fake-service-password-5', 5, 'devuser'),
(6, 'demo_user_6', 'fake-service-password-6', 6, 'devuser2'),
(7, 'user@example.dev', 'fake-service-password-7', 7, 'devuser'),
(8, 'user@example.dev', 'fake-service-password-8', 8, 'devuser'),
(9, 'user@example.dev', 'fake-service-password-9', 9, 'devuser')
ON DUPLICATE KEY UPDATE `login` = VALUES(`login`), `mdp` = VALUES(`mdp`), `id_site` = VALUES(`id_site`), `user` = VALUES(`user`);

INSERT INTO `user` (`login`, `password`, `date_quota`, `used_quota`) VALUES
('devuser', '$2b$10$UVxidTZ7WPlLeRrvPxSDSuNK60Febw1Z7iyUS1L95DdNLXoNFTd0O', NULL, 0),
('devuser2', '$2b$10$UVxidTZ7WPlLeRrvPxSDSuNK60Febw1Z7iyUS1L95DdNLXoNFTd0O', NULL, 0)
ON DUPLICATE KEY UPDATE `password` = VALUES(`password`), `date_quota` = VALUES(`date_quota`), `used_quota` = VALUES(`used_quota`);
