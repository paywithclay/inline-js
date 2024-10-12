import PaymentButton from "./components/PaymentButton.js";
import { addStyles } from "./helpers/DOMHelpers.js";

export default class Clay {
  constructor(amount, currency, key, mode = "light") {
    this.amount = amount;
    this.currency = currency;
    this.key = key;
    this.mode = mode;
    this.paymentButton = new PaymentButton(this.amount, this.currency);
    addStyles();
  }

  pay() {
    console.log(
      `Initiating payment of ${this.amount} ${this.currency} using key: ${this.key}`
    );
  }

  renderPaymentButton(containerId) {
    this.paymentButton.render(containerId);
  }
}
