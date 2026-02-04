import { useEffect, useState } from "react";
import { addExpense, getCategories, updateExpense } from "../services/api";

export default function AddExpense({ onAdd, editData, clearEdit }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(
    editData || { title: "", amount: "", category: "", date: "" }
  );

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (editData) setForm(editData);
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editData) {
      await updateExpense(editData.id, form);
      if (clearEdit) clearEdit();
    } else {
      await addExpense(form);
    }

    if (onAdd) onAdd();
    setForm({ title: "", amount: "", category: "", date: "" });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Expense</h3>

      <input
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        required
      />

      <input
        type="number"
        placeholder="Amount"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
        required
      />

      <select
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        required
      >
        <option value="">Select category</option>
        {categories.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>

      <input
        type="date"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
        required
      />

      <button>{editData ? "Update" : "Add"}</button>
    </form>
  );
}