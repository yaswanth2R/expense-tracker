import { useEffect, useRef, useState } from "react";
import { getMonthlySummary, getMonthlyTrends } from "../services/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function MonthlySummary() {
  const INR = "INR";
  const [month, setMonth] = useState("");
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const categoryChartRef = useRef(null);
  const trendChartRef = useRef(null);

  useEffect(() => {
    getMonthlyTrends().then(setTrends).catch(() => setTrends([]));
  }, []);

  const fetchSummary = async () => {
    if (!month) {
      setSummary(null);
      return;
    }
    const data = await getMonthlySummary(month);
    setSummary(data);
  };

  const downloadExcel = () => {
    if (!summary) return;
    const ws = XLSX.utils.json_to_sheet(summary.expenses || []);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Monthly Report");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    saveAs(blob, `Expense_Report_${summary.month || "report"}.xlsx`);
  };

  const downloadPdf = () => {
    if (!summary) return;
    const doc = new jsPDF();
    doc.text("Monthly Expense Report", 14, 12);
    doc.text(`Month: ${summary.month}`, 14, 20);
    doc.text(`Total: INR ${summary.total || 0}`, 14, 28);

    let currentY = 36;
    const chartCanvas = categoryChartRef.current?.canvas;
    const trendCanvas = trendChartRef.current?.canvas;
    if (trendCanvas) {
      const imgData = trendCanvas.toDataURL("image/png", 1.0);
      doc.addImage(imgData, "PNG", 14, currentY, 180, 70);
      currentY += 78;
    }
    if (chartCanvas) {
      const imgData = chartCanvas.toDataURL("image/png", 1.0);
      doc.addImage(imgData, "PNG", 14, currentY, 180, 80);
      currentY += 90;
    }

    const rows = (summary.expenses || []).map((e) => [
      e.title,
      e.category,
      `INR ${e.amount}`,
      e.date
    ]);

    autoTable(doc, {
      head: [["Title", "Category", "Amount", "Date"]],
      body: rows,
      startY: currentY
    });

    doc.save(`Expense_Report_${summary.month || "report"}.pdf`);
  };

  const downloadCsv = () => {
    if (!summary) return;
    const rows = [["Title", "Category", "Amount", "Date"]];
    (summary.expenses || []).forEach((e) => {
      rows.push([e.title, e.category, e.amount, e.date]);
    });
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `Expense_Report_${summary.month || "report"}.csv`);
  };

  const byCategory = (summary && summary.byCategory) ? summary.byCategory : {};
  const expenses = (summary && summary.expenses) ? summary.expenses : [];

  const categoryLabels = Object.keys(byCategory);
  const categoryTotals = Object.values(byCategory);

  const categoryChartData = {
    labels: categoryLabels,
    datasets: [
      {
        label: "Category Total",
        data: categoryTotals,
        backgroundColor: "#4f46e5"
      }
    ]
  };

  const trendLabels = trends.map((t) => t.month);
  const trendTotals = trends.map((t) => Number(t.total));

  const trendChartData = {
    labels: trendLabels,
    datasets: [
      {
        label: "Monthly Spend",
        data: trendTotals,
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.2)",
        tension: 0.3
      }
    ]
  };

  return (
    <>
      <h3>Monthly Summary</h3>

      <input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
      />

      <button onClick={fetchSummary}>Get Summary</button>

      {trends.length > 0 && (
        <div className="report" style={{ marginTop: "16px" }}>
          <h4>Monthly Trend</h4>
          <Line ref={trendChartRef} data={trendChartData} />
        </div>
      )}

      {summary && (
        <div className="report">
          <h3>Total: <span>{INR}</span> {summary.total || 0}</h3>

          <h4>Category-wise Summary</h4>
          <ul>
            {Object.entries(byCategory).map(([cat, amt]) => (
              <li key={cat}>
                {cat} : <span>{INR}</span> {amt}
              </li>
            ))}
          </ul>

          {categoryLabels.length > 0 && (
            <div style={{ marginTop: "12px" }}>
              <Bar ref={categoryChartRef} data={categoryChartData} />
            </div>
          )}

          <h4>Expenses</h4>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td>{e.title}</td>
                  <td>{e.category}</td>
                  <td><span>{INR}</span> {e.amount}</td>
                  <td>{e.date}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="download-actions">
            <button onClick={downloadExcel}>Download Report (Excel)</button>
            <button onClick={downloadCsv}>Download Report (CSV)</button>
            <button onClick={downloadPdf}>Download Report (PDF)</button>
          </div>
        </div>
      )}
    </>
  );
}
