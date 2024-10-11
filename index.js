// index.js
class Clay {
  constructor(amount, currency, key) {
    this.amount = amount;
    this.currency = currency;
    this.key = key; // This should be your public key
  }

  pay() {
    // Open an empty popup window
    const popup = window.open("", "PaymentPopup", "width=600,height=400");

    // You can optionally add content to the popup if needed
    if (popup) {
      popup.document.write(`
        <html>
          <head>
            <title>Payment</title>
          </head>
          <body>
            <h1>Processing Payment</h1>
            <p>Amount: ${this.amount} ${this.currency}</p>
          </body>
        </html>
      `);
      popup.document.close(); // Close the document to finish loading
    } else {
      console.log("Popup blocked or failed to open.");
    }
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
export default Clay;
