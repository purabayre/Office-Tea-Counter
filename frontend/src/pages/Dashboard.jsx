import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns/format";
import Footer from "../components/Footer";

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

  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

function nowTimeStr() {
  const d = new Date();

  let h = d.getHours();
  const m = d.getMinutes();

  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h ? h : 12;

  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatTime12h(time) {
  if (!time) return "";

  let h = 0,
    m = 0;

  if (time.includes("T")) {
    const d = new Date(time);
    h = d.getHours();
    m = d.getMinutes();
  } else if (time.includes(":")) {
    const [hour, minute] = time.split(":");
    h = Number(hour);
    m = Number(minute);
  } else {
    return time;
  }

  const ampm = h >= 12 ? "PM" : "AM";

  h = h % 12;
  if (h === 0) h = 12;

  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function Dashboard({
  entries,
  todayStr,
  loading,
  currentPrice,
  addEntry,
  deleteEntry,
  editEntry,
  monthlyStats,
}) {
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [cupsInput, setCupsInput] = useState("");
  const [editingEntry, setEditingEntry] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);
  const [date, setDate] = useState(new Date());
  const [toast, setToast] = useState(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const todayEntries = (entries || []).filter(
    (e) => e.date?.slice(0, 10) === selectedDate,
  );

  const cupsToday = todayEntries.reduce((s, e) => s + (e.cup_count || 0), 0);

  const now = new Date();
  const mStats = monthlyStats(now.getFullYear(), now.getMonth() + 1);

  const monthNames = [
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
  const monthLabel = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  async function handleAdd() {
    const val = Number(cupsInput);

    if (!val || val <= 0 || !Number.isInteger(val)) {
      showToast("Please enter a valid number of tea cups");

      setCupsInput("");
      return;
    }

    setAdding(true);

    try {
      await addEntry(val, selectedDate);

      setCupsInput("");
      showToast(`Successfully added ${val} tea cups`);
    } finally {
      setAdding(false);
    }
  }
  function showToast(message) {
    setToast(message);

    setTimeout(() => {
      setToast(null);
    }, 2500);
  }
  function handleKeyDown(e) {
    if (e.key === "Enter") handleAdd();
  }

  const totalCupsToday = todayEntries.reduce(
    (s, e) => s + (e.cup_count || 0),
    0,
  );

  const totalAmountToday = todayEntries.reduce(
    (s, e) => s + (e.cup_count || 0) * (e.price_per_cup || currentPrice || 0),
    0,
  );

  const perCupToday =
    totalCupsToday > 0 ? Math.round(totalAmountToday / totalCupsToday) : 0;

  function EditModal({ entry, onSave, onClose, showToast }) {
    const [cups, setCups] = useState(entry.cup_count || 1);
    const [saving, setSaving] = useState(false);

    async function handleSave() {
      const val = parseInt(cups);
      if (!val || val <= 0) return;

      setSaving(true);

      try {
        await onSave(entry._id, val);

        showToast(`Successfully updated to ${val} tea cups`);
        onClose();
      } catch (err) {
        console.log(err);
        showToast("Something went wrong while updating");
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

              <p className="modal-subtitle">Update tea cup quantity</p>
            </div>
          </div>

          <input
            className="modal-input"
            type="number"
            min={1}
            value={cups}
            onChange={(e) => setCups(e.target.value)}
            placeholder="Enter tea cups"
            autoFocus
          />

          <div className="modal-actions">
            <button className="modal-btn-cancel" onClick={onClose}>
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
        await onConfirm(entry._id);
        showToast(`${entry.cup_count} tea cups entry deleted`);

        onClose();
      } catch (err) {
        console.log(err);
        showToast("Something went wrong while deleting");
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
              Are you sure you want to delete
              <strong>
                {" "}
                {entry.cup_count} cup
                {entry.cup_count > 1 ? "s" : ""}
              </strong>{" "}
              entry?
            </p>
          </div>

          <div className="modal-actions">
            <button className="modal-btn-cancel" onClick={onClose}>
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
  return (
    <div className="page-container">
      {/* ADD ENTRY */}
      <div className="card add-entry-card">
        <div className="add-entry-header">
          <div>
            <h2 className="add-entry-title">Add Cup Entry</h2>

            <p className="add-entry-subtitle">
              Record daily tea cup consumption
            </p>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" data-empty={!date} className="dash-btn">
                <CalendarIcon />

                {date ? format(date, "dd MMM yyyy") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  if (!d) return;

                  setDate(d);

                  const formatted = d.toLocaleDateString("en-CA");

                  setSelectedDate(formatted);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="form-row">
          <input
            className="form-input"
            type="number"
            placeholder="Enter tea cups"
            value={cupsInput}
            onChange={(e) => setCupsInput(e.target.value)}
            onKeyDown={handleKeyDown}
            min="1"
          />

          <button className="btn-primary" onClick={handleAdd} disabled={adding}>
            {adding ? (
              <span className="btn-loader">
                <span className="spinner"></span>
                Adding...
              </span>
            ) : (
              "+ Add Entry"
            )}
          </button>
        </div>

        <div className="form-meta">
          <div className="meta-item">
            <span className="meta-label">Date</span>

            <span className="meta-value">
              {formatDisplayDate(selectedDate)}
            </span>
          </div>

          <div className="meta-divider"></div>

          <div className="meta-item">
            <span className="meta-label">Time</span>

            <span className="meta-value">{nowTimeStr()}</span>
          </div>
        </div>
      </div>

      <div className="summary-grid">
        {/* TODAY SUMMARY */}
        <div className="summary-section">
          <div className="summary-header">
            <div>
              <h2 className="summary-title">Today's Summary</h2>

              <p className="summary-subtitle">
                Overview of today's tea consumption
              </p>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="loader"></div>
              Loading Today's Summary...
            </div>
          ) : (
            <div className="today-summary-grid">
              <div className="today-stat-card">
                <div className="today-stat-value">{cupsToday}</div>

                <div className="today-stat-label">Total Cups</div>
              </div>

              <div className="today-stat-card">
                <div className="today-stat-value">{todayEntries.length}</div>

                <div className="today-stat-label">Entries Added</div>
              </div>

              <div className="today-stat-card teal full-width">
                <div className="today-stat-value teal">₹{totalAmountToday}</div>

                <div className="today-stat-label">Today's Total Amount</div>
              </div>
            </div>
          )}
        </div>

        {/* MONTHLY SUMMARY */}
        <div className="summary-section">
          <div className="summary-header">
            <div>
              <h2 className="summary-title">Monthly Summary</h2>

              <p className="summary-subtitle">
                {monthLabel} overview and billing statistics
              </p>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="loader"></div>
              Loading Monthly Summary...
            </div>
          ) : (
            <div className="monthly-summary-grid-new">
              <div className="monthly-stat-card-new">
                <div className="monthly-stat-value-new">{mStats.totalCups}</div>

                <div className="monthly-stat-label-new">Total Cups</div>
              </div>

              <div className="monthly-stat-card-new">
                <div className="monthly-stat-value-new">
                  {mStats.totalEntries}
                </div>

                <div className="monthly-stat-label-new">Entries Added</div>
              </div>

              <div className="monthly-stat-card-new">
                <div className="monthly-stat-value-new">
                  ₹{currentPrice || 0}
                </div>

                <div className="monthly-stat-label-new">Current Cup Price</div>
              </div>

              <div className="monthly-stat-card-new teal">
                <div className="monthly-stat-value-new teal">
                  ₹{mStats.totalAmount || 0}
                </div>

                <div className="monthly-stat-label-new">Total Amount</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="card">
        <div className="entries-header">
          <div>
            <h1 className="entries-main-title">Today's Entries</h1>

            <p className="entries-subtitle">
              Daily tea cup tracking and billing records
            </p>
          </div>

          <span className="badge">{todayEntries.length} Entries</span>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="loader"></div>
            Loading entries...
          </div>
        ) : todayEntries.length === 0 ? (
          <div className="empty-state">No entries for selected date.</div>
        ) : (
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
              {todayEntries.map((entry, i) => {
                const pricePerCup = entry.price_per_cup || currentPrice || 0;
                const amount = (entry.cup_count || 0) * pricePerCup;

                return (
                  <tr key={entry._id || i}>
                    <td>{i + 1}</td>
                    <td>
                      {formatDisplayDate(entry.date)} <br />
                    </td>
                    <td>{format(entry.createdAt, "hh:mm a")}</td>
                    <td>₹{pricePerCup}</td>
                    <td>{entry.cup_count}</td>
                    <td>₹{amount}</td>
                    <td className="btns">
                      <button
                        className="btn-edit"
                        onClick={() => setEditingEntry(entry)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn-delete"
                        onClick={() => setDeletingEntry(entry)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {editingEntry && (
        <EditModal
          entry={editingEntry}
          onSave={editEntry}
          onClose={() => setEditingEntry(null)}
          showToast={showToast}
        />
      )}
      {deletingEntry && (
        <DeleteModal
          entry={deletingEntry}
          onConfirm={deleteEntry}
          onClose={() => setDeletingEntry(null)}
          showToast={showToast}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
