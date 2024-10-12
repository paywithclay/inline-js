// index.js
class Clay {
  constructor(a, c, k) {
    (this.amount = a), (this.currency = c), (this.key = k);
  }
  pay() {
    console.log(
      `Initiating payment of ${this.amount} ${this.currency} using key: ${this.key}`
    );
  }
  createPaymentModal() {
    const m = document.createElement("div");
    (m.className = "clay-modal"),
      (m.innerHTML = `<div class="clay-modal-content" style="border-radius: 20px; overflow: hidden; width: 300px; margin: auto;"><span class="clay-close">&times;</span><h2>Payment</h2><p>Amount: ${this.amount} ${this.currency}</p><button id="clay-confirm-button">Confirm Payment</button></div>`),
      (m.querySelector(".clay-close").onclick = () => {
        m.style.display = "none";
      }),
      (m.querySelector("#clay-confirm-button").onclick = () => {
        this.pay(), (m.style.display = "none");
      }),
      document.body.appendChild(m),
      (m.style.display = "block");
  }
  createPaymentButton() {
    const b = document.createElement("button");
    return (
      (b.innerText = `Pay ${this.amount} ${this.currency}`),
      (b.onclick = () => this.createPaymentModal()),
      b
    );
  }
}
if (typeof window !== "undefined") {
  window.Clay = Clay;
}
module.exports = Clay;
