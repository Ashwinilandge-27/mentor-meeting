<?php

header("Content-Type: application/json");

include "db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);
    exit;
}

$id = $_POST["id"] ?? "";

if (!filter_var($id, FILTER_VALIDATE_INT)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid mentor ID."
    ]);
    exit;
}


// First get the photo path
$stmt = $conn->prepare(
    "SELECT photo_path FROM mentors WHERE id = ?"
);

$stmt->bind_param("i", $id);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Mentor not found."
    ]);
    exit;
}

$mentor = $result->fetch_assoc();
$photoPath = $mentor["photo_path"];

$stmt->close();


// Delete mentor from database
$stmt = $conn->prepare(
    "DELETE FROM mentors WHERE id = ?"
);

$stmt->bind_param("i", $id);

if ($stmt->execute()) {

    // Delete photo file if it exists
    if (
        !empty($photoPath) &&
        file_exists($photoPath)
    ) {
        unlink($photoPath);
    }

    echo json_encode([
        "success" => true,
        "message" => "Mentor deleted successfully."
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Failed to delete mentor."
    ]);
}

$stmt->close();
$conn->close();

?>