console.log("script.js is working");
// Array to store mentor records loaded from database
let mentors = [];

// Variables to store selected mentor indexes
let editingIndex = -1;
let deletingIndex = -1;


// Get main HTML elements
const mentorForm = document.getElementById("mentorForm");
const submitButton = document.getElementById("submitButton");
const tableBody = document.getElementById("mentorTableBody");
const successMessage = document.getElementById("successMessage");


// Load mentors from MySQL database
async function loadMentors() {

    try {

        const response = await fetch("get_mentors.php");

        mentors = await response.json();

        displayMentors();

    } catch (error) {

        console.error("Error loading mentors:", error);

        successMessage.textContent =
            "Failed to load mentor records.";
    }
}


// Function to validate Maximum Mentees
function isValidMentees(value) {

    if (value === "") {
        return false;
    }

    const number = Number(value);

    // Must be a whole number and greater than 0
    if (!Number.isInteger(number) || number <= 0) {
        return false;
    }

    return true;
}


// Function to validate JPG or PNG photo
function isValidPhoto(photo) {

    // Photo is optional
    if (!photo) {
        return true;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png"
    ];

    return allowedTypes.includes(photo.type);
}


// Validate Add Mentor Form
function validateForm() {

    let isValid = true;

    const name =
        document.getElementById("mentorName").value.trim();

    const employeeId =
        document.getElementById("employeeId").value.trim();

    const department =
        document.getElementById("department").value;

    const maxMentees =
        document.getElementById("maxMentees").value;

    const photo =
        document.getElementById("photo").files[0];


    // Mentor Name Validation
    if (name === "") {

        document.getElementById("mentorNameError").textContent =
            "Mentor name cannot be empty.";

        isValid = false;

    } else {

        document.getElementById("mentorNameError").textContent = "";
    }


    // Employee ID Validation
    if (employeeId === "") {

        document.getElementById("employeeIdError").textContent =
            "Employee ID cannot be empty.";

        isValid = false;

    } else {

        document.getElementById("employeeIdError").textContent = "";
    }


    // Department Validation
    if (department === "") {

        document.getElementById("departmentError").textContent =
            "Please select a department.";

        isValid = false;

    } else {

        document.getElementById("departmentError").textContent = "";
    }


    // Maximum Mentees Validation
    if (!isValidMentees(maxMentees)) {

        document.getElementById("maxMenteesError").textContent =
            "Enter a positive whole number greater than 0.";

        isValid = false;

    } else {

        document.getElementById("maxMenteesError").textContent = "";
    }


    // Profile Photo Validation
    if (!isValidPhoto(photo)) {

        document.getElementById("photoError").textContent =
            "Only JPG or PNG images are allowed.";

        isValid = false;

    } else {

        document.getElementById("photoError").textContent = "";
    }


    // Enable button only when every condition is valid
    submitButton.disabled = !isValid;

    return isValid;
}


// Validate fields while entering data
document.getElementById("mentorName")
    .addEventListener("input", validateForm);

document.getElementById("employeeId")
    .addEventListener("input", validateForm);

document.getElementById("department")
    .addEventListener("change", validateForm);

document.getElementById("maxMentees")
    .addEventListener("input", validateForm);

document.getElementById("photo")
    .addEventListener("change", validateForm);


// Add Mentor Form Submit
mentorForm.addEventListener("submit", async function(event) {

    event.preventDefault();


    // Stop submission if form is invalid
    if (!validateForm()) {
        return;
    }


    const photo =
        document.getElementById("photo").files[0];


    // Create FormData to send to PHP
    const formData = new FormData();

    formData.append(
        "name",
        document.getElementById("mentorName").value.trim()
    );

    formData.append(
        "employee_id",
        document.getElementById("employeeId").value.trim()
    );

    formData.append(
        "department",
        document.getElementById("department").value
    );

    formData.append(
        "designation",
        document.getElementById("designation").value.trim()
    );

    formData.append(
        "max_mentees",
        document.getElementById("maxMentees").value
    );

    if (photo) {
        formData.append("photo", photo);
    }


    try {

        const response = await fetch("add_mentor.php", {
            method: "POST",
            body: formData
        });

        const result = await response.json();


        if (result.success) {

            successMessage.textContent =
                "Mentor added successfully.";

            mentorForm.reset();

            submitButton.disabled = true;

            // Reload mentors from database
            loadMentors();

        } else {

            successMessage.textContent =
                result.message;
        }

    } catch (error) {

        console.error("Error adding mentor:", error);

        successMessage.textContent =
            "Failed to add mentor.";
    }
});


// Display Mentors in Table
function displayMentors() {

    // Clear old table data
    tableBody.innerHTML = "";


    // Loop through mentor records
    mentors.forEach(function(mentor, index) {

        const row = document.createElement("tr");


        row.innerHTML = `
            <td>${mentor.name}</td>
            <td>${mentor.employee_id}</td>
            <td>${mentor.department}</td>
            <td>${mentor.max_mentees}</td>

            <td>
                ${
                    mentor.photo_path
                    ? `<img src="${mentor.photo_path}" alt="Profile Photo" width="100">`
                    : "No Photo"
                }
            </td>

            <td>
                <button type="button"
                    onclick="openEditPopup(${index})">
                    Edit
                </button>

                <button type="button"
                    onclick="openDeletePopup(${index})">
                    Delete
                </button>
            </td>
        `;


        tableBody.appendChild(row);
    });
}


// Open Edit Popup
function openEditPopup(index) {

    // Store selected index
    editingIndex = index;


    // Get selected mentor
    const mentor = mentors[index];


    // Fill popup with existing data
    document.getElementById("editMentorName").value =
        mentor.name;

    document.getElementById("editEmployeeId").value =
        mentor.employee_id;

    document.getElementById("editDepartment").value =
        mentor.department;

    document.getElementById("editDesignation").value =
        mentor.designation;

    document.getElementById("editMaxMentees").value =
        mentor.max_mentees;


    // Clear file field
    document.getElementById("editPhoto").value = "";


    // Clear previous errors
    document.getElementById("editMentorNameError").textContent = "";
    document.getElementById("editEmployeeIdError").textContent = "";
    document.getElementById("editDepartmentError").textContent = "";
    document.getElementById("editMaxMenteesError").textContent = "";
    document.getElementById("editPhotoError").textContent = "";


    // Show popup
    document.getElementById("editPopup").hidden = false;


    // Check whether current values are valid
    validateEditForm();
}


// Close Edit Popup
function closeEditPopup() {

    document.getElementById("editPopup").hidden = true;

    editingIndex = -1;
}


// Validate Edit Form
function validateEditForm() {

    let isValid = true;


    const name =
        document.getElementById("editMentorName").value.trim();

    const employeeId =
        document.getElementById("editEmployeeId").value.trim();

    const department =
        document.getElementById("editDepartment").value;

    const maxMentees =
        document.getElementById("editMaxMentees").value;

    const photo =
        document.getElementById("editPhoto").files[0];


    // Name
    if (name === "") {

        document.getElementById("editMentorNameError").textContent =
            "Mentor name cannot be empty.";

        isValid = false;

    } else {

        document.getElementById("editMentorNameError").textContent = "";
    }


    // Employee ID
    if (employeeId === "") {

        document.getElementById("editEmployeeIdError").textContent =
            "Employee ID cannot be empty.";

        isValid = false;

    } else {

        document.getElementById("editEmployeeIdError").textContent = "";
    }


    // Department
    if (department === "") {

        document.getElementById("editDepartmentError").textContent =
            "Please select a department.";

        isValid = false;

    } else {

        document.getElementById("editDepartmentError").textContent = "";
    }


    // Maximum Mentees
    if (!isValidMentees(maxMentees)) {

        document.getElementById("editMaxMenteesError").textContent =
            "Enter a positive whole number greater than 0.";

        isValid = false;

    } else {

        document.getElementById("editMaxMenteesError").textContent = "";
    }


    // Photo
    if (!isValidPhoto(photo)) {

        document.getElementById("editPhotoError").textContent =
            "Only JPG or PNG images are allowed.";

        isValid = false;

    } else {

        document.getElementById("editPhotoError").textContent = "";
    }


    // Enable Save button only when valid
    document.getElementById("updateButton").disabled = !isValid;

    return isValid;
}


// Validate Edit Form while user changes values
document.getElementById("editMentorName")
    .addEventListener("input", validateEditForm);

document.getElementById("editEmployeeId")
    .addEventListener("input", validateEditForm);

document.getElementById("editDepartment")
    .addEventListener("change", validateEditForm);

document.getElementById("editMaxMentees")
    .addEventListener("input", validateEditForm);

document.getElementById("editPhoto")
    .addEventListener("change", validateEditForm);


// Save Edited Mentor
// Save Edited Mentor
document.getElementById("editForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        if (!validateEditForm()) {
            return;
        }

        // Get selected mentor from loaded database records
        const mentor = mentors[editingIndex];

        // Create FormData to send to PHP
        const formData = new FormData();

        formData.append("id", mentor.id);

        formData.append(
            "name",
            document.getElementById("editMentorName").value.trim()
        );

        formData.append(
            "employee_id",
            document.getElementById("editEmployeeId").value.trim()
        );

        formData.append(
            "department",
            document.getElementById("editDepartment").value
        );

        formData.append(
            "designation",
            document.getElementById("editDesignation").value.trim()
        );

        formData.append(
            "max_mentees",
            document.getElementById("editMaxMentees").value
        );

        // Add new photo only if user selected one
        const newPhoto =
            document.getElementById("editPhoto").files[0];

        if (newPhoto) {
            formData.append("photo", newPhoto);
        }


        try {

            const response = await fetch("update_mentor.php", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (result.success) {

                // Close edit popup
                closeEditPopup();

                // Show success message
                successMessage.textContent =
                    "Mentor updated successfully.";

                // Reload updated data from MySQL
                loadMentors();

            } else {

                successMessage.textContent =
                    result.message;
            }

        } catch (error) {

            console.error("Error updating mentor:", error);

            successMessage.textContent =
                "Failed to update mentor.";
        }
    });

// Open Delete Confirmation Popup
function openDeletePopup(index) {

    // Store index of mentor to delete
    deletingIndex = index;


    // Show popup
    document.getElementById("deletePopup").hidden = false;
}


// Close Delete Popup
function closeDeletePopup() {

    document.getElementById("deletePopup").hidden = true;

    deletingIndex = -1;
}


// Confirm Delete
// Confirm Delete
async function confirmDelete() {

    if (deletingIndex === -1) {
        return;
    }

    // Get the exact mentor from the loaded database records
    const mentor = mentors[deletingIndex];

    const formData = new FormData();

    // Send the database ID, not the array index
    formData.append("id", mentor.id);


    try {

        const response = await fetch("delete_mentor.php", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (result.success) {

            // Close delete popup
            closeDeletePopup();

            // Show success message
            successMessage.textContent =
                "Mentor deleted successfully.";

            // Reload data from MySQL
            loadMentors();

        } else {

            successMessage.textContent =
                result.message;
        }

    } catch (error) {

        console.error("Error deleting mentor:", error);

        successMessage.textContent =
            "Failed to delete mentor.";
    }
}


// Load mentors when page opens
loadMentors();