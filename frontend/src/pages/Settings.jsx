import { useState, useEffect } from "react";
import Footer from "../components/Footer";

function formatDate(dateStr) {
  if (!dateStr) return "—";

  const d = new Date(dateStr);
  const day = d.getDate();
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
}

export default function Settings({
  priceHistory,
  currentPrice,
  updatePrice,
  fetchPrice,
  fetchPriceHistory,
  allTimeEntries,
  allTimeCups,
}) {
  const [priceInput, setPriceInput] = useState(String(currentPrice || ""));

  useEffect(() => {
    setPriceInput(String(currentPrice || ""));
  }, [currentPrice]);

  async function handleUpdate() {
    const val = parseInt(priceInput);
    if (!val || val <= 0) return;

    try {
      await updatePrice(val);

      if (fetchPrice) await fetchPrice();
      if (fetchPriceHistory) await fetchPriceHistory();

      setPriceInput("");
    } catch (err) {
      console.error("Update failed", err);
    }
  }

  return (
    <div className="page-container">
      {/* PRICE CONFIG */}
      <div className="card">
        <div className="form-label">Price Configuration</div>

        <div className="price-display">
          <div className="hading-price">
            <div className="price-title">Price Per Cup</div>
            <div className="price-subtitle">
              Current price used for billing calculation
            </div>
          </div>
          <div className="price-current">₹{currentPrice}</div>
        </div>

        <div className="price-form">
          <input
            className="price-input"
            type="number"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            placeholder="Enter price"
            min="1"
          />

          <button className="btn-update" onClick={handleUpdate}>
            Update Price
          </button>
        </div>

        <div className="price-note">
          Past months retain their price at time of billing.
        </div>
      </div>

      {/* PRICE HISTORY */}
      <div className="card">
        <div className="form-label">Price History</div>

        {!priceHistory?.length ? (
          <div className="empty-state">No price history available.</div>
        ) : (
          <table className="price-history-table">
            <thead>
              <tr>
                <th>Data Changed</th>
                <th>Price</th>
              </tr>
            </thead>

            <tbody>
              {priceHistory.map((ph, i) => (
                <tr key={i}>
                  <td>{formatDate(ph.effective_from)}</td>
                  <td>₹{ph.price_per_cup}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* DATA */}
      <div className="card">
        <div className="settings-section-label">Data</div>

        <div className="data-row">
          <div>
            <div className="data-row-title">Total Entries Recorded</div>
            <div className="data-row-subtitle">Across all months</div>
          </div>
          <div className="data-row-value">{allTimeEntries}</div>
        </div>

        <div className="data-row">
          <div>
            <div className="data-row-title">Total Cups All Time</div>
          </div>
          <div className="data-row-value">{allTimeCups}</div>
        </div>
      </div>

    </div>
  );
}


