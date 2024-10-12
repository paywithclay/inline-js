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
          <span class="clay-close" style="cursor: pointer;"> <!-- Updated close button -->
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
              <path fill="currentColor" d="m12 13.4l-2.917 2.925q-.277.275-.704.275t-.704-.275q-.275-.275-.275-.7t.275-.7L10.6 12L7.675 9.108Q7.4 8.831 7.4 8.404t.275-.704q.275-.275.7-.275t.7.275L12 10.625L14.892 7.7q.277-.275.704-.275t.704.275q.3.3.3.713t-.3.687L13.375 12l2.925 2.917q.275.277.275.704t-.275.704q-.3.3-.712.3t-.688-.3z"/>
            </svg>
          </span>
        </div>
        <h2>Payment</h2>
        <p>Amount: ${this.amount} ${this.currency}</p>
        <button id="clay-confirm-button">Confirm Payment</button>
      </div>`;

    // Gesture handling
    this.gestureController.addGestureHandlers(m, this.closeModal.bind(this, m));

    // Add drag-to-close functionality
    this.addDragToClose(m);

    m.querySelector(".clay-close").onclick = () => {
      this.closeModal(m);
    };

    m.querySelector("#clay-confirm-button").onclick = () => {
      this.pay(); // Simulate payment process
      this.closeModal(m); // Close modal after payment
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

      /* Light mode styles */
      .clay-modal.light {
        background-color: #fefefe; /* Light mode background */
        color: #000; /* Light mode text color */
      }

      /* Dark mode styles */
      .clay-modal.dark {
        background-color: #191a1a; /* Dark mode background */
        color: #fff; /* Dark mode text color */
      }

      /* Close button styles */
      .clay-close {
        color: inherit; /* Use current text color */
        float: right;
        font-size: 28px;
        font-weight: bold;
      }

      /* Modal header styles */
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      /* Modal icon styles */
      .modal-icon {
        color: inherit; /* Use current text color */
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
