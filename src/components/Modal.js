import GestureController from "./GestureController.js";
import { addStyles } from "../helpers/DOMHelpers.js";

export default class Modal {
  constructor(mode = "light") {
    this.mode = mode;
    this.currentModal = null;
    this.gestureController = new GestureController();
    addStyles();
  }

  createModalElement() {
    const modal = document.createElement("div");
    const isMobile = window.innerWidth < 768;
    modal.className = `clay-modal ${isMobile ? "mobile" : "desktop"} ${
      this.mode
    }`;
    modal.innerHTML = `
      <div class="clay-modal-content">
        <div class="modal-header">
          <span class="modal-icon">[SVG ICON HERE]</span>
          <span class="modal-title">Pay with Clay</span>
          <span class="modal-icon clay-close" style="cursor: pointer;">[CLOSE SVG]</span>
        </div>
        <div class="wallet-options">
          <div class="wallet-option"><img src="path/to/walletconnect.png" alt="WalletConnect"/><span>WalletConnect</span></div>
          <div class="wallet-option"><img src="path/to/phantom.png" alt="Phantom"/><span>Phantom</span></div>
        </div>
      </div>`;

    this.gestureController.addGestureHandlers(
      modal,
      this.closeModal.bind(this, modal)
    );

    modal.querySelector(".clay-close").onclick = () => this.closeModal(modal);

    return modal;
  }

  showModal() {
    this.currentModal.style.display = "block";
    setTimeout(() => this.currentModal.classList.add("show"), 10);
  }

  closeModal(modal) {
    modal.classList.remove("show");
    modal.style.transition = "transform 0.3s ease, opacity 0.3s ease";
    modal.style.transform = "translateY(100%)";
    setTimeout(() => {
      modal.style.display = "none";
      modal.remove();
      this.currentModal = null;
    }, 300);
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = ""; // Clear existing content
      const modal = this.createModalElement();
      this.currentModal = modal;
      container.appendChild(modal);
      this.showModal();
    } else {
      console.error(`Container with ID ${containerId} not found.`);
    }
  }
}
