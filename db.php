<?php

$conn = new mysqli(
    "sql104.infinityfree.com",
    "if0_42843279",
    "Ashwini7982",
    "if0_42843279_mentor_meeting_db",
    3306
);

if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

?>