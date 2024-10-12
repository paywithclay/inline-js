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
      </div>`;

    m.querySelector(".clay-close").onclick = () => {
      this.closeModal(m);
    };

    m.querySelector("#clay-confirm-button").onclick = () => {
      this.pay(); // Simulate payment process
      this.closeModal(m); // Close modal after payment
    };

    document.body.appendChild(m);
    m.style.display = "block";
  }

  showLoading() {
    const loading = document.createElement("div");
    loading.className = "loading";
    loading.innerText = "Loading...";
    document.body.appendChild(loading);

    // Show shadow covering entire page
    const shadow = document.createElement("div");
    shadow.className = "shadow";
    document.body.appendChild(shadow);

    // Show the payment modal after loading
    this.createPaymentModal();
  }

  closeModal(modal) {
    modal.style.display = "none";
    modal.remove(); // Remove modal from DOM
    this.removeLoading(); // Remove loading indicator and shadow
  }

  removeLoading() {
    const loading = document.querySelector(".loading");
    const shadow = document.querySelector(".shadow");
    if (loading) loading.remove(); // Remove loading indicator
    if (shadow) shadow.remove(); // Remove shadow
  }

  createPaymentButton() {
    const b = document.createElement("button");
    b.innerText = `Pay ${this.amount} ${this.currency}`;
    b.onclick = () => this.showLoading(); // Show loading when button is clicked
    return b;
  }

  addStyles() {
    const style = document.createElement("style");
    style.innerHTML = `
      .clay-modal {
        display: none;
        position: fixed;
        z-index: 1001; /* Ensure modal is above shadow */
        left: 0;
        bottom: 0; /* Bottom sheet */
        width: 100%; /* Full width */
        height: auto; /* Adjust height as needed */
        background-color: #fefefe; /* Background for modal */
        border-radius: 30px 30px 0 0; /* Rounded top corners */
        box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.2); /* Shadow above */
      }
      .clay-modal-content {
        padding: 20px;
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
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 20px;
        z-index: 1002; /* Above shadow */
      }
      .shadow {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7); /* Shadow covering entire page */
        z-index: 1000; /* Below loading and modal */
      }
    `;
    document.head.appendChild(style);
  }
}

if (typeof window !== "undefined") {
  window.Clay = Clay;
}
module.exports = Clay;
