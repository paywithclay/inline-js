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
      console.log(
        `Modal opened in ${
          window.innerWidth < 768 ? "mobile" : "desktop"
        } mode.`
      );
      this.trackEvent("MODAL_OPEN"); // Track modal open event
    }
  }

  createModalElement() {
    const m = document.createElement("div");
    const isMobile = window.innerWidth < 768;
    m.className = `clay-modal ${isMobile ? "mobile" : "desktop"} ${this.mode}`; // Apply mode class
    m.innerHTML = `
      <div class="clay-modal-content">
        <div class="modal-header">
          <span class="modal-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9" stroke-linecap="round" stroke-width="2"/>
                <path stroke-width="3" d="M12 8h.01v.01H12z"/>
                <path stroke-linecap="round" stroke-width="2" d="M12 12v4"/>
              </g>
            </svg>
          </span>
          <span class="modal-title">Pay with Clay</span> <!-- Added title -->
          <span class="modal-icon clay-close" style="cursor: pointer;">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path fill="currentColor" d="m8.4 17l3.6-3.6l3.6 3.6l1.4-1.4l-3.6-3.6L17 8.4L15.6 7L12 10.6L8.4 7L7 8.4l3.6 3.6L7 15.6zm3.6 5q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"/></svg>
          </span> <!-- Added close button -->
        </div>
        <div class="wallet-options">
          <div class="wallet-option">
            <img src="path/to/walletconnect-icon.png" alt="WalletConnect" />
            <span>WalletConnect</span>
            <button>QR CODE</button>
          </div>
          <div class="wallet-option">
            <img src="path/to/phantom-icon.png" alt="Phantom" />
            <span>Phantom</span>
            <span class="checkmark">✔️</span>
          </div>
          <div class="wallet-option">
            <img src="path/to/trust-wallet-icon.png" alt="Trust Wallet" />
            <span>Trust Wallet</span>
            <span class="checkmark">✔️</span>
          </div>
        </div>
      </div>`;

    // Gesture handling
    this.gestureController.addGestureHandlers(m, this.closeModal.bind(this, m));

    // Add drag-to-close functionality
    this.addDragToClose(m);

    m.querySelector(".clay-close").onclick = () => {
      this.closeModal(m);
    };

    return m;
  }

  addDragToClose(modal) {
    let startY;
    let initialTransform = 0;

    modal.addEventListener("touchstart", (e) => {
      startY = e.touches[0].clientY;
      initialTransform =
        parseFloat(getComputedStyle(modal).transform.split(",")[5]) || 0;
    });

    modal.addEventListener("touchmove", (e) => {
      const moveY = e.touches[0].clientY;
      const deltaY = moveY - startY;
      if (deltaY > 0) {
        // Only allow dragging down
        modal.style.transform = `translateY(${
          deltaY + initialTransform
        }px) scale(1)`; // Slide down while dragging
      }
    });

    modal.addEventListener("touchend", (e) => {
      const moveY = e.changedTouches[0].clientY;
      const deltaY = moveY - startY;
      if (deltaY > 100) {
        // If dragged down enough, close the modal
        this.closeModal(modal);
      } else {
        modal.style.transition = "transform 0.3s ease"; // Reset transition
        modal.style.transform = `translateY(0) scale(1)`; // Reset position
      }
    });
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
        this.currentModal.style.transform = "scale(0.5)"; // Start scaled down for desktop
      }

      setTimeout(() => {
        if (isMobile) {
          this.currentModal.style.transform = "translateY(0)"; // Slide in for mobile
        } else {
          this.currentModal.style.transform = "scale(1)"; // Zoom in for desktop
        }
        this.currentModal.style.opacity = "1"; // Fade in
      }, 10);
    }
  }

  showModal(modal) {
    modal.style.display = "block";
    setTimeout(() => modal.classList.add("show"), 10); // Trigger animation
  }

  closeModal(modal) {
    const isMobile = window.innerWidth < 768;
    modal.classList.remove("show"); // Remove animation class
    modal.style.transition = "transform 0.3s ease, opacity 0.3s ease"; // Set transition for closing

    if (isMobile) {
      modal.style.transform = "translateY(100%)"; // Slide out for mobile
    } else {
      modal.style.transform = "scale(0.5)"; // Zoom out for desktop
    }

    setTimeout(() => {
      modal.style.display = "none";
      modal.remove(); // Remove modal from DOM
      this.currentModal = null; // Reset current modal
      this.removeLoading(); // Remove loading indicator and shadow
      console.log(`Modal closed in ${isMobile ? "mobile" : "desktop"} mode.`);
      this.trackEvent("MODAL_CLOSE"); // Track modal close event
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
    // Add Google Fonts link
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Fredoka&display=swap"; // Example font
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Link to the CSS file
    const cssLink = document.createElement("link");
    cssLink.href = "https://unpkg.com/@paywithclay/inline-js/css/styles.css"; // Update with the correct path to your CSS file
    cssLink.rel = "stylesheet";
    document.head.appendChild(cssLink);
  }

  trackEvent(event) {
    const eventId = this.generateEventId();
    const url = window.location.href;
    const domain = window.location.hostname;
    const timestamp = Date.now();

    const trackingData = {
      eventId: eventId,
      url: url,
      domain: domain,
      timestamp: timestamp,
      props: {
        type: "track",
        event: event,
      },
    };

    // Send tracking data to the specified URL
    fetch("https://pulse.paywithclay.io/e", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(trackingData),
    })
      .then((response) => {
        if (!response.ok) {
          console.error("Tracking event failed:", response.statusText);
        }
      })
      .catch((error) => {
        console.error("Error sending tracking event:", error);
      });
  }

  generateEventId() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
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

// Check if module is defined for Node.js or attach to window for browser
if (typeof module !== "undefined" && module.exports) {
  module.exports = Clay;
} else {
  if (typeof window !== "undefined") {
    window.Clay = Clay;
  }
}
