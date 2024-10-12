class Modal {
  constructor(mode) {
    this.mode = mode;
    this.modalElement = null;
  }

  createModalElement() {
    const m = document.createElement("div");
    m.className = `clay-modal ${this.mode}`;
    m.innerHTML = `
      <div class="clay-modal-content">
        <div class="modal-header">
          <span class="modal-title">Pay with Clay</span>
          <span class="modal-icon clay-close" style="cursor: pointer;">X</span>
        </div>
        <div class="wallet-options">
          <!-- Wallet options go here -->
        </div>
      </div>
    `;

    this.modalElement = m;

    // Gesture handling
    this.gestureController.addGestureHandlers(m, this.closeModal.bind(this));

    m.querySelector(".clay-close").onclick = () => {
      this.closeModal();
    };

    return m;
  }

  showModal() {
    this.modalElement.style.display = "block";
    setTimeout(() => this.modalElement.classList.add("show"), 10);
  }

  closeModal() {
    this.modalElement.classList.remove("show");
    setTimeout(() => {
      this.modalElement.style.display = "none";
      this.modalElement.remove();
    }, 300);
  }

  // Other modal-related methods...
}

export default Modal;
