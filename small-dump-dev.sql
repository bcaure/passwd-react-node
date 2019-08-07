-- phpMyAdmin SQL Dump
-- version 4.7.9
-- https://www.phpmyadmin.net/
--
-- Host: mysql-cgicertif.alwaysdata.net
-- Generation Time: Jul 29, 2019 at 10:27 PM
-- Server version: 10.1.31-MariaDB
-- PHP Version: 7.2.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cgicertif_mydb`
--
CREATE DATABASE IF NOT EXISTS `cgicertif_mydb` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `cgicertif_mydb`;

-- --------------------------------------------------------

--
-- Table structure for table `compte`
--

CREATE TABLE `compte` (
  `id` int(11) NOT NULL,
  `login` varchar(50) NOT NULL,
  `mdp` varchar(50) NOT NULL,
  `id_site` int(11) NOT NULL,
  `user` varchar(20) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `compte`
--

INSERT INTO `compte` (`id`, `login`, `mdp`, `id_site`, `user`) VALUES
(187, 'fees0_2798528', 'azeqsd11', 297, 'ben'),
(188, 'pjben', 'azeqsd1&', 298, 'ben'),
(189, 'bcaure@netcourrier.com', 'azeqsd1&', 299, 'ben'),
(190, 'pjben', 'azeqsd1&', 300, 'ben'),
(191, 'bcaure@gmail.com', 'azeqsd1&', 301, 'ben'),
(192, 'r8w7ud', 'azeqsd1&', 302, 'delphine'),
(193, 'bcaure@gmail.com', 'azeqsd1&', 303, 'ben'),
(194, 'bcaure@gmail.com', 'azeqsd11', 304, 'ben'),
(195, 'bcaure@gmail.com', 'azeqsd11', 305, 'ben');


CREATE TABLE `password` (
  `login` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `label` varchar(50) NOT NULL DEFAULT '',
  `url` varchar(200) DEFAULT NULL,
  `user` varchar(20) NOT NULL DEFAULT 'ben'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
-- --------------------------------------------------------

--
-- Table structure for table `site`
--

CREATE TABLE `site` (
  `id` int(11) NOT NULL,
  `url` varchar(200) DEFAULT NULL,
  `libelle` varchar(50) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `site`
--

INSERT INTO `site` (`id`, `url`, `libelle`) VALUES
(297, 'https://ftp://ftp.0fees.net', '0fees'),
(298, 'https://www.centpourcentpiste.com/', '100% piste forum'),
(299, 'http://www.3suisses.fr', '3 Suisses'),
(300, 'https://www.abc-tabs.com', 'ABC Tabs'),
(301, 'https://www.adobe.com', 'Adobe'),
(302, 'https://www.ag2rlamondiale.fr', 'AG2R mutuelle'),
(303, 'https://www.akr-performance.fr', 'AKR Performance'),
(304, 'https://aliexpress.com', 'AliExpress'),
(305, 'www.eallianz.fr', 'Allianz');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `login` varchar(20) NOT NULL,
  `password` varchar(1000) NOT NULL,
  `date_quota` date NOT NULL,
  `used_quota` int(11) NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`login`, `password`, `date_quota`, `used_quota`) VALUES
('ben', '$2a$10$foQevN/YkvcUWvtZYfUI/u2P.QS4U.79X3D1ALKm/E8sNPwi41IgC', '2010-08-19', 6),
('delphine', '$2a$10$f0kEE7BSc9AD23RFDLKm1ez4sxwiH8DI19CEL/PhAdnWcM/I9d85O', '2016-03-20', 3);

--
-- Indexes for table `compte`
--
ALTER TABLE `compte`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_compte_site` (`id_site`),
  ADD KEY `fk_user_compte` (`user`);
--
-- Indexes for table `site`
--
ALTER TABLE `site`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`login`);

--
-- AUTO_INCREMENT for table `compte`
--
ALTER TABLE `compte`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=456;

--
-- AUTO_INCREMENT for table `site`
--
ALTER TABLE `site`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=566;

--
-- Constraints for dumped tables
--



/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
