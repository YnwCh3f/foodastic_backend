-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2025. Ápr 27. 23:06
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
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
  `id` int(11) NOT NULL,
  `cart_id` varchar(32) NOT NULL,
  `food_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `count` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `cart`
--

INSERT INTO `cart` (`id`, `cart_id`, `food_id`, `date`, `count`) VALUES
(4, '#4/2025-04-14T13:23:34.606Z', 1, '2025-04-14', 1),
(5, '#4/2025-04-14T13:26:16.143Z', 1, '2025-04-14', 1),
(6, '#4/2025-04-14T13:26:16.143Z', 2, '2025-04-14', 4),
(7, '#4/2025-04-14T13:26:16.143Z', 3, '2025-04-14', 5),
(8, '#8/2025-04-14T14:01:15.030Z', 1, '2025-04-14', 1),
(9, '#4/2025-04-14T14:41:08.747Z', 2, '2025-04-14', 3),
(10, '#4/2025-04-14T17:52:28.014Z', 1, '2025-04-14', 1),
(11, '#4/2025-04-14T17:52:28.014Z', 4, '2025-04-14', 2),
(12, '#4/2025-04-14T18:55:13.610Z', 1, '2025-04-14', 1),
(13, '#4/2025-04-14T18:55:13.610Z', 2, '2025-04-14', 1),
(14, '#1/2025-04-14T19:10:12.623Z', 1, '2025-04-14', 1),
(15, '#4/2025-04-14T19:11:51.754Z', 1, '2025-04-14', 1),
(16, '#4/2025-04-14T19:17:16.278Z', 1, '2025-04-14', 1),
(17, '#4/2025-04-14T20:26:44.838Z', 1, '2025-04-14', 1),
(18, '#4/2025-04-14T20:51:44.498Z', 1, '2025-04-14', 1),
(19, '#4/2025-04-15T08:31:22.888Z', 1, '2025-04-15', 1);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `chats`
--

CREATE TABLE `chats` (
  `chat_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `recipient_id` int(11) NOT NULL,
  `message` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `foods`
--

CREATE TABLE `foods` (
  `food_id` int(11) NOT NULL,
  `name` varchar(32) NOT NULL,
  `price` int(11) NOT NULL,
  `image` tinytext NOT NULL
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
(10, 'Chocolate Lava Cake', 2390, 'https://www.livewellbakeoften.com/wp-content/uploads/2017/01/Molten-Chocolate-Lava-Cakes-for-Two-4-300x300-1.jpg'),
(14, 'Próba', 500, '-'),
(15, 'Próba', 500, '-'),
(16, 'Próba', 500, '-'),
(17, 'Próba', 500, '-'),
(18, 'Próba', 500, '-'),
(19, 'Próba', 500, '-'),
(20, 'Próba', 500, '-');

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
-- Tábla szerkezet ehhez a táblához `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `cart_id` varchar(32) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `confirmed` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `orders`
--

INSERT INTO `orders` (`order_id`, `cart_id`, `restaurant_id`, `user_id`, `confirmed`) VALUES
(6, '#4/2025-04-14T13:23:34.606Z', 1, 4, 0),
(7, '#4/2025-04-14T13:26:16.143Z', 2, 4, 0),
(8, '#8/2025-04-14T14:01:15.030Z', 3, 8, 0),
(9, '#4/2025-04-14T14:41:08.747Z', 1, 4, 0),
(10, '#4/2025-04-14T17:52:28.014Z', 2, 4, 0),
(11, '#4/2025-04-14T18:55:13.610Z', 1, 4, 0),
(12, '#1/2025-04-14T19:08:35.459Z', 1, 1, 0),
(13, '#1/2025-04-14T19:10:12.623Z', 1, 1, 0),
(14, '#4/2025-04-14T19:11:51.754Z', 1, 4, 0),
(15, '#4/2025-04-14T19:17:16.278Z', 1, 4, 0),
(16, '#4/2025-04-14T20:26:44.838Z', 1, 4, 0),
(17, '#4/2025-04-14T20:51:44.498Z', 1, 4, 0),
(18, '#4/2025-04-15T08:31:22.888Z', 1, 4, 0);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `restaurants`
--

CREATE TABLE `restaurants` (
  `restaurant_id` int(11) NOT NULL,
  `restaurant_name` varchar(20) NOT NULL,
  `restaurant_picture` text NOT NULL,
  `restaurant_address` varchar(32) NOT NULL
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
  `first_name` varchar(16) NOT NULL,
  `last_name` varchar(16) NOT NULL,
  `email` varchar(32) NOT NULL,
  `password` varchar(64) NOT NULL,
  `profile_picture` varchar(30) NOT NULL,
  `points` int(11) NOT NULL DEFAULT 0,
  `role` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `users`
--

INSERT INTO `users` (`user_id`, `first_name`, `last_name`, `email`, `password`, `profile_picture`, `points`, `role`) VALUES
(4, 'asd', 'asd', 'asd', '688787d8ff144c502c7f5cffaafe2cc588d86079f9de88304c26b0cb99ce91c6', '-', 0, 'user'),
(8, 'as', 'as', 'as', 'f4bf9f7fcbedaba0392f108c59d8f4a38b3838efb64877380171b54475c2ade8', '', 0, 'user'),
(9, 'er', 'er', 'fgh', '18ac3e7343f016890c510e93f935261169d9e3f565436429830faf0934f4f8e4', '', 0, 'user');

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`);

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
-- A tábla indexei `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT a táblához `chats`
--
ALTER TABLE `chats`
  MODIFY `chat_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `foods`
--
ALTER TABLE `foods`
  MODIFY `food_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT a táblához `nutritions`
--
ALTER TABLE `nutritions`
  MODIFY `nutrition_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT a táblához `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT a táblához `restaurants`
--
ALTER TABLE `restaurants`
  MODIFY `restaurant_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT a táblához `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
