let currentEditingIsu = null;

function isAdmin() {
    return localStorage.getItem("role") === "ADMIN";
}

function updateAuthUI() {
    const token = getAccessToken();
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    const userInfo = document.getElementById("user-info");
    const authForms = document.getElementById("auth-forms");
    const addBtn = document.getElementById("show-add-form-btn");

    if (token && username) {
        userInfo.style.display = "block";
        authForms.style.display = "none";
        document.getElementById("current-username").textContent = username;
        document.getElementById("current-role").textContent = role;
        addBtn.style.display = isAdmin() ? "inline-block" : "none";
    } else {
        userInfo.style.display = "none";
        authForms.style.display = "flex";
        addBtn.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateAuthUI();
    renderTable();

    document.getElementById("login-btn").addEventListener("click", async () => {
        const username = document.getElementById("auth-username").value.trim();
        const password = document.getElementById("auth-password").value.trim();
        if (!username || !password) return alert("Please enter username and password");

        try {
            const res = await loginUser(username, password);
            if (res.ok) {
                const data = await res.json();
                saveAuthData(data);
                updateAuthUI();
                renderTable();
            } else {
                const err = await res.json().catch(() => ({}));
                alert(err.error || err.message || "Invalid credentials");
            }
        } catch (e) {
            alert("Failed to connect to authentication server");
        }
    });

    document.getElementById("register-btn").addEventListener("click", async () => {
        const username = document.getElementById("auth-username").value.trim();
        const email = document.getElementById("auth-email").value.trim();
        const password = document.getElementById("auth-password").value.trim();
        const role = document.getElementById("auth-role").value;

        if (!username || !email || !password) {
            return alert("Please fill in username, email, and password");
        }

        try {
            const res = await registerUser(username, email, password, role);
            if (res.ok) {
                alert("Registration successful! You can now log in.");
            } else {
                const err = await res.json().catch(() => ({}));
                alert(err.error || err.message || "Registration failed");
            }
        } catch (e) {
            alert("Failed to connect to server");
        }
    });

    document.getElementById("logout-btn").addEventListener("click", () => {
        clearAuthData();
        closeForm();
        document.getElementById("student-dossier").style.display = "none";
        updateAuthUI();
        renderTable();
    });

    document.getElementById("show-add-form-btn").addEventListener("click", () => {
        openAddForm();
    });

    document.getElementById("cancel-form-btn").addEventListener("click", () => {
        closeForm();
    });

    document.getElementById("close-dossier-btn").addEventListener("click", () => {
        document.getElementById("student-dossier").style.display = "none";
    });

    document.getElementById("student-form").addEventListener("submit", handleFormSubmit);

    const filterGetBtn = document.getElementById("btn-search-get");
    const filterQueryBtn = document.getElementById("btn-search-query");
    const filterResetBtn = document.getElementById("btn-reset-filter");

    function getFilterValues() {
        return {
            fullName: document.getElementById("filter-name")?.value.trim() || "",
            group: document.getElementById("filter-group")?.value.trim() || "",
            dormitory: document.getElementById("filter-dormitory")?.value.trim() || "",
            room: document.getElementById("filter-room")?.value.trim() || "",
            isuId: document.getElementById("filter-isu")?.value.trim() || ""
        };
    }

    if (filterGetBtn) {
        filterGetBtn.addEventListener("click", () => {
            const f = getFilterValues();
            const params = new URLSearchParams();

            if (f.fullName) params.append("fullName", f.fullName);
            if (f.group) params.append("group", f.group);
            if (f.dormitory) params.append("dormitory", f.dormitory);
            if (f.room) params.append("room", f.room);
            if (f.isuId) params.append("isuId", f.isuId);

            const queryString = params.toString() ? `?${params.toString()}` : "";
            renderTable(queryString);
        });
    }

    if (filterQueryBtn) {
        filterQueryBtn.addEventListener("click", async () => {
            const f = getFilterValues();
            const filters = {};

            if (f.fullName) filters.fullName = f.fullName;
            if (f.group) filters.group = f.group;
            if (f.dormitory) filters.dormitory = f.dormitory;
            if (f.room) filters.room = f.room;
            if (f.isuId) filters.isuId = f.isuId;

            try {
                const students = await fetchStudentsWithQueryMethod(filters);
                updateTableHTML(students);
            } catch (error) {
                alert("There was a problem filtering the data!");
            }
        });
    }

    if (filterResetBtn) {
        filterResetBtn.addEventListener("click", () => {
            if (document.getElementById("filter-name")) document.getElementById("filter-name").value = "";
            if (document.getElementById("filter-group")) document.getElementById("filter-group").value = "";
            if (document.getElementById("filter-dormitory")) document.getElementById("filter-dormitory").value = "";
            if (document.getElementById("filter-room")) document.getElementById("filter-room").value = "";
            if (document.getElementById("filter-isu")) document.getElementById("filter-isu").value = "";

            renderTable();
        });
    }
});

async function renderTable(queryString = "") {
    const tableBody = document.getElementById("student-body");
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Loading data from server...</td></tr>`;

    try {
        const students = await fetchStudents(queryString);
        updateTableHTML(students);
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Please log in or check backend connection</td></tr>`;
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
        let actions = `<button onclick="viewStudent('${student.isuId}')">View</button>`;

        if (admin) {
            actions += `
                <button onclick="editStudent('${student.isuId}')">Edit</button>
                <button onclick="removeStudent('${student.isuId}')">Delete</button>
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
        if (!student) {
            alert("Student not found on server!");
            return;
        }

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
    } catch (error) {
        console.error(error);
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
        let response;
        if (currentEditingIsu) {
            response = await updateStudent(currentEditingIsu, studentData);
        } else {
            response = await addStudent(studentData);
        }

        if (response.ok) {
            closeForm();
            renderTable();
        } else {
            const errData = await response.json().catch(() => ({}));
            alert(errData.error || errData.message || "Operation failed!");
        }
    } catch (error) {
        alert("There was a problem communicating with the server!");
    }
}

async function viewStudent(isu) {
    try {
        const student = await fetchStudentById(isu);
        if (!student) {
            alert("Student not found on server!");
            return;
        }

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
    } catch (error) {
        console.error(error);
    }
}

async function removeStudent(isu) {
    if (confirm(`Are you sure you want to delete student with ISU ${isu}?`)) {
        try {
            const response = await deleteStudent(isu);
            if (response.ok || response.status === 204) {
                document.getElementById("student-dossier").style.display = "none";
                renderTable();
            } else {
                alert("The student could not be deleted (check permissions or existence)!");
            }
        } catch (error) {
            console.error(error);
        }
    }
}