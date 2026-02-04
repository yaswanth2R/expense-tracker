import { useEffect, useState } from "react";
import ExpenseList from "../components/ExpenseList";
import { getExpenses } from "../services/api";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const load = async (p) => {
    const data = await getExpenses(p, limit);
    if (Array.isArray(data)) {
      setExpenses(data);
      setTotalPages(1);
      setPage(1);
      setTotal(data.length);
    } else {
      setExpenses(data.data || []);
      setTotalPages(data.totalPages || 1);
      setPage(data.page || 1);
      setTotal(data.total || 0);
    }
  };

  useEffect(() => {
    load(page);
  }, [page]);

  return (
    <div className="page">
      <h2>Expenses</h2>
      <div style={{ marginBottom: "8px", color: "#555" }}>
        Total: {total}
      </div>
      <ExpenseList expenses={expenses} />
      <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
          Prev
        </button>
        <span style={{ alignSelf: "center" }}>Page {page} of {totalPages}</span>
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}
