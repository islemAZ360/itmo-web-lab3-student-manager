const API_BASE = "http://localhost:8080/api";

function getAccessToken() {
    return localStorage.getItem("accessToken");
}

function getRefreshToken() {
    return localStorage.getItem("refreshToken");
}

function saveAuthData(data) {
    if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
    if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
    if (data.username) localStorage.setItem("username", data.username);
    if (data.role) localStorage.setItem("role", data.role);
}

function clearAuthData() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
}

async function apiRequest(url, options = {}) {
    options.headers = options.headers || {};
    const token = getAccessToken();
    if (token) {
        options.headers["Authorization"] = `Bearer ${token}`;
    }

    let response = await fetch(url, options);

    if (response.status === 401 && getRefreshToken()) {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: getRefreshToken() })
        });

        if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            saveAuthData(refreshData);
            options.headers["Authorization"] = `Bearer ${getAccessToken()}`;
            response = await fetch(url, options);
        } else {
            clearAuthData();
        }
    }

    return response;
}

async function loginUser(username, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    return response;
}

async function registerUser(username, email, password, role) {
    const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, role })
    });
    return response;
}

async function fetchStudents(queryString = "") {
    const response = await apiRequest(`${API_BASE}/students${queryString}`);
    if (!response.ok) throw new Error("Unauthorized or server error");
    return await response.json();
}

async function fetchStudentsWithQueryMethod(filters) {
    const response = await apiRequest(`${API_BASE}/students/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters)
    });
    if (!response.ok) throw new Error("Failed to filter");
    return await response.json();
}

async function fetchStudentById(isu) {
    const response = await apiRequest(`${API_BASE}/students/${isu}`);
    if (!response.ok) return null;
    return await response.json();
}

async function addStudent(studentData) {
    return await apiRequest(`${API_BASE}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData)
    });
}

async function updateStudent(isu, studentData) {
    return await apiRequest(`${API_BASE}/students/${isu}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData)
    });
}

async function deleteStudent(isu) {
    return await apiRequest(`${API_BASE}/students/${isu}`, {
        method: "DELETE"
    });
}
