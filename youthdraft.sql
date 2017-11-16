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
-- Table structure for table `coachPastDivisions`
--

DROP TABLE IF EXISTS `coachPastDivisions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `coachPastDivisions` (
  `coachId` binary(16) NOT NULL,
  `division` varchar(8) NOT NULL,
  `createdAt` varchar(45) DEFAULT NULL,
  `updatedAt` varchar(45) DEFAULT NULL,
  KEY `fk_coachPastDivisions_coaches1_idx` (`coachId`),
  KEY `fk_coachPastDivisions_divisions1_idx` (`division`),
  CONSTRAINT `fk_coachPastDivisions_coaches1` FOREIGN KEY (`coachId`) REFERENCES `coaches` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_coachPastDivisions_divisions1` FOREIGN KEY (`division`) REFERENCES `divisions` (`type`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coachPastDivisions`
--

LOCK TABLES `coachPastDivisions` WRITE;
/*!40000 ALTER TABLE `coachPastDivisions` DISABLE KEYS */;
INSERT INTO `coachPastDivisions` VALUES ('h’,¿ ≤Áã%—/t	/Ô','AAA','2017-11-16 01:42:07','2017-11-16 01:42:07'),('h’,¿ ≤Áã%—/t	/Ô','AA','2017-11-16 01:42:07','2017-11-16 01:42:07'),('h’,¿ ≤Áã%—/t	/Ô','A','2017-11-16 01:42:07','2017-11-16 01:42:07'),('¶¡÷\0 ≤Áã%—/t	/Ô','AAA','2017-11-16 01:43:50','2017-11-16 01:43:50'),('¶¡÷\0 ≤Áã%—/t	/Ô','AA','2017-11-16 01:43:50','2017-11-16 01:43:50'),('¶¡÷\0 ≤Áã%—/t	/Ô','TEEBALL','2017-11-16 01:43:50','2017-11-16 01:43:50');
/*!40000 ALTER TABLE `coachPastDivisions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coaches`
--

DROP TABLE IF EXISTS `coaches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `coaches` (
  `id` binary(16) NOT NULL,
  `leagueId` binary(16) NOT NULL,
  `division` varchar(8) NOT NULL,
  `firstName` varchar(45) DEFAULT NULL,
  `lastName` varchar(45) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `city` varchar(45) DEFAULT NULL,
  `state` varchar(45) DEFAULT NULL,
  `phoneNumber` varchar(12) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `pastLeague` varchar(255) DEFAULT NULL,
  `yearsExperience` tinyint(4) DEFAULT NULL,
  `validated` tinyint(1) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQUE_INDEX` (`email`,`leagueId`),
  KEY `fk_coaches_leagues1_idx` (`leagueId`),
  KEY `fk_coaches_divisions1_idx` (`division`),
  CONSTRAINT `fk_coaches_divisions1` FOREIGN KEY (`division`) REFERENCES `divisions` (`type`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_coaches_leagues1` FOREIGN KEY (`leagueId`) REFERENCES `leagues` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coaches`
--

LOCK TABLES `coaches` WRITE;
/*!40000 ALTER TABLE `coaches` DISABLE KEYS */;
INSERT INTO `coaches` VALUES ('h’,¿ ≤Áã%—/t	/Ô','Puô` xÁä-q›◊¸»\Z','aaa','Mahs','Bash','mehs@mell.com','Dallas','Texas','918-281-4832','$2a$10$ScbUyWYQTClh8umbYR58MOG2gbr61tVViIOJBKJWAAjsJHe3Q9auu','',0,1,'2017-11-16 01:42:07','2017-11-16 01:47:34'),('¶¡÷\0 ≤Áã%—/t	/Ô','Puô` xÁä-q›◊¸»\Z','aa','Gosh','Darnit','Gosh@gmail.com','Dallas','Texas','918-281-4832','$2a$10$wAeSldokcGthILwHVmTuSemECD0occ/HSTz1omBmzst/bDG87FLf.','',0,1,'2017-11-16 01:43:50','2017-11-16 01:47:49');
/*!40000 ALTER TABLE `coaches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `divisions`
--

DROP TABLE IF EXISTS `divisions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `divisions` (
  `type` varchar(8) NOT NULL,
  PRIMARY KEY (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `divisions`
--

LOCK TABLES `divisions` WRITE;
/*!40000 ALTER TABLE `divisions` DISABLE KEYS */;
INSERT INTO `divisions` VALUES ('a'),('aa'),('aaa'),('farm'),('majors'),('rookie'),('teeball');
/*!40000 ALTER TABLE `divisions` ENABLE KEYS */;
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
  `title` varchar(45) DEFAULT NULL,
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
INSERT INTO `formulas` VALUES ('w¬\0 ∏Á±T\'’È,c’','Puô` xÁä-q›◊¸»\Z','¶¡÷\0 ≤Áã%—/t	/Ô','Infielder',5,8,3,3,5,6,8,15,8,3,'2017-11-16 02:22:15','2017-11-16 02:22:15'),('®JP ∏Á±T\'’È,c’','Puô` xÁä-q›◊¸»\Z','¶¡÷\0 ≤Áã%—/t	/Ô','Batter',12,12,12,3,5,6,8,15,8,3,'2017-11-16 02:22:34','2017-11-16 02:22:34'),('πP– ∂Á´ÅõÉæ\n•','Puô` xÁä-q›◊¸»\Z','¶¡÷\0 ≤Áã%—/t	/Ô','Pitcher',3,6,8,3,5,6,8,3,8,3,'2017-11-16 02:12:59','2017-11-16 02:20:18'),('Ìb|ê ∑Á±T\'’È,c’','Puô` xÁä-q›◊¸»\Z','¶¡÷\0 ≤Áã%—/t	/Ô','Clutch Hitter',15,15,15,3,5,6,8,3,8,3,'2017-11-16 02:21:36','2017-11-16 02:21:36'),('ˇ“Ú ∑Á±T\'’È,c’','Puô` xÁä-q›◊¸»\Z','¶¡÷\0 ≤Áã%—/t	/Ô','Outfielder',5,8,3,3,5,6,8,15,8,3,'2017-11-16 02:22:07','2017-11-16 02:22:07');
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
INSERT INTO `leagues` VALUES ('Puô` xÁä-q›◊¸»\Z','Rivercats','moo@moo.com','$2a$10$xOxAX.WzJjH0V5MJzPbvWOvXvrxOvq3o9BvlC2QmFr/LuHLoXFTPW','Bob','Ross','123-456-7890','Mehicos','CA',1,'2017-11-15 18:46:15','2017-11-15 23:43:08');
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
  `division` varchar(8) NOT NULL,
  `parentFirstName` varchar(45) DEFAULT NULL,
  `parentLastName` varchar(45) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_players_leagues1_idx` (`leagueId`),
  KEY `fk_players_divisions1_idx` (`division`),
  KEY `fk_players_teams1` (`teamId`),
  CONSTRAINT `fk_players_divisions1` FOREIGN KEY (`division`) REFERENCES `divisions` (`type`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_players_leagues1` FOREIGN KEY (`leagueId`) REFERENCES `leagues` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_players_teams1` FOREIGN KEY (`teamId`) REFERENCES `teams` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `players`
--

LOCK TABLES `players` WRITE;
/*!40000 ALTER TABLE `players` DISABLE KEYS */;
INSERT INTO `players` VALUES (',√† ∂Á´ÅõÉæ\n•','Puô` xÁä-q›◊¸»\Z','$¬¨  ¢Áë&ª≥0¬Æ≠','Simon','Cowell','54','2005-05-22',13,'932-843-2394','marice@gmai.com',1,0,0,'aa','Marice','Bessi','2017-11-16 02:08:14','2017-11-16 02:08:14'),('∏Yæp µÁ´ÅõÉæ\n•','Puô` xÁä-q›◊¸»\Z','-M ¢Áë&ª≥0¬Æ≠','Gray','Sue','15','2001-03-25',16,'932-843-2394','tom@tom.com',1,0,0,'aaa','Mary','Sue','2017-11-16 02:05:48','2017-11-16 02:05:48'),('’p µÁ´ÅõÉæ\n•','Puô` xÁä-q›◊¸»\Z','-M ¢Áë&ª≥0¬Æ≠','Bob','White','12','2003-05-22',14,'932-843-2394','walter@gmail.com',1,0,0,'aaa','Walter','White','2017-11-16 02:06:37','2017-11-16 02:06:37');
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
  `throwingMechanicsNotes` varchar(1000) DEFAULT NULL,
  `armStrength` tinyint(4) DEFAULT NULL,
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
  `division` varchar(8) NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_playerYearlyStat_coaches1_idx` (`coachId`),
  KEY `fk_playerYearlyStat_teams1_idx` (`teamId`),
  KEY `fk_stats_divisions1_idx` (`division`),
  KEY `fk_playerYearlyStat_players1` (`playerId`),
  CONSTRAINT `fk_playerYearlyStat_coaches1` FOREIGN KEY (`coachId`) REFERENCES `coaches` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_playerYearlyStat_players1` FOREIGN KEY (`playerId`) REFERENCES `players` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_playerYearlyStat_teams1` FOREIGN KEY (`teamId`) REFERENCES `teams` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_stats_divisions1` FOREIGN KEY (`division`) REFERENCES `divisions` (`type`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stats`
--

LOCK TABLES `stats` WRITE;
/*!40000 ALTER TABLE `stats` DISABLE KEYS */;
INSERT INTO `stats` VALUES (',ò†P πÁ±T\'’È,c’','∏Yæp µÁ´ÅõÉæ\n•','h’,¿ ≤Áã%—/t	/Ô','-M ¢Áë&ª≥0¬Æ≠',3,'Very bad mechanics',6,'Good speed',8,'Very Good contact somehow',3,'Bad mechanics',5,'Decent arm strength',6,'Above average accuracy',8,'Good hussle',3,'But can\'t catch pop flys',8,'Runs well',3,'Slow as heck','aaa','2017-11-16 02:30:32','2017-11-16 02:30:32'),('2∞à@ πÁ±T\'’È,c’','∏Yæp µÁ´ÅõÉæ\n•','h’,¿ ≤Áã%—/t	/Ô','-M ¢Áë&ª≥0¬Æ≠',3,'Very bad mechanics',6,'Good speed',8,'Very Good contact somehow',3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'aaa','2017-11-16 02:30:42','2017-11-16 02:30:42'),('å|Ç  πÁ±T\'’È,c’','’p µÁ´ÅõÉæ\n•','h’,¿ ≤Áã%—/t	/Ô','-M ¢Áë&ª≥0¬Æ≠',5,'Okay mechanics',9,'Amazing speed',7,'Pretty good contact',7,'Could be a decent pitcher',8,'Very nice arm strength',6,'Above average accuracy',8,'Good hussle',8,'Very good awareness of the feild',8,'Runs well',7,'Pretty fast','aaa','2017-11-16 02:33:13','2017-11-16 02:33:13'),('íÏ√@ πÁ±T\'’È,c’','’p µÁ´ÅõÉæ\n•','h’,¿ ≤Áã%—/t	/Ô','-M ¢Áë&ª≥0¬Æ≠',5,'Okay mechanics',9,'Amazing speed',7,'Pretty good contact',7,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,7,'Pretty fast','aaa','2017-11-16 02:33:24','2017-11-16 02:33:24'),('órÁ† πÁ±T\'’È,c’','’p µÁ´ÅõÉæ\n•','h’,¿ ≤Áã%—/t	/Ô','-M ¢Áë&ª≥0¬Æ≠',5,'Okay mechanics',9,'Amazing speed',7,'Pretty good contact',7,'Could be a decent pitcher',8,'Very nice arm strength',6,'Above average accuracy',8,'Good hussle',8,'Very good awareness of the feild',8,'Runs well',7,'Pretty fast','aaa','2017-11-16 02:33:31','2017-11-16 02:33:31'),('¢D£ê ∏Á±T\'’È,c’',',√† ∂Á´ÅõÉæ\n•','¶¡÷\0 ≤Áã%—/t	/Ô','$¬¨  ¢Áë&ª≥0¬Æ≠',3,'Very bad mechanics',6,'Good speed',8,'Very Good contact somehow',3,'Bad mechanics',5,'Decent arm strength',6,'Above average accuracy',8,'Good hussle',3,'But can\'t catch pop flys',8,'Runs well',3,'Slow as heck','aaa','2017-11-16 02:26:40','2017-11-16 02:26:40'),('¨N\0 ∏Á±T\'’È,c’',',√† ∂Á´ÅõÉæ\n•','¶¡÷\0 ≤Áã%—/t	/Ô','$¬¨  ¢Áë&ª≥0¬Æ≠',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,'But can\'t catch pop flys',8,'Runs well',3,'Slow as heck','aa','2017-11-16 02:26:57','2017-11-16 02:26:57');
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
  `division` varchar(8) NOT NULL,
  `leagueId` binary(16) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_teams_leagues1_idx` (`leagueId`),
  KEY `unique_id` (`leagueId`,`name`,`division`),
  KEY `fk_teams_divisions1_idx` (`division`),
  CONSTRAINT `fk_teams_divisions1` FOREIGN KEY (`division`) REFERENCES `divisions` (`type`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_teams_leagues1` FOREIGN KEY (`leagueId`) REFERENCES `leagues` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES ('-M ¢Áë&ª≥0¬Æ≠','aaa','Puô` xÁä-q›◊¸»\Z','Astros niners','2017-11-15 23:45:16','2017-11-15 23:45:16'),('$¬¨  ¢Áë&ª≥0¬Æ≠','aa','Puô` xÁä-q›◊¸»\Z','Athletics','2017-11-15 23:45:40','2017-11-15 23:45:40');
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
  `address` varchar(255) DEFAULT NULL,
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
INSERT INTO `tryouts` VALUES ('ù÷\\ üÁÅ≠∞9è¨∞','Puô` xÁä-q›◊¸»\Z','2017-12-05 00:00:00','2215 Mine Street, Mine CA 95835','2017-11-15 23:23:51','2017-11-15 23:23:51'),('ùÿ“ üÁÅ≠∞9è¨∞','Puô` xÁä-q›◊¸»\Z','2017-12-08 00:00:00','2215 Mine Street, Mine CA 95835','2017-11-15 23:23:51','2017-11-15 23:23:51');
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

-- Dump completed on 2017-11-16  2:40:03
