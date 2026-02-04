const express = require("express");
const cors = require("cors");
require("dotenv").config();

const expenseRoutes = require("./routes/expenses");
const categoryRoutes = require("./routes/categories");
const authRoutes = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/categories", categoryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});