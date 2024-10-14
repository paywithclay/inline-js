class Clay {
  constructor(a, c, k, mode = "light", buttonBgColor = "#000000", buttonTextColor = "white") {
    Object.assign(this, {
        amount: a,
        currency: c,
        key: k,
        mode,
        buttonBgColor,
        buttonTextColor,
        baseUrl: 'https://pay.paywithclay.io/pay'
    });
    this.gestureController = new GestureController();
    this.addStyles();

    this.isPageVisible = true; // Track the page visibility
    this.messageToHandle = null; // Store the message if the page is not visible
    this.eventEmitter = new EventEmitter();
    this.initVisibilityListener(); // Initialize visibility listener
}

initVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
        this.isPageVisible = !document.hidden; // Update the visibility state
        if (this.isPageVisible && this.messageToHandle) {
            // If the page becomes visible and there's a message to handle, process it
            this.handleMessage(this.messageToHandle);
            this.messageToHandle = null; // Clear the stored message
        }
    });
}

  pay() {
      console.log(
          `Initiating payment of ${this.amount} ${this.currency} using key: ${this.key}`
      );
  }


  addDragToClose(modal) {
      let startY, initialTransform = 0;
      const setTransform = (deltaY) => modal.style.transform = `translateY(${deltaY + initialTransform}px) scale(1)`;

      modal.addEventListener("touchstart", (e) => {
          startY = e.touches[0].clientY;
          initialTransform = parseFloat(getComputedStyle(modal).transform.split(",")[5]) || 0;
      });

      modal.addEventListener("touchmove", (e) => {
          const deltaY = e.touches[0].clientY - startY;
          if (deltaY > 0) setTransform(deltaY);
      });

      modal.addEventListener("touchend", (e) => {
          const deltaY = e.changedTouches[0].clientY - startY;
          if (deltaY > 100) this.closeModal(modal);
          else Object.assign(modal.style, {
              transition: "transform 0.3s ease"
              , transform: "translateY(0) scale(1)"
          });
      });
  }

  transitionToMode(mode) {
      if (!this.currentModal) return;
      const isMobile = mode === "mobile";
      this.currentModal.classList.replace(isMobile ? "desktop" : "mobile", mode);
      Object.assign(this.currentModal.style, {
          transition: "transform 0.3s ease, opacity 0.3s ease"
          , transform: isMobile ? "translateY(100%)" : "scale(0.5)"
      });

      setTimeout(() => {
          Object.assign(this.currentModal.style, {
              transform: isMobile ? "translateY(0)" : "scale(1)"
              , opacity: "1"
          });
      }, 10);
  }

  showModal(modal) {
      this.removeLoading();
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
          this.removeShadow();
          console.log(`Modal closed in ${isMobile ? "mobile" : "desktop"} mode.`);
          this.trackEvent("MODAL_CLOSE"); // Track modal close event
      }, 300); // Match duration of CSS transition
  }

  removeLoading() {
      const loading = document.querySelector(".lds-ripple");
      if (loading) loading.remove(); // Remove loading indicator
  }

  removeShadow() {
      const shadow = document.querySelector(".shadow");
      if (shadow) shadow.remove();
  }

  createPaymentButton() {
      const b = document.createElement("button");

      // Convert kobo to naira, format with commas, and ensure two decimal places
      const formattedAmount = (this.amount / 100).toLocaleString(undefined, {
          minimumFractionDigits: 2
          , maximumFractionDigits: 2
      , });
      b.innerText = `${this.currency}${formattedAmount}`; // Display the formatted amount
      b.onclick = () => this.showLoading(); // Show loading when button is clicked

      // Customize the button with CSS styles
      b.style.backgroundColor = this.buttonBgColor; // Use provided or default background color
      b.style.color = this.buttonTextColor; // Use provided or default text color
      b.style.border = "none"; // No border
      b.style.padding = "15px 32px"; // Padding
      b.style.textAlign = "center"; // Centered text
      b.style.textDecoration = "none"; // No underline
      b.style.display = "inline-block"; // Inline-block display
      b.style.fontSize = "16px"; // Font size
      b.style.margin = "4px 2px"; // Margin
      b.style.cursor = "pointer"; // Pointer cursor
      b.style.borderRadius = "15px"; // Rounded corners

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

  trackEvent(event) {
      const eventId = this.generateEventId();
      const url = window.location.href;
      const domain = window.location.hostname;
      const timestamp = Date.now();

      const trackingData = {
          eventId: eventId
          , url: url
          , domain: domain
          , timestamp: timestamp
          , props: {
              type: "track"
              , event: event
          , }
      , };

      // Send tracking data to the specified URL
      fetch("https://pulse.paywithclay.io/e", {
              method: "POST"
              , headers: {
                  "Content-Type": "application/json"
              , }
              , body: JSON.stringify(trackingData)
          , })
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
          /[xy]/g
          , function (c) {
              const r = (Math.random() * 16) | 0
                  , v = c === "x" ? r : (r & 0x3) | 0x8;
              return v.toString(16);
          }
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
          this.trackEvent("MODAL_OPEN");
      }

      this.addWalletOptionEventListeners(); // Add event listeners for wallet options
  }

  addWalletOptionEventListeners() {
      const walletOptions = this.currentModal.querySelectorAll('.wallet-option');

      walletOptions.forEach(option => {
          option.addEventListener('click', () => {
              this.showLoadingSpinner(); // Show loading spinner
              this.hideWalletOptions(); // Hide wallet options

              // Simulate a loading process
              setTimeout(() => {
                  this.pay(); // Call pay method after loading
              }, 2000); // Adjust the timeout as necessary
          });
      });
  }


  hideWalletOptions() {
      const walletOptions = this.currentModal.querySelector('.wallet-options');
      if (walletOptions) {
          walletOptions.style.display = 'none';
          console.log("Wallet options hidden.");
      } else {
          console.warn("No wallet options found to hide.");
      }
  }

  hideLoadingSpinner() {
    const spinner = document.querySelector('.loading-spinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

showWalletOptions() {
  const walletOptions = document.querySelector('.wallet-options');
  if (walletOptions) {
      walletOptions.style.display = 'block'; // or 'flex', depending on your layout
  }
}



  showLoadingSpinner() {
      const loadingSpinner = this.currentModal.querySelector('.loading-spinner');
      if (loadingSpinner) {
          loadingSpinner.style.display = 'flex';
          console.log("Loading spinner shown.");
      } else {
          console.warn("No loading spinner found to show.");
      }
  }

  selectWallet(walletName) {
    const keys = this.generateEventId();
    // Construct the URL
    const url = `${this.baseUrl}?wallet=${encodeURIComponent(walletName)}&key=${keys}`;

    // Open the URL in a new tab
    window.open(url, '_blank');

    // Initialize WebSocket
    this.ws = new WebSocket(`wss://favourafula.pagekite.me/ws?key=${keys}`);

    this.ws.onopen = () => {
        console.log("WebSocket connection opened");
    };

    this.ws.onmessage = (event) => {
        try {
            const messageData = JSON.parse(event.data); // Parse the JSON message
            console.log(messageData);

            // Check the message type and trigger appropriate events
            this.handlePaymentMessage(messageData);
        } catch (error) {
            console.error("Failed to parse message:", error);
        }
    };

    this.ws.onclose = () => {
        console.log("WebSocket connection closed");
    };

    this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
    };
}

handlePaymentMessage(messageData) {
    // Check if the message type is 'success' or 'failure'
    if (messageData.type === 'success') {
        this.hideLoadingSpinner();
        this.showWalletOptions();
        this.eventEmitter.emit('paymentSuccess', messageData); // Emit success event
    } else if (messageData.type === 'failure') {
        this.eventEmitter.emit('paymentFailure', messageData); // Emit failure event
    } else {
        console.warn('Unknown message type:', messageData.type);
    }

    // Handle visibility case
    if (!this.isPageVisible) {
        this.messageToHandle = messageData; // Store the message to handle later
    }
}

// Method to handle messages (to be called when the page is visible)
handleMessage(messageData) {
    this.hideLoadingSpinner();
    this.showWalletOptions();
}

// Event listener methods
onPaymentSuccess(callback) {
    this.eventEmitter.on('paymentSuccess', callback);
}

onPaymentFailure(callback) {
    this.eventEmitter.on('paymentFailure', callback);
}


  createModalElement() {
      const m = document.createElement("div");
      const isMobile = window.innerWidth < 768;
      m.className = `clay-modal ${isMobile ? "mobile" : "desktop"} ${this.mode}`; // Apply mode class
      m.innerHTML = `
<div class="clay-modal-content">
  <div class="modal-header main-header">
    <span class="modal-icon info-icon" style="cursor: pointer;">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12 17q.425 0 .713-.288T13 16v-4q0-.425-.288-.712T12 11t-.712.288T11 12v4q0 .425.288.713T12 17m0-8q.425 0 .713-.288T13 8t-.288-.712T12 7t-.712.288T11 8t.288.713T12 9m0 13q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"/>
      </svg>
    </span>
    <span class="modal-icon back-icon" style="cursor: pointer; display: none;">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 512 512">
        <path fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32" d="M256 64C150 64 64 150 64 256s86 192 192 192s192-86 192-192S362 64 256 64Z"/>
        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="m296 352l-96-96l96-96"/>
      </svg>
    </span>
    <span class="modal-title">Pay with Clay</span>
    <span class="modal-icon clay-close" style="cursor: pointer;">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
        <path fill="currentColor" d="m8.4 17l3.6-3.6l3.6 3.6l1.4-1.4l-3.6-3.6L17 8.4L15.6 7L12 10.6L8.4 7L7 8.4l3.6 3.6L7 15.6zm3.6 5q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"/>
      </svg>
    </span>
  </div>
  <hr class="modal-divider" style="width: 100%; border: none; height: 1px; background-color: #444242; margin: 0; margin-top: 10px;">
  
<div class="modal-main-content" style="transition: opacity 0.5s ease; opacity: 1;">
    <div class="loading-spinner" style="display: none; justify-content: center; align-items: center; height: 100px; margin-top: 60px;">
      <div class="lds-ripple">
        <div></div>
        <div></div>
      </div>
    </div>
    <div class="wallet-options">
      <div class="clay-scan">
        <img src="https://cdn.dribbble.com/userupload/13343614/file/original-d9d4912436391b57e1861c93d94ae105.jpg" alt="WalletConnect" />
        <span>Clay Scan</span>
        <div class="qr-code">QR CODE</div>
      </div>
      <div class="wallet-option">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQApU1W4AukdeecItSYUAnaupxpTxdmevCRPg&s" alt="Paystack" />
        <span>Paystack</span>
      </div>
      <div class="wallet-option">
        <img src="https://www.fintechfutures.com/files/2023/03/Flutterwave-new.jpg" alt="Flutterwave" />
        <span>Flutterwave</span>
      </div>
      <div class="wallet-option">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkNWwt9RAQJUvsPS-mk3XZZay_U4zgBbc9fQ&s" alt="Interswitch" />
        <span>Interswitch</span>
      </div>
      <div class="all-gateways">
        <div class="wallet-option-icon"><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"><g fill="#408bd9" stroke="#408bd9" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" color="currentColor"><rect width="3" height="3" x="18" y="18" rx="1"/><rect width="3" height="3" x="18" y="10.5" rx="1"/><rect width="3" height="3" x="18" y="3" rx="1"/><rect width="3" height="3" x="10.5" y="18" rx="1"/><rect width="3" height="3" x="10.5" y="10.5" rx="1"/><rect width="3" height="3" x="10.5" y="3" rx="1"/><rect width="3" height="3" x="3" y="18" rx="1"/><rect width="3" height="3" x="3" y="10.5" rx="1"/><rect width="3" height="3" x="3" y="3" rx="1"/></g></svg>
        </div><span>All Gateways</span>
        <div class="more-gateways">20+</div>
      </div>
    </div>
  </div>
  <div class="modal-new-page" style="display: none; transition: opacity 0.5s ease; opacity: 0;">
    <!-- New page content goes here -->
    <p>This is the new page content.</p>
  </div>
 <div class="modal-clay-scan-page" style="display: none; transition: opacity 0.5s ease; opacity: 0;">


<!-- QR Code Container -->
<div class="qr-code-container" style="width: 300px; height: 300px; border: 2px solid #1e1e1e; display: flex; justify-content: center; align-items: center;">
   
</div>
<p style="display: block; text-align: center; margin-top: 10px; font-size: 12px;">Scan this QR Code with your phone</p>
<div style="display: flex; align-items: center; justify-content: center; margin-top: 10px;  cursor: pointer;">  
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" style="margin-right: 8px; color: #dbdad5;">
    <g fill="none" stroke="#dbdad5" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" color="currentColor">
        <path d="M14.556 13.218a2.67 2.67 0 0 1-3.774-3.774l2.359-2.36a2.67 2.67 0 0 1 3.628-.135m-.325-3.167a2.669 2.669 0 1 1 3.774 3.774l-2.359 2.36a2.67 2.67 0 0 1-3.628.135"/>
        <path d="M21 13c0 3.771 0 5.657-1.172 6.828S16.771 21 13 21h-2c-3.771 0-5.657 0-6.828-1.172S3 16.771 3 13v-2c0-3.771 0-5.657 1.172-6.828S7.229 3 11 3"/>
    </g>
</svg>
<span style="color: #dbdad5; font-size: 10px;">Copy Link</span>

</div>

</div>


 <div class="modal-all-gateways-page" style="display: none; transition: opacity 0.5s ease; opacity: 0;">
<div class="search-bar">
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path fill="currentColor" d="M9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l5.6 5.6q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-5.6-5.6q-.75.6-1.725.95T9.5 16m0-2q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"/></svg>
<input type="text" id="search-input" placeholder="Search Gateways" />
<svg id="clear-icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path fill="currentColor" d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"/></svg>
</div>
    <div class="gateway-options">
     <div class="gateway-option">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQApU1W4AukdeecItSYUAnaupxpTxdmevCRPg&s" alt="Paystack" />
        <span>Paystack</span>
      </div>
      <div class="gateway-option">
        <img src="https://www.fintechfutures.com/files/2023/03/Flutterwave-new.jpg" alt="Flutterwave" />
        <span>Flutterwave</span>
      </div>
      <div class="gateway-option">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkNWwt9RAQJUvsPS-mk3XZZay_U4zgBbc9fQ&s" alt="Interswitch" />
        <span>Interswitch</span>
      </div>
       <div class="gateway-option">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPQi7JBZM8CJeezguo86N1vrUVHTmzzD_kBQGNF1Dx8ZQ9E80Qc55EEG7Tfrsm1ZcIPfU&usqp=CAU" alt="Paga" />
        <span>Paga</span>
      </div>
       <div class="gateway-option">
        <img src="https://play-lh.googleusercontent.com/bojfiBmqU2A0U4CwGk_KQoxFw5rsLwIc4KSG4FC0vC4y0OtC-sJ4juxKMZF3g2cgeg" alt="Remita" />
        <span>Remita</span>
      </div>
      <div class="gateway-option">
        <img src="https://pbs.twimg.com/profile_images/1748315462373425152/IUp4_qLU_400x400.jpg" alt="Monnify" />
        <span>Monnify</span>
      </div>
      <div class="gateway-option">
        <img src="https://pbs.twimg.com/profile_images/1445317527173804034/KQFHzQWE_400x400.png" alt="Mono" />
        <span>Mono</span>
      </div>

       <div class="gateway-option">
           <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4L0GRpBv2Ax97bi8-NOhGouVcn4OqUW0tYQ&s" alt="PawaPay" />
           <span>PawaPay</span>

         </div>
      
       <div class="gateway-option">
       <img src="https://fincra.com/wp-content/uploads/2022/10/cropped-Favicon.png" alt="Fincra" />
       <span>Fincra</span>
     </div>
      </div>
</div>


</div>`;

      // Show wallet options after 5 seconds
      setTimeout(() => {
          m.querySelector(".loading-spinner").style.display = "none";
          m.querySelector(".wallet-options").style.display = "block";
      }, 500);

      // Gesture handling
      this.gestureController.addGestureHandlers(m, this.closeModal.bind(this, m));

      // Add drag-to-close functionality
      this.addDragToClose(m);

      // Info icon click handler (What's Clay)
      m.querySelector(".info-icon").addEventListener("click", () => {
          this.switchPage(m, "What's Clay?");
      });

      // Back icon click handler
      m.querySelector(".back-icon").addEventListener("click", () => {
          this.switchPage(m, "Pay with Clay", true);
      });

      // Close modal click handler
      m.querySelector(".clay-close").addEventListener("click", () => {
          this.closeModal(m);
      });

      // Clay Scan click handler
      m.querySelector(".clay-scan").addEventListener("click", () => {
          this.switchPage(m, "Clay Scan", false, ".modal-clay-scan-page");
      });

      // All Gateways click handler
      m.querySelector(".all-gateways").addEventListener("click", () => {
          this.switchPage(m, "All Gateways", false, ".modal-all-gateways-page");
      });


      const walletOptions = m.querySelectorAll('.wallet-option');
      walletOptions.forEach(option => {
          option.addEventListener('click', (event) => {
              const walletName = option.dataset.wallet || option.querySelector('span').textContent;
              this.selectWallet(walletName);
          });
      });


      return m;
  }




  // Helper function to switch pages
  switchPage(m, title, isBack = false, newPageSelector = ".modal-new-page") {
      const mainContent = m.querySelector(".modal-main-content");
      const clayScanPage = m.querySelector(".modal-clay-scan-page");
      const allGatewaysPage = m.querySelector(".modal-all-gateways-page");
      const newPage = m.querySelector(newPageSelector);
      const infoIcon = m.querySelector(".info-icon");
      const backIcon = m.querySelector(".back-icon");
      const titleElement = m.querySelector(".modal-title");

      // Update modal title
      titleElement.innerText = title;

      // Hide all pages before showing the new one
      const allPages = [mainContent, clayScanPage, allGatewaysPage, newPage];
      allPages.forEach((page) => {
          page.style.opacity = 0;
          page.style.display = "none";
      });

      const searchInput = document.getElementById("search-input");
      const clearIcon = document.getElementById("clear-icon");

      // Show/Hide clear icon based on input
      searchInput.addEventListener("input", function () {
          if (this.value.length > 0) {
              clearIcon.style.display = "block";
          } else {
              clearIcon.style.display = "none";
          }
      });

      // Clear input when close icon is clicked
      clearIcon.addEventListener("click", function () {
          searchInput.value = "";
          clearIcon.style.display = "none";
          searchInput.focus(); // Focus back on the input after clearing
      });

      if (isBack) {
          // Show the main content page (wallet options) when going back
          infoIcon.style.display = "inline-block";
          backIcon.style.display = "none";
          mainContent.style.display = "block";
          setTimeout(() => {
              mainContent.style.opacity = 1;
          }, 300);
      } else {
          // Hide info icon and show back icon
          infoIcon.style.display = "none";
          backIcon.style.display = "inline-block";

          // Show the selected new page
          newPage.style.display = "block";
          setTimeout(() => {
              newPage.style.opacity = 1;
          }, 300);
      }
  }

  //styles
  addStyles() {
    // Add Google Fonts link
    const link = document.createElement("link");
    link.href =
        "https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,100..900;1,100..900&family=Fredoka:wght@300..700&display=swap"; // Example font
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.innerHTML = `

.gateway-options {
margin-top: 20px;
display: flex;
justify-content: space-between;
flex-wrap: wrap
}

.gateway-option {
display: flex;
flex-direction: column;
align-items: center;
padding: 5px;
background-color: #1e1e1e;
border-radius: 10px;
margin: 0 5px 10px 3px;
transition: background-color 0.3s ease;
cursor: pointer;
width: 20%;
text-align: center
}

.gateway-option img {
width: 50px;
height: 50px;
border-radius: 6px;
padding: 5px;
border-radius: 20px;
margin-bottom: 5px
}

.gateway-option span {
font-size: 12px;
color: #ffffff;
font-weight: 500
}

.gateway-option:hover {
background-color: #252626;
box-shadow: 0 0 5px rgba(255, 255, 255, 0.3)
}


.clay-modal {
z-index: 1001;
background-color: #fefefe;
box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.2);
transition: transform 0.3s ease, opacity 0.3s ease;
opacity: 0;
font-family: 'Fredoka', sans-serif
}

.clay-modal.mobile {
display: none;
position: fixed;
width: 100%;
height: auto;
border-radius: 30px 30px 0 0;
left: 0;
bottom: 0
}

.clay-modal.desktop {
display: flex;
position: fixed;
top: 20%;
left: 35%;
transform: translate(-50%, -50%);
width: 400px;
border-radius: 30px;
z-index: 1001
}

.clay-modal.show {
transform: translateY(0);
opacity: 1
}


.clay-modal.light {
background-color: #fefefe;
color: #000
}


.clay-modal.dark {
background-color: #191a1a;
color: #fff
}

.modal-title {
color: inherit;
font-size: 16px;
margin-bottom: 5px;
text-align: center

}


.clay-close {
color: inherit;
float:right;
font-size: 28px

}


.modal-header {
display: flex;
justify-content: space-between;
align-items: center
}


.modal-icon {
color: inherit
}






.clay-modal-content {
padding: 20px
}

.qr-code-container {
width: 300px;
height: 300px;
border: 2px solid #1e1e1e;
display: flex;
justify-content: center;
align-items: center;
margin: auto; /* Changed to always center the container */
padding: 20px;
margin-top: 25px;
margin-bottom: 25px;
background-color: #1e1e1e;
border-radius: 30px;
overflow: hidden;
position: relative; /* Changed to absolute positioning */

box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1)
}

.qr-code-container::before {
content: "";
position: absolute;
top: 0;
left: 0;
right: 0;
bottom: 0;
background: linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 100%);
animation: loader-glow 2s infinite;
opacity: 0.8;
border-radius: 30px
}


@keyframes loader-glow {
20% {
transform: translateX(-20%)
}
80% {
transform: translateX(80%)
}
}



.lds-ripple,
.lds-ripple div {
box-sizing: border-box
}

.lds-ripple {
display: inline-block;
position: fixed;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
width: 80px;
height: 80px;
z-index: 1000
}

.lds-ripple div {
position: absolute;
border: 4px solid currentColor;
opacity: 1;
border-radius: 50%;
animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite
}

.lds-ripple div:nth-child(2) {
animation-delay: -0.5s
}


.qr-code {
margin-left: auto;
border-radius: 8px;
background-color: #243140;
color: #408bd9;
border-color: #243140;
font-size: 0.6em;
padding: 8px 12px;

font-family: 'Fredoka', sans-serif
}
.wallet-options {
margin-top: 20px
}

.wallet-option {
display: flex;
align-items: center;
justify-content: flex-start;
padding: 10px;
background-color: #1e1e1e;
border-radius: 10px;
margin-bottom: 10px;
transition: background-color 0.3s ease;
cursor: pointer
}


.wallet-option-icon {
width: 30px;
height: 30px;
margin-right: 10px;
border-radius: 6px;
background-color: #243140;
display: flex;
justify-content: center;
align-items: center
}

.wallet-option:hover {
background-color: #252626;
box-shadow: 0 0 2px rgba(255, 255, 255, 0.2)
}

.wallet-option img {
width: 30px;
height: 30px;
margin-right: 10px;
border-radius: 6px;
transition: box-shadow 0.3s ease
}

.wallet-option img:hover {
box-shadow: 0 0 5px rgba(255, 255, 255, 0.4)
}

.clay-scan {
display: flex;
align-items: center;
justify-content: flex-start;
padding: 10px;
background-color: #1e1e1e;
border-radius: 10px;
margin-bottom: 10px;
transition: background-color 0.3s ease;
cursor: pointer
}


.clay-scan-icon {
width: 30px;
height: 30px;
margin-right: 10px;
border-radius: 6px;
background-color: #243140;
display: flex;
justify-content: center;
align-items: center
}

.clay-scan:hover {
background-color: #252626;
box-shadow: 0 0 2px rgba(255, 255, 255, 0.2)
}

.clay-scan img {
width: 30px;
height: 30px;
margin-right: 10px;
border-radius: 6px;
transition: box-shadow 0.3s ease
}

.clay-scan img:hover {
box-shadow: 0 0 5px rgba(255, 255, 255, 0.4)
}
.all-gateways {
margin-top: 10px
}

.all-gateways {
display: flex;
align-items: center;
justify-content: flex-start;
padding: 10px;
background-color: #1e1e1e;
border-radius: 10px;
margin-bottom: 10px;
transition: background-color 0.3s ease;
cursor: pointer
}


.all-gateways-icon {
width: 30px;
height: 30px;
margin-right: 10px;
border-radius: 6px;
background-color: #243140;
display: flex;
justify-content: center;
align-items: center
}

.all-gateways:hover {
background-color: #252626;
box-shadow: 0 0 2px rgba(255, 255, 255, 0.2)
}

.all-gateways img {
width: 30px;
height: 30px;
margin-right: 10px;
border-radius: 6px;
transition: box-shadow 0.3s ease
}

.all-gateways img:hover {
box-shadow: 0 0 5px rgba(255, 255, 255, 0.4)
}
.more-gateways {
margin-left: auto;
border-radius: 8px;
background-color: #343535;
color: #949e9e;
border-color: #343535;
font-size: 0.6em;
padding: 8px 12px;

font-family: 'Fredoka', sans-serif
}

.search-bar {
position: relative;
display: flex;
align-items: center;
justify-content: flex-start;
padding: 10px;
background-color: #1e1e1e;
border-radius: 15px;
margin-bottom: 10px;
margin-top: 15px;
transition: background-color 0.3s ease;
cursor: text
}

.search-bar input {
background-color: transparent;
border: none;
color: #fff;
flex-grow: 1;
padding-left: 10px;
font-family: 'Fredoka', sans-serif;
font-size: 1em
}

.search-bar input:focus {
outline: none
}

.search-icon {
color: #408bd9;
margin-right: 10px;
font-size: 1.5em
}


.search-bar:hover {
background-color: #252626;
box-shadow: 0 0 2px rgba(255, 255, 255, 0.2)
}

#search-input {
padding-right: 30px
}

#search-input::placeholder {
font-size: 12px

}

#clear-icon {
position: absolute;
right: 10px;
cursor: pointer
}

.modal-all-gateways-page {
display: none;
transition: opacity 0.5s ease;
opacity: 0
}



.checkmark {
color: #008000
}
@keyframes lds-ripple {
0% {
top: 36px;
left: 36px;
width: 8px;
height: 8px;
opacity: 0
}
4.9% {
top: 36px;
left: 36px;
width: 8px;
height: 8px;
opacity: 0
}
5% {
top: 36px;
left: 36px;
width: 8px;
height: 8px;
opacity: 1
}
100% {
top: 0;
left: 0;
width: 80px;
height: 80px;
opacity: 0
}
}

.shadow {
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background-color: rgba(0, 0, 0, 0.7);
z-index: 1000
}
`;
    document.head.appendChild(style)
}

}

class EventEmitter {
  constructor() {
      this.events = {};
  }

  on(event, listener) {
      if (!this.events[event]) {
          this.events[event] = [];
      }
      this.events[event].push(listener);
  }

  emit(event, data) {
      if (this.events[event]) {
          this.events[event].forEach(listener => listener(data));
      }
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