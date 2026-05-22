import { useEffect, useState, useRef, useCallback } from "react"
import Navbar from "./components/Navbar"
import Dashboard from "./pages/Dashboard"
import MonthlyView from "./pages/MonthlyView"
import Settings from "./pages/Settings"
import API, { getMonthlyEntries } from "./api"
import Footer from "./components/Footer"

const MONTHLY_PAGE_LIMIT = 10

function todayStr() {
  return new Date().toISOString().split("T")[0]
}

export default function App() {
  const [page, setPage] = useState("dashboard")

  const [entries, setEntries] = useState([])
  const [price, setPrice] = useState(0)
  const [priceHistory, setPriceHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [monthlyPagination, setMonthlyPagination] = useState({
    page: 1,
    limit: MONTHLY_PAGE_LIMIT,
    totalEntries: 0,
    totalPages: 1,
    totalCups: 0,
    totalAmount: 0
  })

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
  const loadMonthly = useCallback(async (year, month, page = 1, limit = MONTHLY_PAGE_LIMIT) => {
    setLoading(true)
    try {
      const res = await getMonthlyEntries(year, month, page, limit)

      setEntries(res.data.entries || [])
      setMonthlyPagination({
        page: res.data.page || page,
        limit: res.data.limit || limit,
        totalEntries: res.data.totalEntries || 0,
        totalPages: res.data.totalPages || 1,
        totalCups: res.data.totalCups || 0,
        totalAmount: res.data.totalAmount || 0
      })

      if (typeof res.data.currentPrice === "number") {
        setPrice(res.data.currentPrice)
      }
    } catch (err) {
      console.log("monthly error:", err.message)
    } finally {
      setLoading(false)
    }
  }, [])

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
          pagination={monthlyPagination}
          pageLimit={MONTHLY_PAGE_LIMIT}
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
