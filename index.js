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
    (m.className = "clay-modal"),
      (m.innerHTML = `<div class="clay-modal-content"><span class="clay-close">&times;</span><h2>Payment</h2><p>Amount: ${this.amount} ${this.currency}</p><button id="clay-confirm-button">Confirm Payment</button></div>`),
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
  addStyles() {
    const style = document.createElement("style");
    style.innerHTML = `.clay-modal{display:none;position:fixed;z-index:1000;left:0;top:0;width:100%;height:100%;overflow:auto;background-color:rgba(0,0,0,0.7)}.clay-modal-content{background-color:#fefefe;margin:15% auto;padding:20px;border:1px solid #888;border-radius:30px;box-shadow:0 4px 8px rgba(0,0,0,0.2)}.clay-close{color:#aaa;float:right;font-size:28px;font-weight:bold}.clay-close:hover,.clay-close:focus{color:black;text-decoration:none;cursor:pointer}@media (max-width: 768px){.clay-modal-content{width:100%;margin:0;padding:20px;border-radius:0;}}`;
    document.head.appendChild(style);
  }
}
if (typeof window !== "undefined") {
  window.Clay = Clay;
}
module.exports = Clay;
