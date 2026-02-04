import { useEffect, useState } from "react";
import { getCategories, addCategory, deleteCategory } from "../services/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");

  const load = () => getCategories().then(setCategories);

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) return;
    await addCategory({ name });
    setName("");
    load();
  };

  return (
    <div className="page">
      <h2>Manage Categories</h2>

      <input
        placeholder="Category name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleAdd}>Add</button>

      <ul>
        {categories.map((c) => (
          <li key={c}>
            {c}
            <button onClick={() => deleteCategory(c).then(load)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}