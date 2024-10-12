// index.js
class Clay {
  constructor(amount, currency, key) {
    this.amount = amount;
    this.currency = currency;
    this.key = key;
  }

  pay() {
    // Implement the payment logic here
    // For demonstration, just logging the payment details
    console.log(
      `Initiating payment of ${this.amount} ${this.currency} using key: ${this.key}`
    );

    // Call your payment gateway API here, e.g., Paystack, Flutterwave, etc.
    // This is where you would normally handle the payment logic
  }

  createPaymentModal() {
    const modal = document.createElement("div");
    modal.className = "clay-modal";
    modal.innerHTML = `
      <div class="clay-modal-content" style="border-radius: 20px; overflow: hidden; width: 300px; margin: auto;">
        <span class="clay-close">&times;</span>
        <h2>Payment</h2>
        <p>Amount: ${this.amount} ${this.currency}</p>
        <button id="clay-confirm-button">Confirm Payment</button>
      </div>
    `;

    // Close modal functionality
    const closeButton = modal.querySelector(".clay-close");
    closeButton.onclick = () => {
      modal.style.display = "none";
    };

    // Confirm payment button functionality
    const confirmButton = modal.querySelector("#clay-confirm-button");
    confirmButton.onclick = () => {
      this.pay();
      modal.style.display = "none"; // Close the modal after payment
    };

    // Append modal to the body
    document.body.appendChild(modal);

    // Display the modal
    modal.style.display = "block";
  }

  createPaymentButton() {
    const button = document.createElement("button");
    button.innerText = `Pay ${this.amount} ${this.currency}`;
    button.onclick = () => this.createPaymentModal();
    return button;
  }
}

// Expose the library to the global scope
if (typeof window !== "undefined") {
  window.Clay = Clay;
}

// Export for Node.js
module.exports = Clay;
