<?php

header("Content-Type: application/json");

include "db.php";

$sql = "SELECT * FROM mentors ORDER BY id DESC";

$result = $conn->query($sql);

$mentors = [];

while ($row = $result->fetch_assoc()) {
    $mentors[] = $row;
}

echo json_encode($mentors);

$conn->close();

?>