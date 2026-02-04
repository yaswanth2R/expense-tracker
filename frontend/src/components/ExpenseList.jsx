export default function ExpenseList({ expenses, onEdit, onDelete }) {
  const INR = "INR";
  return (
    <ul>
      {expenses.map((e) => (
        <li key={e.id}>
          <strong>{e.title}</strong> - <span>{INR}</span> {e.amount} ({e.category}) - {e.date}
          <div>
            <button onClick={() => onEdit && onEdit(e)}>Edit</button>
            <button
              onClick={() => {
                if (window.confirm("Delete this expense?")) {
                  onDelete && onDelete(e.id);
                }
              }}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}