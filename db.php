<?php

$conn = new mysqli(
    "YOUR_DATABASE_HOST",
    "YOUR_DATABASE_USERNAME",
    "YOUR_DATABASE_PASSWORD",
    "YOUR_DATABASE_NAME",
    3306
);

if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

?>
