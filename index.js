// index.js
class Clay {
  constructor(a, c, k) {
    (this.amount = a), (this.currency = c), (this.key = k);
    this.addStyles();
  }

  pay() {
    console.log(
      `Initiating payment of ${this.amount} ${this.currency} using key: ${this.key}`
    );
  }

  createPaymentModal() {
    const m = document.createElement("div");
    m.className = "clay-modal";
    m.innerHTML = `
      <div class="clay-modal-content">
        <span class="clay-close">&times;</span>
        <h2>Payment</h2>
        <p>Amount: ${this.amount} ${this.currency}</p>
        <button id="clay-confirm-button">Confirm Payment</button>
        <div id="loading" class="loading" style="display: none;">Loading...</div>
      </div>`;

    m.querySelector(".clay-close").onclick = () => {
      m.style.display = "none";
    };

    m.querySelector("#clay-confirm-button").onclick = () => {
      this.showLoading(m);
    };

    document.body.appendChild(m);
    m.style.display = "block";
  }

  showLoading(modal) {
    const loading = modal.querySelector("#loading");
    loading.style.display = "block"; // Show loading indicator
    setTimeout(() => {
      this.pay(); // Simulate payment process
      loading.style.display = "none"; // Hide loading indicator
      modal.style.display = "none"; // Hide modal after payment
    }, 2000); // Simulate a delay for payment processing
  }

  createPaymentButton() {
    const b = document.createElement("button");
    b.innerText = `Pay ${this.amount} ${this.currency}`;
    b.onclick = () => this.createPaymentModal();
    return b;
  }

  addStyles() {
    const style = document.createElement("style");
    style.innerHTML = `
      .clay-modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        bottom: 0; /* Bottom sheet */
        width: 100%; /* Full width */
        height: auto; /* Adjust height as needed */
        background-color: rgba(0, 0, 0, 0.7); /* Background for modal */
      }
      .clay-modal-content {
        background-color: #fefefe;
        margin: 0; /* Remove margin for full width */
        padding: 20px;
        border: 1px solid #888;
        border-radius: 30px 30px 0 0; /* Rounded top corners */
        box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.2); /* Shadow above */
      }
      .clay-close {
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
      }
      .clay-close:hover, .clay-close:focus {
        color: black;
        text-decoration: none;
        cursor: pointer;
      }
      .loading {
        text-align: center;
        font-size: 20px;
        margin-top: 20px;
      }
    `;
    document.head.appendChild(style);
  }
}

if (typeof window !== "undefined") {
  window.Clay = Clay;
}
module.exports = Clay;
