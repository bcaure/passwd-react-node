-- MariaDB 11.8 schema for local development
-- Compatible with the passwd Node.js backend

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
  `mdp` varchar(50) NOT NULL,
  `id_site` int(11) NOT NULL,
  `user` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_compte_site` (`id_site`),
  KEY `fk_user_compte` (`user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user` (
  `login` varchar(20) NOT NULL,
  `password` varchar(1000) NOT NULL,
  `date_quota` date NOT NULL,
  `used_quota` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`login`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `site` (`id`, `url`, `libelle`) VALUES
(297, 'https://ftp://ftp.0fees.net', '0fees'),
(298, 'https://www.centpourcentpiste.com/', '100% piste forum'),
(299, 'http://www.3suisses.fr', '3 Suisses'),
(300, 'https://www.abc-tabs.com', 'ABC Tabs'),
(301, 'https://www.adobe.com', 'Adobe'),
(302, 'https://www.ag2rlamondiale.fr', 'AG2R mutuelle'),
(303, 'https://www.akr-performance.fr', 'AKR Performance'),
(304, 'https://aliexpress.com', 'AliExpress'),
(305, 'www.eallianz.fr', 'Allianz')
ON DUPLICATE KEY UPDATE `url` = VALUES(`url`), `libelle` = VALUES(`libelle`);

INSERT INTO `compte` (`id`, `login`, `mdp`, `id_site`, `user`) VALUES
(187, 'fees0_2798528', 'azeqsd11', 297, 'ben'),
(188, 'pjben', 'azeqsd1&', 298, 'ben'),
(189, 'bcaure@netcourrier.com', 'azeqsd1&', 299, 'ben'),
(190, 'pjben', 'azeqsd1&', 300, 'ben'),
(191, 'bcaure@gmail.com', 'azeqsd1&', 301, 'ben'),
(192, 'r8w7ud', 'azeqsd1&', 302, 'delphine'),
(193, 'bcaure@gmail.com', 'azeqsd1&', 303, 'ben'),
(194, 'bcaure@gmail.com', 'azeqsd11', 304, 'ben'),
(195, 'bcaure@gmail.com', 'azeqsd11', 305, 'ben')
ON DUPLICATE KEY UPDATE `login` = VALUES(`login`), `mdp` = VALUES(`mdp`), `id_site` = VALUES(`id_site`), `user` = VALUES(`user`);

INSERT INTO `user` (`login`, `password`, `date_quota`, `used_quota`) VALUES
('ben', '$2a$10$foQevN/YkvcUWvtZYfUI/u2P.QS4U.79X3D1ALKm/E8sNPwi41IgC', '2010-08-19', 6),
('delphine', '$2a$10$f0kEE7BSc9AD23RFDLKm1ez4sxwiH8DI19CEL/PhAdnWcM/I9d85O', '2016-03-20', 3)
ON DUPLICATE KEY UPDATE `password` = VALUES(`password`), `date_quota` = VALUES(`date_quota`), `used_quota` = VALUES(`used_quota`);
