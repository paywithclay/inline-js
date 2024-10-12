class Clay {
  constructor(a, c, k, mode = "light") {
    // Added mode parameter
    (this.amount = a), (this.currency = c), (this.key = k);
    this.mode = mode; // Store mode
    this.addStyles();
  }

  pay() {
    console.log(
      `Initiating payment of ${this.amount} ${this.currency} using key: ${this.key}`
    );
  }

  createPaymentModal() {
    if (window.innerWidth < 768) {
      this.createMobilePaymentModal(); // Call mobile modal function
    } else {
      this.createDesktopPaymentModal(); // Call desktop modal function
    }
  }

  createMobilePaymentModal() {
    const m = document.createElement("div");
    m.className = `clay-modal ${this.mode}`; // Apply mode class
    m.innerHTML = `
      <div class="clay-modal-content">
        <span class="clay-close">&times;</span>
        <h2>Payment</h2>
        <p>Amount: ${this.amount} ${this.currency}</p>
        <button id="clay-confirm-button">Confirm Payment</button>
      </div>`;

    // Gesture handling for mobile
    let startY;
    m.addEventListener("touchstart", (e) => {
      startY = e.touches[0].clientY;
    });

    m.addEventListener("touchmove", (e) => {
      const moveY = e.touches[0].clientY;
      if (moveY - startY > 50) {
        // Swipe down
        this.closeModal(m);
      }
    });

    m.querySelector(".clay-close").onclick = () => {
      this.closeModal(m);
    };

    m.querySelector("#clay-confirm-button").onclick = () => {
      this.pay(); // Simulate payment process
      this.closeModal(m); // Close modal after payment
    };

    document.body.appendChild(m);
    m.style.display = "block";
    setTimeout(() => m.classList.add("show"), 10); // Trigger animation
  }

  createDesktopPaymentModal() {
    const m = document.createElement("div");
    m.className = `clay-modal ${this.mode}`; // Apply mode class
    m.innerHTML = `
      <div class="clay-modal-content">
        <span class="clay-close">&times;</span>
        <h2>Payment</h2>
        <p>Amount: ${this.amount} ${this.currency}</p>
        <button id="clay-confirm-button">Confirm Payment</button>
      </div>`;

    m.querySelector(".clay-close").onclick = () => {
      this.closeModal(m);
    };

    m.querySelector("#clay-confirm-button").onclick = () => {
      this.pay(); // Simulate payment process
      this.closeModal(m); // Close modal after payment
    };

    document.body.appendChild(m);
    m.style.display = "block";
    setTimeout(() => m.classList.add("show"), 10); // Trigger animation
  }

  showLoading() {
    if (window.innerWidth < 768) {
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
    }

    // Show the payment modal after loading
    this.createPaymentModal();
  }

  closeModal(modal) {
    modal.classList.remove("show"); // Remove animation class
    setTimeout(() => {
      modal.style.display = "none";
      modal.remove(); // Remove modal from DOM
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

  addStyles() {
    const style = document.createElement("style");
    style.innerHTML = `
      .clay-modal {
        display: none;
        position: fixed;
        z-index: 1001;
        left: 0;
        bottom: 0;
        width: 100%;
        height: auto;
        background-color: #fefefe;
        border-radius: 30px 30px 0 0;
        box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.2);
        transition: transform 0.3s ease; /* Added transition */
        transform: translateY(100%); /* Start off-screen */
      }
      .clay-modal.show {
        transform: translateY(0); /* Slide in */
      }
      @media (min-width: 768px) {
        .clay-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%); /* Center the modal */
          width: 400px; /* Set a fixed width for the popup */
          height: auto;
          border-radius: 10px; /* Rounded corners */
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          bottom: auto; /* Reset bottom for desktop */
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
        z-index: 1002; /* Above shadow */
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

if (typeof window !== "undefined") {
  window.Clay = Clay;
}
module.exports = Clay;
