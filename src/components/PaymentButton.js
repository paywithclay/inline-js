import Modal from "./Modal.js";

export default class PaymentButton {
  constructor(amount, currency) {
    this.amount = amount;
    this.currency = currency;
  }

  createButton() {
    const button = document.createElement("button");
    button.innerText = `Pay ${this.amount} ${this.currency}`;
    button.onclick = () => this.showLoading();
    return button;
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = ""; // Clear previous content
      container.appendChild(this.createButton());
    } else {
      console.error(`Container with ID ${containerId} not found.`);
    }
  }

  showLoading() {
    const loading = document.createElement("div");
    loading.className = "lds-ripple";
    loading.innerHTML = "<div></div><div></div>";
    document.body.appendChild(loading);
    const shadow = document.createElement("div");
    shadow.className = "shadow";
    document.body.appendChild(shadow);

    const modal = new Modal();
    modal.render("payment-modal-container");
  }
}
