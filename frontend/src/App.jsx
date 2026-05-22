import { useEffect, useState, useRef } from "react"
import Navbar from "./components/Navbar"
import Dashboard from "./pages/Dashboard"
import MonthlyView from "./pages/MonthlyView"
import Settings from "./pages/Settings"
import API from "./api"
import Footer from "./components/Footer"

function todayStr() {
  return new Date().toISOString().split("T")[0]
}

export default function App() {
  const [page, setPage] = useState("dashboard")

  const [entries, setEntries] = useState([])
  const [price, setPrice] = useState(0)
  const [priceHistory, setPriceHistory] = useState([])
  const [loading, setLoading] = useState(false)

  const [monthSummary, setMonthSummary] = useState({
    totalCups: 0,
    totalEntries: 0,
    totalAmount: 0
  })

  const today = todayStr()

  const hasLoadedDashboard = useRef(false)
  const hasLoadedSettings = useRef(false)

  // ✅ DASHBOARD API
  async function loadDashboard() {
    setLoading(true)
    try {
      const now = new Date()

      const [todayRes, summaryRes, priceRes] =
        await Promise.all([
          API.get("/entries/today"),
          API.get(`/entries/monthsummary?year=${now.getFullYear()}&month=${now.getMonth() + 1}`),
          API.get("/price/current"),
        ])

      setEntries(todayRes.data.entries || [])

      setMonthSummary(summaryRes.data || {
        totalCups: 0,
        totalEntries: 0,
        totalAmount: 0
      })

      setPrice(priceRes.data.price || 0)

    } catch (err) {
      console.log("dashboard error:", err.message)
    } finally {
      setLoading(false)
    }
  }

  // ✅ MONTHLY API
  async function loadMonthly(year, month) {
    setLoading(true)
    try {
      const res = await API.get(
        `/entries/month?year=${year}&month=${month}`
      )

      setEntries(res.data.entries || [])
    } catch (err) {
      console.log("monthly error:", err.message)
    } finally {
      setLoading(false)
    }
  }

  // ✅ SETTINGS API
  async function loadSettings() {
    try {
      const [priceRes, historyRes] = await Promise.all([
        API.get("/price/current"),
        API.get("/price/history"),
      ])

      setPrice(priceRes.data.price || 0)
      setPriceHistory(historyRes.data.history || [])

    } catch (err) {
      console.log("settings error:", err.message)
    }
  }

  // ✅ PAGE BASED API CALL
  useEffect(() => {
    if (page === "dashboard" && !hasLoadedDashboard.current) {
      hasLoadedDashboard.current = true
      loadDashboard()
    }

    if (page === "settings" && !hasLoadedSettings.current) {
      hasLoadedSettings.current = true
      loadSettings()
    }

    // ✅ Monthly page open → API call
    if (page === "monthly") {
      const now = new Date()
      loadMonthly(now.getFullYear(), now.getMonth() + 1)
    }

  }, [page])

  // ✅ REFRESH
  async function refreshEntries() {
    if (page === "dashboard") {
      await loadDashboard()
    }
  }

  // ✅ ADD
  async function addEntry(cups, date) {
    try {
      await API.post("/entries/add", {
        date: date || today,
        cup_count: parseInt(cups),
        price_per_cup: price,
        time: new Date().toLocaleTimeString(),
      })

      await refreshEntries()
    } catch (err) {
      console.log("add error:", err.message)
    }
  }

  // ✅ DELETE
  async function deleteEntry(id) {
    try {
      await API.delete(`/entries/delete/${id}`)
      await refreshEntries()
    } catch (err) {
      console.log("delete error:", err.message)
      throw err
    }
  }

  // ✅ UPDATE
  async function editEntry(id, cups) {
    try {
      await API.put(`/entries/update/${id}`, {
        cup_count: parseInt(cups),
      })

      await refreshEntries()
    } catch (err) {
      console.log("edit error:", err.message)
      throw err
    }
  }

  // ✅ PRICE UPDATE
  async function updatePrice(newPrice) {
    try {
      await API.post("/price/set", { price: newPrice })
      setPrice(newPrice)

      if (page === "settings") {
        await loadSettings()
      }
    } catch (err) {
      console.log("price error:", err.message)
    }
  }

  return (
    <div>
      <Navbar page={page} setPage={setPage} />

      {page === "dashboard" && (
        <Dashboard
          entries={entries}
          todayStr={today}
          currentPrice={price}
          addEntry={addEntry}
          deleteEntry={deleteEntry}
          editEntry={editEntry}
          monthlyStats={() => monthSummary}
          loading={loading}
        />
      )}

      {page === "monthly" && (
        <MonthlyView
          allEntries={entries}
          currentPrice={price}
          deleteEntry={deleteEntry}
          editEntry={editEntry}
          fetchMonth={loadMonthly} // ✅ IMPORTANT
        />
      )}

      {page === "settings" && (
        <Settings
          currentPrice={price}
          priceHistory={priceHistory}
          updatePrice={updatePrice}
          allTimeEntries={monthSummary.totalEntries}
          allTimeCups={monthSummary.totalCups}
        />
      )}

      <Footer />
    </div>
  )
}