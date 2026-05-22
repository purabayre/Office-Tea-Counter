import { useState, useEffect } from "react";
import { HiPrinter } from "react-icons/hi2";
import API from "../api";

const ALL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns/format";

function formatDisplayDate(dateStr) {
  if (!dateStr) return "";

  const [y, m, d] = dateStr.split("-");

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
}

function formatTime12h(time) {
  if (!time) return "";

  // ISO format
  if (time.includes("T")) {
    const d = new Date(time);
    let h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";

    h = h % 12 || 12;

    return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
  }

  // HH:MM format
  if (time.includes(":")) {
    let [h, m] = time.split(":");
    h = parseInt(h);

    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;

    return `${h}:${m} ${ampm}`;
  }

  return time;
}

function EditModal({ entry, currentPrice, onSave, onClose, showToast }) {
  const [cups, setCups] = useState(entry.cup_count || 1);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const val = parseInt(cups, 10);
    if (!val || val <= 0) return;

    setSaving(true);

    try {
      await onSave(entry.id, val);

      showToast(`Updated to ${val} cups`);

      onClose();
    } catch (err) {
      console.log(err);
      showToast("Update failed ❌");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Edit Entry</h2>

            <p className="modal-subtitle">
              Update tea cup quantity for this entry
            </p>
          </div>
        </div>

        <div className="modal-body">
          <label className="modal-label">Tea Cups Count</label>

          <input
            className="modal-input"
            type="number"
            min={1}
            value={cups}
            onChange={(e) => setCups(e.target.value)}
            autoFocus
          />
        </div>

        <div className="modal-actions">
          <button
            className="modal-btn-cancel"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            className="modal-btn-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <span className="btn-loader">
                <span className="spinner"></span>
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ entry, onConfirm, onClose, showToast }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);

    try {
      await onConfirm(entry.id || entry._id);

      showToast(`Deleted ${entry.cup_count} cups entry`);

      onClose();
    } catch (err) {
      console.log(err);
      showToast("Delete failed ❌");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Delete Entry</h2>

            <p className="modal-subtitle">This action cannot be undone</p>
          </div>
        </div>

        <div className="delete-warning-box">
          <p className="modal-delete-msg">
            Delete{" "}
            <strong>
              {entry.cup_count} cup
              {entry.cup_count !== 1 ? "s" : ""}
            </strong>{" "}
            entry?
          </p>
        </div>

        <div className="modal-actions">
          <button
            className="modal-btn-cancel"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </button>

          <button
            className="modal-btn-delete"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <span className="btn-loader">
                <span className="spinner"></span>
                Deleting...
              </span>
            ) : (
              "Delete Entry"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
export default function MonthlyView({
  allEntries = [],
  currentPrice,
  deleteEntry,
  editEntry,
  fetchMonth,
  pagination = {},
  pageLimit = 10,
}) {
  const now = new Date();

  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [currentPage, setCurrentPage] = useState(1);

  const [editingEntry, setEditingEntry] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);
  const [toast, setToast] = useState(null);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }

  useEffect(() => {
    fetchMonth?.(selectedYear, selectedMonth, currentPage, pageLimit);
  }, [fetchMonth, selectedYear, selectedMonth, currentPage, pageLimit]);

  const mk = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;

  const filtered = allEntries.filter((e) => (e.date || "").slice(0, 7) === mk);

  const totalPages = pagination.totalPages || 1;
  const totalCups = pagination.totalCups || 0;
  const totalAmount = pagination.totalAmount || 0;
  const totalEntries = pagination.totalEntries || 0;

  async function handlePrint() {
    try {
      const res = await API.get("/entries/export/pdf", {
        params: { year: selectedYear, month: selectedMonth },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `tea-report-${selectedYear}-${selectedMonth}.pdf`;
      link.click();
    } catch (err) {
      console.log("PDF export error:", err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteEntry(id);
    } catch (err) {
      alert("Delete not allowed");
    }
  }

  return (
    <div className="page-container">
      <div className="monthly-nav">
        <div className="monthly-nav-left">
          <div className="monthly-nav-header">
            <h2 className="monthly-nav-title">Monthly Summary</h2>

            <p className="monthly-nav-subtitle">
              Filter entries and export reports
            </p>
          </div>

          <div className="month-year">
            <Select
              value={String(selectedMonth)}
              onValueChange={(value) => {
                setSelectedMonth(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="select-month">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>

              <SelectContent position="popper">
                {ALL_MONTHS.map((m, i) => (
                  <SelectItem key={i} value={String(i + 1)}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={String(selectedYear)}
              onValueChange={(value) => {
                setSelectedYear(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="select-month">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>

              <SelectContent position="popper">
                {Array.from({ length: 10 }, (_, i) => {
                  const y = now.getFullYear() - 5 + i;

                  return (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="actions">
          <button className="btn print-btn" onClick={handlePrint}>
            <HiPrinter />
            Print Report
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="summary-section">
        <div className="summary-header">
          <div>
            <h2 className="summary-title">Monthly Summary</h2>

            <p className="summary-subtitle">
              {ALL_MONTHS[selectedMonth - 1]} {selectedYear} overview and
              billing statistics
            </p>
          </div>
        </div>

        <div className="monthly-summary-grid-new1">
          <div className="monthly-stat-card-new">
            <div className="monthly-stat-value-new">{totalCups}</div>

            <div className="monthly-stat-label-new">Total Cups</div>
          </div>

          <div className="monthly-stat-card-new">
            <div className="monthly-stat-value-new">{totalEntries}</div>

            <div className="monthly-stat-label-new">Entries Added</div>
          </div>

          <div className="monthly-stat-card-new">
            <div className="monthly-stat-value-new">₹{currentPrice || 0}</div>

            <div className="monthly-stat-label-new">Current Cup Price</div>
          </div>

          <div className="monthly-stat-card-new teal">
            <div className="monthly-stat-value-new teal">₹{totalAmount}</div>

            <div className="monthly-stat-label-new">Total Amount</div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card">
        <div className="entries-header">
          <div>
            <h1 className="entries-main-title">All Entries</h1>

            <p className="entries-subtitle">
              {ALL_MONTHS[selectedMonth - 1]} {selectedYear}
            </p>
          </div>

          <span className="badge">{totalEntries} Entries</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">No entries found for this month.</div>
        ) : (
          <>
            <table className="entry-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Per Cup</th>
                  <th>Cups</th>
                  <th>Total Price</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((e, i) => {
                  const id = e._id || e.id;
                  const pricePerCup = e.price_per_cup || currentPrice || 0;
                  const total = (e.cup_count || 0) * pricePerCup;

                  return (
                    <tr key={id}>
                      <td>{(currentPage - 1) * pageLimit + i + 1}</td>
                      <td className="date-time">{formatDisplayDate(e.date)}</td>
                      <td>{format(e.createdAt, "hh:mm a")}</td>
                      <td>₹{pricePerCup}</td>
                      <td className="entry-cups">{e.cup_count}</td>
                      <td>₹{total}</td>
                      <td className="btns">
                        <button
                          className="btn-edit"
                          onClick={() =>
                            setEditingEntry({
                              id,
                              cup_count: e.cup_count,
                              date: e.date,
                              time: e.time,
                            })
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="btn-delete"
                          onClick={() =>
                            setDeletingEntry({
                              id,
                              cup_count: e.cup_count,
                              date: e.date,
                              time: e.time,
                            })
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(page - 1, 1))
                  }
                  disabled={currentPage <= 1}
                >
                  Previous
                </button>

                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  className="pagination-btn"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(page + 1, totalPages))
                  }
                  disabled={currentPage >= totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {editingEntry && (
        <EditModal
          entry={editingEntry}
          currentPrice={currentPrice}
          onSave={editEntry}
          onClose={() => setEditingEntry(null)}
          showToast={showToast}
        />
      )}
      {deletingEntry && (
        <DeleteModal
          entry={deletingEntry}
          onConfirm={handleDelete}
          onClose={() => setDeletingEntry(null)}
          showToast={showToast}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
