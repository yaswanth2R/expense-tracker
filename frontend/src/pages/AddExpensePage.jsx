import AddExpense from "../components/AddExpense";

export default function AddExpensePage() {
  return (
    <div className="page">
      <h2>Add / Update Expense</h2>
      <AddExpense onAdd={() => {}} />
    </div>
  );
}