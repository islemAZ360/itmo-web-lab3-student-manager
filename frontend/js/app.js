let currentEditingIsu = null;
let isRegisterMode = false;

function isAdmin() {
    return localStorage.getItem("role") === "ADMIN";
}

function updateAppVisibility() {
    const token = getAccessToken();
    const authScreen = document.getElementById("auth-screen");
    const mainApp = document.getElementById("main-app");

    if (token) {
        authScreen.style.display = "none";
        mainApp.style.display = "block";
        document.getElementById("current-username").textContent = localStorage.getItem("username") || "";
        document.getElementById("current-role").textContent = localStorage.getItem("role") || "";
        document.getElementById("show-add-form-btn").style.display = isAdmin() ? "inline-block" : "none";
        renderTable();
    } else {
        authScreen.style.display = "flex";
        mainApp.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateAppVisibility();

    // Переключение формы входа/регистрации
    const toggleBtn = document.getElementById("auth-toggle-btn");
    const authTitle = document.getElementById("auth-title");
    const authSubmitBtn = document.getElementById("auth-submit-btn");
    const emailGroup = document.getElementById("email-group");
    const roleGroup = document.getElementById("role-group");

    toggleBtn.addEventListener("click", () => {
        isRegisterMode = !isRegisterMode;
        document.getElementById("auth-error").style.display = "none";
        document.getElementById("auth-success").style.display = "none";

        if (isRegisterMode) {
            authTitle.textContent = "Create Account";
            authSubmitBtn.textContent = "Register";
            toggleBtn.textContent = "Already have an account? Sign In";
            emailGroup.style.display = "block";
            roleGroup.style.display = "block";
            document.getElementById("auth-email").required = true;
        } else {
            authTitle.textContent = "Sign In";
            authSubmitBtn.textContent = "Login";
            toggleBtn.textContent = "Need an account? Register";
            emailGroup.style.display = "none";
            roleGroup.style.display = "none";
            document.getElementById("auth-email").required = false;
        }
    });

    // Авторизация и регистрация
    document.getElementById("login-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("auth-username").value.trim();
        const password = document.getElementById("auth-password").value.trim();
        const errorBox = document.getElementById("auth-error");
        const successBox = document.getElementById("auth-success");

        errorBox.style.display = "none";
        successBox.style.display = "none";

        try {
            if (isRegisterMode) {
                const email = document.getElementById("auth-email").value.trim();
                const role = document.getElementById("auth-role").value;
                const res = await registerUser(username, email, password, role);
                if (res.ok) {
                    successBox.textContent = "Registration successful! You can now log in.";
                    successBox.style.display = "block";
                    toggleBtn.click(); // Возврат к логину
                } else {
                    const err = await res.json().catch(() => ({}));
                    errorBox.textContent = err.error || err.message || "Registration failed";
                    errorBox.style.display = "block";
                }
            } else {
                const res = await loginUser(username, password);
                if (res.ok) {
                    const data = await res.json();
                    saveAuthData(data);
                    updateAppVisibility();
                } else {
                    const err = await res.json().catch(() => ({}));
                    errorBox.textContent = err.error || err.message || "Invalid credentials";
                    errorBox.style.display = "block";
                }
            }
        } catch (err) {
            errorBox.textContent = "Cannot connect to server. Ensure backend is running.";
            errorBox.style.display = "block";
        }
    });

    // Выход
    document.getElementById("logout-btn").addEventListener("click", () => {
        clearAuthData();
        closeForm();
        document.getElementById("student-dossier").style.display = "none";
        updateAppVisibility();
    });

    // Сбор полей фильтра
    function getActiveFilters() {
        const filters = {};
        const name = document.getElementById("filter-name").value.trim();
        const group = document.getElementById("filter-group").value.trim();
        const dorm = document.getElementById("filter-dormitory").value.trim();
        const room = document.getElementById("filter-room").value.trim();
        const isu = document.getElementById("filter-isu").value.trim();

        if (name) filters.fullName = name;
        if (group) filters.group = group;
        if (dorm) filters.dormitory = dorm;
        if (room) filters.room = room;
        if (isu) filters.isuId = isu;

        return filters;
    }

    // Автовыбор с проверкой
    document.getElementById("btn-search-auto").addEventListener("click", async () => {
        if (!document.getElementById("filter-form").reportValidity()) return;

        const filters = getActiveFilters();
        const count = Object.keys(filters).length;

        if (count < 3) {
            const params = new URLSearchParams(filters);
            renderTable(params.toString() ? `?${params.toString()}` : "");
        } else {
            try {
                const students = await fetchStudentsWithQueryMethod(filters);
                updateTableHTML(students);
            } catch (err) {
                alert("Failed to filter data via query body");
            }
        }
    });

    // Ручной GET с проверкой
    document.getElementById("btn-search-get").addEventListener("click", () => {
        if (!document.getElementById("filter-form").reportValidity()) return;

        const filters = getActiveFilters();
        const params = new URLSearchParams(filters);
        renderTable(params.toString() ? `?${params.toString()}` : "");
    });

    // Ручной Query с проверкой
    document.getElementById("btn-search-query").addEventListener("click", async () => {
        if (!document.getElementById("filter-form").reportValidity()) return;

        const filters = getActiveFilters();
        if (Object.keys(filters).length === 0) {
            alert("Please enter at least one filter before sending a Query Body request!");
            return;
        }
        try {
            const students = await fetchStudentsWithQueryMethod(filters);
            updateTableHTML(students);
        } catch (err) {
            alert("Failed to filter data via query body");
        }
    });

    // Сброс фильтра
    document.getElementById("btn-reset-filter").addEventListener("click", () => {
        document.getElementById("filter-form").reset();
        renderTable();
    });

    document.getElementById("show-add-form-btn").addEventListener("click", openAddForm);
    document.getElementById("cancel-form-btn").addEventListener("click", closeForm);
    document.getElementById("btn-close-dossier").addEventListener("click", () => {
        document.getElementById("student-dossier").style.display = "none";
    });

    document.getElementById("student-form").addEventListener("submit", handleFormSubmit);
});

async function renderTable(queryString = "") {
    const tableBody = document.getElementById("student-body");
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Loading data...</td></tr>`;

    try {
        const students = await fetchStudents(queryString);
        updateTableHTML(students);
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Failed to load data. Please re-login.</td></tr>`;
    }
}

function updateTableHTML(students) {
    const tableBody = document.getElementById("student-body");
    tableBody.innerHTML = "";

    if (!students || students.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No students found</td></tr>`;
        return;
    }

    const admin = isAdmin();

    students.forEach(student => {
        const tr = document.createElement("tr");
        let actions = `<button class="btn btn-secondary" onclick="viewStudent('${student.isuId}')">View</button>`;

        if (admin) {
            actions += `
                <button class="btn btn-primary" onclick="editStudent('${student.isuId}')">Edit</button>
                <button class="btn btn-danger" onclick="removeStudent('${student.isuId}')">Delete</button>
            `;
        }

        tr.innerHTML = `
            <td>${student.fullName}</td>
            <td>${student.group}</td>
            <td>${student.isuId}</td>
            <td>${student.room}</td>
            <td>${actions}</td>
        `;
        tableBody.appendChild(tr);
    });
}

function openAddForm() {
    currentEditingIsu = null;
    document.getElementById("student-form").reset();
    document.getElementById("form-title").textContent = "Add Student";
    document.getElementById("isuId").readOnly = false;
    document.getElementById("student-form-section").style.display = "block";
    document.getElementById("student-dossier").style.display = "none";
}

async function editStudent(isu) {
    try {
        const student = await fetchStudentById(isu);
        if (!student) return alert("Student not found!");

        currentEditingIsu = isu;
        document.getElementById("form-title").textContent = "Edit Student";
        document.getElementById("fullName").value = student.fullName;
        document.getElementById("group").value = student.group;
        document.getElementById("isuId").value = student.isuId;
        document.getElementById("isuId").readOnly = true;
        document.getElementById("dormitoryNumber").value = student.dormitoryNumber;
        document.getElementById("room").value = student.room;
        document.getElementById("accommodationPeriod").value = student.accommodationPeriod;
        document.getElementById("isInternational").checked = Boolean(student.isInternational);
        document.getElementById("notes").value = student.notes || "";

        document.getElementById("student-form-section").style.display = "block";
        document.getElementById("student-dossier").style.display = "none";
    } catch (err) {
        console.error(err);
    }
}

function closeForm() {
    document.getElementById("student-form").reset();
    document.getElementById("isuId").readOnly = false;
    currentEditingIsu = null;
    document.getElementById("student-form-section").style.display = "none";
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    if (!form.reportValidity()) return;

    const isuId = document.getElementById("isuId").value.trim();
    const studentData = {
        fullName: document.getElementById("fullName").value.trim(),
        group: document.getElementById("group").value.trim(),
        isuId: isuId,
        dormitoryNumber: Number(document.getElementById("dormitoryNumber").value),
        room: Number(document.getElementById("room").value),
        accommodationPeriod: document.getElementById("accommodationPeriod").value,
        isInternational: document.getElementById("isInternational").checked,
        notes: document.getElementById("notes").value.trim()
    };

    try {
        let response = currentEditingIsu
            ? await updateStudent(currentEditingIsu, studentData)
            : await addStudent(studentData);

        if (response.ok) {
            closeForm();
            renderTable();
        } else {
            const errData = await response.json().catch(() => ({}));
            alert(errData.error || errData.message || "Operation failed!");
        }
    } catch (err) {
        alert("Server communication error");
    }
}

async function viewStudent(isu) {
    try {
        const student = await fetchStudentById(isu);
        if (!student) return alert("Student not found!");

        document.getElementById("dossier-name").textContent = student.fullName;
        document.getElementById("dossier-group").textContent = student.group;
        document.getElementById("dossier-isu").textContent = student.isuId;
        document.getElementById("dossier-dorm").textContent = student.dormitoryNumber;
        document.getElementById("dossier-room").textContent = student.room;
        document.getElementById("dossier-date").textContent = student.accommodationPeriod;
        document.getElementById("dossier-foreign").textContent = student.isInternational ? "Yes" : "No";
        document.getElementById("dossier-notes").textContent = student.notes || "None";

        document.getElementById("student-dossier").style.display = "block";
        document.getElementById("student-form-section").style.display = "none";
    } catch (err) {
        console.error(err);
    }
}

async function removeStudent(isu) {
    if (confirm(`Are you sure you want to delete student with ISU ${isu}?`)) {
        try {
            const res = await deleteStudent(isu);
            if (res.ok || res.status === 204) {
                document.getElementById("student-dossier").style.display = "none";
                renderTable();
            } else {
                alert("Could not delete student (insufficient permissions).");
            }
        } catch (err) {
            console.error(err);
        }
    }
}