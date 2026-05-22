import { Calendar } from "@/components/ui/calendar"
import { useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from 'date-fns'
import Footer from "../components/Footer"

function formatDisplayDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${parseInt(d)}-${months[parseInt(m) - 1]}-${y}`
}

function nowTimeStr() {
  const d = new Date()

  let h = d.getHours()
  const m = d.getMinutes()

  const ampm = h >= 12 ? "PM" : "AM"
  h = h % 12
  h = h ? h : 12

  return `${h}:${String(m).padStart(2, "0")} ${ampm}`
}

function formatTime12h(time) {
  if (!time) return ""

  let h = 0, m = 0

  if (time.includes("T")) {
    const d = new Date(time)
    h = d.getHours()
    m = d.getMinutes()
  } else if (time.includes(":")) {
    const [hour, minute] = time.split(":")
    h = Number(hour)
    m = Number(minute)
  } else {
    return time
  }

  const ampm = h >= 12 ? "PM" : "AM"

  h = h % 12
  if (h === 0) h = 12

  return `${h}:${String(m).padStart(2, "0")} ${ampm}`
}

export default function Dashboard({
  entries,
  todayStr,
  loading,
  currentPrice,
  addEntry,
  deleteEntry,
  editEntry,
  monthlyStats
}) {

  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [cupsInput, setCupsInput] = useState('')
  const [editingEntry, setEditingEntry] = useState(null)
  const [deletingEntry, setDeletingEntry] = useState(null)
  const [date, setDate] = useState(new Date())
  const [toast, setToast] = useState(null)
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState(false)


  const todayEntries = (entries || []).filter(
    (e) => e.date?.slice(0, 10) === selectedDate
  )


  const cupsToday = todayEntries.reduce((s, e) => s + (e.cup_count || 0), 0)

  const now = new Date()
  const mStats = monthlyStats(now.getFullYear(), now.getMonth() + 1)

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  const monthLabel = `${monthNames[now.getMonth()].toUpperCase()} ${now.getFullYear()}`


  async function handleAdd() {
    const val = Number(cupsInput)

    if (!val || val <= 0 || !Number.isInteger(val)) {
      showToast("Please enter valid number of cups")

      setCupsInput("")
      return
    }

    setAdding(true)

    try {
      await addEntry(val, selectedDate)

      setCupsInput("")
      showToast(`Added ${val} cups at ${nowTimeStr()}`)
    } finally {
      setAdding(false)
    }
  }
  function showToast(message) {
    setToast(message)

    setTimeout(() => {
      setToast(null)
    }, 2500)
  }
  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAdd()
  }

  const totalCupsToday = todayEntries.reduce(
    (s, e) => s + (e.cup_count || 0),
    0
  );

  const totalAmountToday = todayEntries.reduce(
    (s, e) =>
      s + (e.cup_count || 0) * (e.price_per_cup || currentPrice || 0),
    0
  );

  const perCupToday =
    totalCupsToday > 0
      ? Math.round(totalAmountToday / totalCupsToday)
      : 0;

  function EditModal({ entry, onSave, onClose, showToast }) {
    const [cups, setCups] = useState(entry.cup_count || 1)
    const [saving, setSaving] = useState(false)

    async function handleSave() {
      const val = parseInt(cups)
      if (!val || val <= 0) return

      setSaving(true)

      try {
        await onSave(entry._id, val)

        showToast(`Updated to ${val} cups`)
        onClose()
      } catch (err) {
        console.log(err)
        showToast("Update failed ❌")
      } finally {
        setSaving(false)
      }
    }

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box" onClick={e => e.stopPropagation()}>
          <h2 className="modal-title">Edit Entry</h2>

          <label className="modal-label">Tea Cups Count</label>
          <input
            className="modal-input"
            type="number"
            min={1}
            value={cups}
            onChange={e => setCups(e.target.value)}
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
                  <span className="spinner"></span> Saving...
                </span>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  function DeleteModal({ entry, onConfirm, onClose, showToast }) {
    const [deleting, setDeleting] = useState(false)

    async function handleDelete() {
      setDeleting(true)

      try {
        await onConfirm(entry._id)
        showToast(`Deleted ${entry.cup_count} cups entry`)

        onClose()
      } catch (err) {
        console.log(err)
        showToast("Delete failed ❌")
      } finally {
        setDeleting(false)
      }
    }

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box" onClick={e => e.stopPropagation()}>
          <h2 className="modal-title">Delete Entry</h2>

          <p className="modal-delete-msg">
            Delete <strong>{entry.cup_count} cups</strong> entry?
          </p>

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
                  <span className="spinner"></span> Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="page-container">
      {/* ADD ENTRY */}
      <div className="card add-entry-card">
        <div className='date'>
          <h1>Add Cup Entry</h1>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                data-empty={!date}
                className="dash-btn"

              >
                <CalendarIcon />
                {date ? format(date, "dd-MMM-yyyy") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  if (!d) return

                  setDate(d)

                  const formatted = d.toLocaleDateString('en-CA')

                  setSelectedDate(formatted)
                }}
              />
            </PopoverContent>
          </Popover>

        </div>
        <label className="form-label">Tea Cups Count</label>

        <div className="form-row">
          <input
            className="form-input"
            type="number"
            placeholder="Add Cup"
            value={cupsInput}
            onChange={e => setCupsInput(e.target.value)}
            onKeyDown={handleKeyDown}
            min="1"
          />
          <button
            className="btn-primary"
            onClick={handleAdd}
            disabled={adding}
          >
            {adding ? (
              <span className="btn-loader">
                <span className="spinner"></span> Adding...
              </span>
            ) : (
              "+ Add Entry"
            )}
          </button>
        </div>

        <div className="form-meta">
          Date: <span>{formatDisplayDate(selectedDate)}</span> &nbsp;
          Time: <span>{nowTimeStr()}</span> (auto)
        </div>
      </div>


      <div className="summary-grid">

        {/* TODAY SUMMARY */}
        <div className="summary-section">
          <div className="form-label">Today's Summary</div>

          {loading ? (
            <div className="empty-state">
              <div className="loader"></div>
              Loading Todays Summary...
            </div>
          ) : (
            <div className="stat-cards stat-custom-layout">

              <div className="stat-top">
                <div className="stat-card">
                  <div className="stat-value">{cupsToday}</div>
                  <div className="stat-label">Cups</div>
                </div>

                <div className="stat-card">
                  <div className="stat-value">{todayEntries.length}</div>
                  <div className="stat-label">Entries</div>
                </div>
              </div>

              <div className="stat-bottom">
                <div className="stat-card teal full">
                  <div className="stat-value">₹{totalAmountToday}</div>
                  <div className="stat-label">Today Total Amount</div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* MONTHLY SUMMARY */}
        <div className="summary-section">
          <div className="form-label">
            Monthly Summary - {monthLabel}
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="loader"></div>
              Monthly Summary Loading...
            </div>
          ) : (
            <div className="stat-cards">
              <div className="stat-card">
                <div className="stat-value">{mStats.totalCups}</div>
                <div className="stat-label">Total Cups</div>
              </div>

              <div className="stat-card">
                <div className="stat-value">{mStats.totalEntries}</div>
                <div className="stat-label">Entries</div>
              </div>

              <div className="stat-card">
                <div className="stat-value">₹{currentPrice || 0}</div>
                <div className="stat-label">Current Cup Price</div>
              </div>

              <div className="stat-card teal">
                <div className="stat-value">
                  ₹{mStats.totalAmount || 0}
                </div>
                <div className="stat-label">Total Amount</div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* TABLE */}
      <div className="card">
        <div className="entries-header">
          <h1>Today's Entries</h1>
          <span className="badge">{todayEntries.length} entries</span>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="loader"></div>
            Loading entries...
          </div>
        ) : todayEntries.length === 0 ? (
          <div className="empty-state">
            No entries for selected date.
          </div>
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
                const pricePerCup = entry.price_per_cup || currentPrice || 0
                const amount = (entry.cup_count || 0) * pricePerCup

                return (
                  <tr key={entry._id || i} >
                    <td>{i + 1}</td>
                    <td>
                      {formatDisplayDate(entry.date)} <br />
                    </td>
                    <td>
                      {format(entry.createdAt, "hh:mm a")}
                    </td>
                    <td>₹{pricePerCup}</td>
                    <td >{entry.cup_count}</td>
                    <td>₹{amount}</td>
                    <td className='btns'>
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
                )
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
      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}

    </div>
  )
}