import GestureController from "./GestureController.js";
import Modal from "./Modal.js";
import { trackEvent } from "./Tracking.js";
import { addStyles } from "./Styles.js";

class Clay {
  constructor(a, c, k, mode = "light") {
    this.amount = a;
    this.currency = c;
    this.key = k;
    this.mode = mode;
    this.currentModal = null;
    this.gestureController = new GestureController();
    addStyles();
  }

  pay() {
    console.log(
      `Initiating payment of ${this.amount} ${this.currency} using key: ${this.key}`
    );
  }

  createPaymentModal() {
    if (this.currentModal) {
      this.currentModal.transitionToMode(
        window.innerWidth < 768 ? "mobile" : "desktop"
      );
    } else {
      this.currentModal = new Modal(this.mode);
      document.body.appendChild(this.currentModal.createModalElement());
      this.currentModal.showModal();
      console.log(
        `Modal opened in ${
          window.innerWidth < 768 ? "mobile" : "desktop"
        } mode.`
      );
      trackEvent("MODAL_OPEN");
    }
  }

  // Other methods...
}

export default Clay;
