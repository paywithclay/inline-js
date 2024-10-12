class Clay {
  constructor(a, c, k, mode = "light") {
    // Added mode parameter
    this.amount = a;
    this.currency = c;
    this.key = k;
    this.mode = mode; // Store mode
    this.currentModal = null; // Track the current modal
    this.gestureController = new GestureController(); // Initialize gesture controller
    this.addStyles();
  }

  pay() {
    console.log(
      `Initiating payment of ${this.amount} ${this.currency} using key: ${this.key}`
    );
  }

  createPaymentModal() {
    if (this.currentModal) {
      this.transitionToMode(window.innerWidth < 768 ? "mobile" : "desktop");
    } else {
      this.currentModal = this.createModalElement();
      document.body.appendChild(this.currentModal);
      this.showModal(this.currentModal);
    }
  }

  createModalElement() {
    const m = document.createElement("div");
    const isMobile = window.innerWidth < 768;
    m.className = `clay-modal ${isMobile ? "mobile" : "desktop"} ${this.mode}`; // Apply mode class
    m.innerHTML = `
      <div class="clay-modal-content">
        <span class="clay-close">&times;</span>
        <h2>Payment</h2>
        <p>Amount: ${this.amount} ${this.currency}</p>
        <button id="clay-confirm-button">Confirm Payment</button>
      </div>`;

    // Gesture handling
    this.gestureController.addGestureHandlers(m, this.closeModal.bind(this, m));

    m.querySelector(".clay-close").onclick = () => {
      this.closeModal(m);
    };

    m.querySelector("#clay-confirm-button").onclick = () => {
      this.pay(); // Simulate payment process
      this.closeModal(m); // Close modal after payment
    };

    return m;
  }

  transitionToMode(mode) {
    if (this.currentModal) {
      const isMobile = mode === "mobile";
      this.currentModal.classList.remove(isMobile ? "desktop" : "mobile");
      this.currentModal.classList.add(mode);
      this.currentModal.style.transition =
        "transform 0.3s ease, opacity 0.3s ease"; // Set transition

      if (isMobile) {
        this.currentModal.style.transform = "translateY(100%)"; // Move to bottom
      } else {
        this.currentModal.style.transform = "translateY(-100%)"; // Move to top
      }

      setTimeout(() => {
        this.currentModal.style.transform = "translateY(0)"; // Slide in
        this.currentModal.style.opacity = "1"; // Fade in
      }, 10);
    }
  }

  showModal(modal) {
    modal.style.display = "block";
    setTimeout(() => modal.classList.add("show"), 10); // Trigger animation
  }

  closeModal(modal) {
    modal.classList.remove("show"); // Remove animation class
    setTimeout(() => {
      modal.style.display = "none";
      modal.remove(); // Remove modal from DOM
      this.currentModal = null; // Reset current modal
      this.removeLoading(); // Remove loading indicator and shadow
    }, 300); // Match duration of CSS transition
  }

  removeLoading() {
    const loading = document.querySelector(".lds-ripple");
    const shadow = document.querySelector(".shadow");
    if (loading) loading.remove(); // Remove loading indicator
    if (shadow) shadow.remove(); // Remove shadow
  }

  createPaymentButton() {
    const b = document.createElement("button");
    b.innerText = `Pay ${this.amount} ${this.currency}`;
    b.onclick = () => this.showLoading(); // Show loading when button is clicked
    return b;
  }

  // New method to render the payment button directly
  renderPaymentButton(containerId) {
    const button = this.createPaymentButton();
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = ""; // Clear previous content
      container.appendChild(button);
    } else {
      console.error(`Container with ID ${containerId} not found.`);
    }
  }

  showLoading() {
    const loading = document.createElement("div");
    loading.className = "lds-ripple";
    loading.innerHTML = `
      <div></div>
      <div></div>
    `;
    document.body.appendChild(loading);

    // Show shadow covering entire page
    const shadow = document.createElement("div");
    shadow.className = "shadow";
    document.body.appendChild(shadow);

    // Show the payment modal after loading
    this.createPaymentModal();
  }

  addStyles() {
    const style = document.createElement("style");
    style.innerHTML = `
      .clay-modal {
        display: none;
        position: fixed;
        z-index: 1001;
        background-color: #fefefe; /* Light mode background */
        box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.2);
        transition: transform 0.3s ease, opacity 0.3s ease; /* Added transition */
        opacity: 0; /* Start hidden */
      }

      .clay-modal.mobile {
        width: 100%;
        height: auto;
        border-radius: 30px 30px 0 0; /* Rounded top corners */
        left: 0;
        bottom: 0; /* Position at the bottom for mobile */
      }

      .clay-modal.desktop {
        width: 400px; /* Set a fixed width for the desktop modal */
        left: 40%; /* Center horizontally */
        top: 50%; /* Center vertically */
        border-radius: 30px; /* Rounded corners */
      }

      .clay-modal.show {
        transform: translateY(0); /* Slide in */
        opacity: 1; /* Fade in */
      }

      /* Media query to handle responsive behavior */
      @media (max-width: 768px) {
        .clay-modal.desktop {
          display: none; /* Hide desktop modal on mobile */
        }
      }

      @media (min-width: 769px) {
        .clay-modal.mobile {
          display: none; /* Hide mobile modal on desktop */
        }
      }

      .clay-modal-content {
        padding: 20px;
      }

      .clay-close {
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
      }

      .clay-close:hover, .clay-close:focus {
        color: black;
        text-decoration: none;
        cursor: pointer;
      }

      .lds-ripple,
      .lds-ripple div {
        box-sizing: border-box;
      }

      .lds-ripple {
        display: inline-block;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80px;
        height: 80px;
        z-index: 1000; /* Above shadow */
      }

      .lds-ripple div {
        position: absolute;
        border: 4px solid currentColor;
        opacity: 1;
        border-radius: 50%;
        animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
      }

      .lds-ripple div:nth-child(2) {
        animation-delay: -0.5s;
      }

      @keyframes lds-ripple {
        0% {
          top: 36px;
          left: 36px;
          width: 8px;
          height: 8px;
          opacity: 0;
        }
        4.9% {
          top: 36px;
          left: 36px;
          width: 8px;
          height: 8px;
          opacity: 0;
        }
        5% {
          top: 36px;
          left: 36px;
          width: 8px;
          height: 8px;
          opacity: 1;
        }
        100% {
          top: 0;
          left: 0;
          width: 80px;
          height: 80px;
          opacity: 0;
        }
      }

      .shadow {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7); /* Shadow covering entire page */
        z-index: 1000; /* Below loading and modal */
      }
    `;
    document.head.appendChild(style);
  }
}

// Gesture controller class to handle swipe gestures
class GestureController {
  addGestureHandlers(modal, closeCallback) {
    let startY;

    modal.addEventListener("touchstart", (e) => {
      startY = e.touches[0].clientY;
    });

    modal.addEventListener("touchmove", (e) => {
      const moveY = e.touches[0].clientY;
      if (moveY - startY > 50) {
        // Swipe down
        closeCallback();
      }
    });
  }
}

if (typeof window !== "undefined") {
  window.Clay = Clay;
}
module.exports = Clay;
