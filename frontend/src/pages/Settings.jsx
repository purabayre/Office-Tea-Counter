import { useState, useEffect } from "react";
import Footer from "../components/Footer";

function formatDate(dateStr) {
  if (!dateStr) return "—";

  const d = new Date(dateStr);
  const day = d.getDate();
  const monthNames = [
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
        <div className="form-label1">Price Configuration</div>

        <div className="price-display">
          <div className="hading-price">
            <div className="price-title">Price Per Cup</div>

            <div className="price-subtitle">
              Current price used for billing calculation
            </div>
          </div>

          <div className="price-current-wrapper">
            <span className="currency-symbol">₹</span>
            <span className="price-current">{currentPrice}</span>
          </div>
        </div>

        <div className="price-form">
          <input
            className="price-input"
            type="number"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            placeholder="Enter new price"
            min="1"
          />

          <button className="btn-update" onClick={handleUpdate}>
            Update Price
          </button>
        </div>

        <div className="price-note">
          Past months retain their original billing price.
        </div>
      </div>

      {/* PRICE HISTORY */}
      <div className="card">
        <div className="form-label1">Price History</div>

        <div className="price-display">
          <div className="hading-price">
            <div className="price-title">Previous Price Updates</div>

            <div className="price-subtitle">
              Historical tea price changes with effective dates
            </div>
          </div>

          <div className="price-current-wrapper">
            <span className="history-count">{priceHistory?.length || 0}</span>
          </div>
        </div>

        {!priceHistory?.length ? (
          <div className="empty-state">No price history available.</div>
        ) : (
          <div className="table-wrapper">
            <table className="price-history-table">
              <thead>
                <tr>
                  <th>Date Changed</th>
                  <th>Price Per Cup</th>
                </tr>
              </thead>

              <tbody>
                {priceHistory.map((ph, i) => (
                  <tr key={i}>
                    <td>{formatDate(ph.effective_from)}</td>

                    <td className="price-history-value">₹{ph.price_per_cup}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DATA */}
      <div className="card">
        <div className="form-label1">Data Overview</div>

        <div className="price-display">
          <div className="hading-price">
            <div className="price-title">Application Statistics</div>

            <div className="price-subtitle">
              Overall tea tracking data across all records
            </div>
          </div>

          <div className="price-current-wrapper">
            <span className="history-count">
              {allTimeEntries + allTimeCups}
            </span>
          </div>
        </div>

        <div className="data-grid">
          <div className="data-stat-card">
            <div className="data-stat-label">Total Entries Recorded</div>

            <div className="data-stat-subtitle">Across all months</div>

            <div className="data-stat-value">{allTimeEntries}</div>
          </div>

          <div className="data-stat-card">
            <div className="data-stat-label">Total Cups All Time</div>

            <div className="data-stat-subtitle">Overall tea consumption</div>

            <div className="data-stat-value">{allTimeCups}</div>
          </div>
        </div>
      </div>
      <div className="company-note">
        <p>
          Tea Counter is designed and maintained by{" "}
          <a
            href="https://aptechsolutions.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="company-link"
          >
            Aptech Solutions
          </a>
          .
        </p>
      </div>
    </div>
  );
}
