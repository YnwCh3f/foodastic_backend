-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2025. Ápr 04. 10:15
-- Kiszolgáló verziója: 10.4.6-MariaDB
-- PHP verzió: 7.3.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `foodastic`
--
CREATE DATABASE IF NOT EXISTS `foodastic` DEFAULT CHARACTER SET utf8 COLLATE utf8_hungarian_ci;
USE `foodastic`;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `allergens`
--

CREATE TABLE `allergens` (
  `food_id` int(11) NOT NULL,
  `gluten` tinyint(1) NOT NULL,
  `lactose` tinyint(1) NOT NULL,
  `nuts` tinyint(1) NOT NULL,
  `fish` tinyint(1) NOT NULL,
  `egg` tinyint(1) NOT NULL,
  `soy` tinyint(1) NOT NULL,
  `mollusk` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `allergens`
--

INSERT INTO `allergens` (`food_id`, `gluten`, `lactose`, `nuts`, `fish`, `egg`, `soy`, `mollusk`) VALUES
(1, 0, 1, 0, 0, 1, 0, 1),
(2, 1, 0, 1, 0, 0, 1, 0),
(3, 0, 0, 0, 1, 1, 0, 0),
(4, 1, 1, 0, 0, 0, 1, 1),
(5, 0, 1, 1, 1, 0, 0, 0),
(6, 1, 0, 0, 0, 1, 1, 1),
(7, 0, 0, 1, 1, 0, 1, 0),
(8, 1, 1, 0, 0, 1, 0, 1),
(9, 0, 0, 1, 1, 0, 0, 1),
(10, 1, 1, 1, 0, 1, 1, 0);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `cart`
--

CREATE TABLE `cart` (
  `cart_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `food_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `chats`
--

CREATE TABLE `chats` (
  `chat_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `recipient_id` int(11) NOT NULL,
  `message` text COLLATE utf8_hungarian_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `foods`
--

CREATE TABLE `foods` (
  `food_id` int(11) NOT NULL,
  `name` varchar(32) COLLATE utf8_hungarian_ci NOT NULL,
  `price` int(11) NOT NULL,
  `image` tinytext COLLATE utf8_hungarian_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `foods`
--

INSERT INTO `foods` (`food_id`, `name`, `price`, `image`) VALUES
(1, 'Margherita Pizza', 3490, 'https://caitsplate.com/wp-core/wp-content/uploads/2020/04/IMG_0078-300x300.jpg'),
(2, 'Cheeseburger', 2990, 'https://www.kitchensanctuary.com/wp-content/uploads/2021/05/Double-Cheeseburger-square-FS-42-300x300.jpg'),
(3, 'Caesar Salad', 2590, 'https://www.noracooks.com/wp-content/uploads/2022/06/vegan-caesar-salad-4-300x300.jpg'),
(4, 'Spaghetti Carbonara', 3790, 'https://www.tasteofhome.com/wp-content/uploads/2018/01/exps8879_QC2785C59A-3.jpg'),
(5, 'Grilled Salmon', 4890, 'https://res.cloudinary.com/hksqkdlah/image/upload/ar_1:1,c_fill,dpr_2.0,f_auto,fl_lossy.progressive.strip_profile,g_faces:auto,q_auto:low,w_150/41765-sfs-grilled-salmon-10664'),
(6, 'Chicken Tikka Masala', 4190, 'https://www.kitchensanctuary.com/wp-content/uploads/2019/09/Chicken-Tikka-Masala-square-FS-51-300x300.jpg.webp'),
(7, 'Sushi Platter', 5790, 'https://images.squarespace-cdn.com/content/v1/5021287084ae954efd31e9f4/1607482720127-ODLTGIEZG0DY4PHQ614O/F0671251-453B-44FE-8625-00E6FB2E9222?format=300w'),
(8, 'Vegetable Stir Fry', 2890, 'https://www.maryswholelife.com/wp-content/uploads/2022/03/Pad_Pak_05-300x300.jpg'),
(9, 'BBQ Ribs', 5290, 'https://indianakitchen.com/wp-content/uploads/2015/03/st.louis_.jpg'),
(10, 'Chocolate Lava Cake', 2390, 'https://www.livewellbakeoften.com/wp-content/uploads/2017/01/Molten-Chocolate-Lava-Cakes-for-Two-4-300x300-1.jpg');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `nutritions`
--

CREATE TABLE `nutritions` (
  `nutrition_id` int(11) NOT NULL,
  `food_id` int(11) NOT NULL,
  `kcal` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `nutritions`
--

INSERT INTO `nutritions` (`nutrition_id`, `food_id`, `kcal`) VALUES
(2, 1, 745),
(3, 2, 612),
(4, 3, 890),
(5, 4, 530),
(6, 5, 978),
(7, 6, 450),
(8, 7, 820),
(9, 8, 670),
(10, 9, 915),
(11, 10, 590);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `restaurants`
--

CREATE TABLE `restaurants` (
  `restaurant_id` int(11) NOT NULL,
  `restaurant_name` varchar(20) COLLATE utf8_hungarian_ci NOT NULL,
  `restaurant_picture` text COLLATE utf8_hungarian_ci NOT NULL,
  `restaurant_address` varchar(32) COLLATE utf8_hungarian_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `restaurants`
--

INSERT INTO `restaurants` (`restaurant_id`, `restaurant_name`, `restaurant_picture`, `restaurant_address`) VALUES
(1, 'The Gourmet Spot', 'https://s3-eu-west-1.amazonaws.com/wijnspijs/images/height300/harbour-house-bristol.jpeg', '123 Main St, City'),
(2, 'Urban Bites', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/53/ce/70/dinerbon-restaurant-pomphuis.jpg?w=500&h=300&s=1', '456 Elm St, City'),
(3, 'Cozy Corner Cafe', 'https://s3-eu-west-1.amazonaws.com/wijnspijs/images/height300/restaurant:maison-by-glaschu.jpg', '789 Oak St, City');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `first_name` varchar(16) COLLATE utf8_hungarian_ci NOT NULL,
  `last_name` varchar(16) COLLATE utf8_hungarian_ci NOT NULL,
  `email` varchar(20) COLLATE utf8_hungarian_ci NOT NULL,
  `password` varchar(16) COLLATE utf8_hungarian_ci NOT NULL,
  `profile_picture` varchar(30) COLLATE utf8_hungarian_ci NOT NULL,
  `points` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`cart_id`);

--
-- A tábla indexei `chats`
--
ALTER TABLE `chats`
  ADD PRIMARY KEY (`chat_id`);

--
-- A tábla indexei `foods`
--
ALTER TABLE `foods`
  ADD PRIMARY KEY (`food_id`);

--
-- A tábla indexei `nutritions`
--
ALTER TABLE `nutritions`
  ADD PRIMARY KEY (`nutrition_id`);

--
-- A tábla indexei `restaurants`
--
ALTER TABLE `restaurants`
  ADD PRIMARY KEY (`restaurant_id`);

--
-- A tábla indexei `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `cart`
--
ALTER TABLE `cart`
  MODIFY `cart_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `chats`
--
ALTER TABLE `chats`
  MODIFY `chat_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `foods`
--
ALTER TABLE `foods`
  MODIFY `food_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT a táblához `nutritions`
--
ALTER TABLE `nutritions`
  MODIFY `nutrition_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT a táblához `restaurants`
--
ALTER TABLE `restaurants`
  MODIFY `restaurant_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT a táblához `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
