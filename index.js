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
  }

  createPaymentButton() {
    const button = document.createElement("button");
    button.innerText = `Pay ${this.amount} ${this.currency}`;
    button.onclick = () => this.pay();
    return button;
  }
}

// Expose the library to the global scope
if (typeof window !== "undefined") {
  window.Clay = Clay;
}

// Export for Node.js
module.exports = Clay;
