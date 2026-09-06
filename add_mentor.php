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

$name = trim($_POST["name"] ?? "");
$employeeId = trim($_POST["employee_id"] ?? "");
$department = trim($_POST["department"] ?? "");
$designation = trim($_POST["designation"] ?? "");
$maxMentees = $_POST["max_mentees"] ?? "";


if (
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


// Default photo path
$photoPath = "";


// Upload photo
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


    // Create unique filename
    $uniqueFileName =
        $employeeId . "_" . time() . "_" . uniqid() . "." . $extension;


    $uploadFolder = __DIR__ . "/uploads/";

    // Create uploads folder if needed
    if (!is_dir($uploadFolder)) {
        mkdir($uploadFolder, 0777, true);
    }


    $destination =
        $uploadFolder . $uniqueFileName;


    if (!move_uploaded_file(
        $_FILES["photo"]["tmp_name"],
        $destination
    )) {

        echo json_encode([
            "success" => false,
            "message" => "Photo upload failed."
        ]);
        exit;
    }


    // Path saved in database
    $photoPath =
        "uploads/" . $uniqueFileName;
}


// Prepare database query
$stmt = $conn->prepare(
    "INSERT INTO mentors
    (name, employee_id, department, designation, max_mentees, photo_path)
    VALUES (?, ?, ?, ?, ?, ?)"
);


if (!$stmt) {

    echo json_encode([
        "success" => false,
        "message" => "Database prepare error: " . $conn->error
    ]);

    exit;
}


// Bind values
$maxMentees = (int)$maxMentees;

$stmt->bind_param(
    "ssssis",
    $name,
    $employeeId,
    $department,
    $designation,
    $maxMentees,
    $photoPath
);


// Execute query
if ($stmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" => "Mentor added successfully.",
        "id" => $conn->insert_id
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Database insert error: " . $stmt->error
    ]);
}


$stmt->close();
$conn->close();

?>