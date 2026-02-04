const API_BASE_URL = "https://expense-tracker-2ske.onrender.com/api";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const login = async (credentials) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  });
  return res.json();
};

export const register = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
};

export const getCategories = async () => {
  const res = await fetch(`${API_BASE_URL}/categories`, {
    headers: { ...authHeaders() }
  });
  return res.json();
};

export const addCategory = async (category) => {
  const res = await fetch(`${API_BASE_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(category)
  });
  return res.json();
};

export const deleteCategory = async (name) => {
  const res = await fetch(`${API_BASE_URL}/categories/${encodeURIComponent(name)}`, {
    method: "DELETE",
    headers: { ...authHeaders() }
  });
  return res.json();
};

export const addExpense = async (expense) => {
  const res = await fetch(`${API_BASE_URL}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(expense)
  });
  return res.json();
};

export const updateExpense = async (id, expense) => {
  const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(expense)
  });
  return res.json();
};

export const getExpenses = async (page = 1, limit = 10) => {
  const res = await fetch(`${API_BASE_URL}/expenses?page=${page}&limit=${limit}`, {
    headers: { ...authHeaders() }
  });
  return res.json();
};

export const getMonthlySummary = async (month) => {
  const res = await fetch(
    `${API_BASE_URL}/expenses/monthly?month=${month}`,
    { headers: { ...authHeaders() } }
  );
  return res.json();
};

export const getMonthlyTrends = async () => {
  const res = await fetch(`${API_BASE_URL}/expenses/trends`, {
    headers: { ...authHeaders() }
  });
  return res.json();
};

export const deleteExpense = async (id) => {
  const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() }
  });
  return res.json();
};