CREATE DATABASE  IF NOT EXISTS `youthdraft` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `youthdraft`;
-- MySQL dump 10.13  Distrib 5.6.13, for osx10.6 (i386)
--
-- Host: 127.0.0.1    Database: youthdraft
-- ------------------------------------------------------
-- Server version	5.6.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `coaches`
--

DROP TABLE IF EXISTS `coaches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `coaches` (
  `id` binary(16) NOT NULL,
  `leagueId` binary(16) NOT NULL,
  `firstName` varchar(45) DEFAULT NULL,
  `lastName` varchar(45) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `city` varchar(45) DEFAULT NULL,
  `state` varchar(45) DEFAULT NULL,
  `division` varchar(10) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(12) DEFAULT NULL,
  `validated` tinyint(1) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQUE_INDEX` (`email`,`leagueId`),
  KEY `fk_coaches_leagues1_idx` (`leagueId`),
  CONSTRAINT `fk_coaches_leagues1` FOREIGN KEY (`leagueId`) REFERENCES `leagues` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coaches`
--

LOCK TABLES `coaches` WRITE;
/*!40000 ALTER TABLE `coaches` DISABLE KEYS */;
/*!40000 ALTER TABLE `coaches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `formulas`
--

DROP TABLE IF EXISTS `formulas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `formulas` (
  `id` binary(16) NOT NULL,
  `leagueId` binary(16) NOT NULL,
  `coachId` binary(16) NOT NULL,
  `hittingMechanics` tinyint(4) DEFAULT NULL,
  `batSpeed` tinyint(4) DEFAULT NULL,
  `batContact` tinyint(4) DEFAULT NULL,
  `throwingMechanics` tinyint(4) DEFAULT NULL,
  `armStrength` tinyint(4) DEFAULT NULL,
  `armAccuracy` tinyint(4) DEFAULT NULL,
  `inField` tinyint(4) DEFAULT NULL,
  `outField` tinyint(4) DEFAULT NULL,
  `baserunMechanics` tinyint(4) DEFAULT NULL,
  `baserunSpeed` tinyint(4) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_coachFormulas_leagues1_idx` (`leagueId`),
  KEY `fk_coachFormulas_coaches1_idx` (`coachId`),
  CONSTRAINT `fk_coachFormulas_coaches1` FOREIGN KEY (`coachId`) REFERENCES `coaches` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_coachFormulas_leagues1` FOREIGN KEY (`leagueId`) REFERENCES `leagues` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `formulas`
--

LOCK TABLES `formulas` WRITE;
/*!40000 ALTER TABLE `formulas` DISABLE KEYS */;
/*!40000 ALTER TABLE `formulas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leagues`
--

DROP TABLE IF EXISTS `leagues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `leagues` (
  `id` binary(16) NOT NULL,
  `leagueName` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `firstName` varchar(45) DEFAULT NULL,
  `lastName` varchar(45) DEFAULT NULL,
  `phoneNumber` varchar(12) DEFAULT NULL,
  `city` varchar(45) DEFAULT NULL,
  `state` varchar(45) DEFAULT NULL,
  `isLive` tinyint(1) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQUE_INDEX` (`leagueName`,`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leagues`
--

LOCK TABLES `leagues` WRITE;
/*!40000 ALTER TABLE `leagues` DISABLE KEYS */;
/*!40000 ALTER TABLE `leagues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `players`
--

DROP TABLE IF EXISTS `players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `players` (
  `id` binary(16) NOT NULL,
  `leagueId` binary(16) NOT NULL,
  `teamId` binary(16) NOT NULL,
  `firstName` varchar(45) DEFAULT NULL,
  `lastName` varchar(45) DEFAULT NULL,
  `teamNumber` varchar(45) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `leagueAge` tinyint(4) DEFAULT NULL,
  `phoneNumber` varchar(12) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `pitcher` tinyint(1) DEFAULT NULL,
  `catcher` tinyint(1) DEFAULT NULL,
  `coachsKid` tinyint(1) DEFAULT NULL,
  `division` varchar(10) DEFAULT NULL,
  `parentFirstName` varchar(45) DEFAULT NULL,
  `parentLastName` varchar(45) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_players_leagues1_idx` (`leagueId`),
  KEY `unique_id` (`teamId`,`leagueId`,`teamNumber`),
  CONSTRAINT `fk_players_leagues1` FOREIGN KEY (`leagueId`) REFERENCES `leagues` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_players_teams1` FOREIGN KEY (`teamId`) REFERENCES `teams` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `players`
--

LOCK TABLES `players` WRITE;
/*!40000 ALTER TABLE `players` DISABLE KEYS */;
/*!40000 ALTER TABLE `players` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stats`
--

DROP TABLE IF EXISTS `stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stats` (
  `id` binary(16) NOT NULL,
  `playerId` binary(16) NOT NULL,
  `coachId` binary(16) NOT NULL,
  `teamId` binary(16) NOT NULL,
  `hittingMechanics` tinyint(4) DEFAULT NULL,
  `hittingMechanicsNotes` varchar(1000) DEFAULT NULL,
  `batSpeed` tinyint(4) DEFAULT NULL,
  `batSpeedNotes` varchar(1000) DEFAULT NULL,
  `batContact` tinyint(4) DEFAULT NULL,
  `batContactNotes` varchar(1000) DEFAULT NULL,
  `throwingMechanics` tinyint(4) DEFAULT NULL,
  `throwingMechanicsNotes` tinyint(4) DEFAULT NULL,
  `armStrength` varchar(1000) DEFAULT NULL,
  `armStrengthNotes` varchar(1000) DEFAULT NULL,
  `armAccuracy` tinyint(4) DEFAULT NULL,
  `armAccuracyNotes` varchar(1000) DEFAULT NULL,
  `inField` tinyint(4) DEFAULT NULL,
  `inFieldNotes` varchar(1000) DEFAULT NULL,
  `outField` tinyint(4) DEFAULT NULL,
  `outFieldNotes` varchar(1000) DEFAULT NULL,
  `baserunMechanics` tinyint(4) DEFAULT NULL,
  `baserunMechanicsNotes` varchar(1000) DEFAULT NULL,
  `baserunSpeed` tinyint(4) DEFAULT NULL,
  `baserunSpeedNotes` varchar(1000) DEFAULT NULL,
  `division` varchar(45) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_playerYearlyStat_coaches1_idx` (`coachId`),
  KEY `fk_playerYearlyStat_teams1_idx` (`teamId`),
  KEY `fk_playerYearlyStat_players1` (`playerId`),
  CONSTRAINT `fk_playerYearlyStat_coaches1` FOREIGN KEY (`coachId`) REFERENCES `coaches` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_playerYearlyStat_players1` FOREIGN KEY (`playerId`) REFERENCES `players` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_playerYearlyStat_teams1` FOREIGN KEY (`teamId`) REFERENCES `teams` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stats`
--

LOCK TABLES `stats` WRITE;
/*!40000 ALTER TABLE `stats` DISABLE KEYS */;
/*!40000 ALTER TABLE `stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teams` (
  `id` binary(16) NOT NULL,
  `leagueId` binary(16) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `division` varchar(10) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_teams_leagues1_idx` (`leagueId`),
  KEY `unique_id` (`leagueId`,`division`,`name`),
  CONSTRAINT `fk_teams_leagues1` FOREIGN KEY (`leagueId`) REFERENCES `leagues` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tryouts`
--

DROP TABLE IF EXISTS `tryouts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tryouts` (
  `id` binary(16) NOT NULL,
  `leagueId` binary(16) NOT NULL,
  `date` datetime DEFAULT NULL,
  `address` varchar(45) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_tryouts_leagues1_idx` (`leagueId`),
  CONSTRAINT `fk_tryouts_leagues1` FOREIGN KEY (`leagueId`) REFERENCES `leagues` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tryouts`
--

LOCK TABLES `tryouts` WRITE;
/*!40000 ALTER TABLE `tryouts` DISABLE KEYS */;
/*!40000 ALTER TABLE `tryouts` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-11-06  4:03:38
