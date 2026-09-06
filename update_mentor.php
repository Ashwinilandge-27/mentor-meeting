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
$name = trim($_POST["name"] ?? "");
$employeeId = trim($_POST["employee_id"] ?? "");
$department = trim($_POST["department"] ?? "");
$designation = trim($_POST["designation"] ?? "");
$maxMentees = $_POST["max_mentees"] ?? "";


if (
    !filter_var($id, FILTER_VALIDATE_INT) ||
    $name === "" ||
    $employeeId === "" ||
    $department === "" ||
    !filter_var($maxMentees, FILTER_VALIDATE_INT) ||
    (int)$maxMentees <= 0
) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid mentor data."
    ]);
    exit;
}


// Get existing photo path
$stmt = $conn->prepare(
    "SELECT photo_path FROM mentors WHERE id = ?"
);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $conn->error
    ]);
    exit;
}

$stmt->bind_param("i", $id);
$stmt->execute();

$stmt->bind_result($existingPhoto);

if (!$stmt->fetch()) {
    $stmt->close();

    echo json_encode([
        "success" => false,
        "message" => "Mentor not found."
    ]);
    exit;
}

$stmt->close();


// Keep old photo by default
$photoPath = $existingPhoto;


// Upload new photo if selected
if (
    isset($_FILES["photo"]) &&
    $_FILES["photo"]["error"] === UPLOAD_ERR_OK
) {

    $allowedTypes = [
        "image/jpeg",
        "image/png"
    ];

    if (!in_array($_FILES["photo"]["type"], $allowedTypes)) {
        echo json_encode([
            "success" => false,
            "message" => "Only JPG and PNG images are allowed."
        ]);
        exit;
    }

    $extension = pathinfo(
        $_FILES["photo"]["name"],
        PATHINFO_EXTENSION
    );

    $uniqueFileName =
        $employeeId . "_" . time() . "." . $extension;

    $photoPath =
        "uploads/" . $uniqueFileName;

    if (!move_uploaded_file(
        $_FILES["photo"]["tmp_name"],
        $photoPath
    )) {
        echo json_encode([
            "success" => false,
            "message" => "Photo upload failed."
        ]);
        exit;
    }
}


// Update mentor
$stmt = $conn->prepare(
    "UPDATE mentors
    SET name = ?,
        employee_id = ?,
        department = ?,
        designation = ?,
        max_mentees = ?,
        photo_path = ?
    WHERE id = ?"
);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Update preparation failed: " . $conn->error
    ]);
    exit;
}

$maxMentees = (int)$maxMentees;
$id = (int)$id;

$stmt->bind_param(
    "ssssisi",
    $name,
    $employeeId,
    $department,
    $designation,
    $maxMentees,
    $photoPath,
    $id
);


if ($stmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" => "Mentor updated successfully."
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Failed to update mentor: " . $stmt->error
    ]);
}

$stmt->close();
$conn->close();

?>