class Clay {
    constructor(a, c, k, mode = "light") {
        Object.assign(this, {
            amount: a,
            currency: c,
            publicKey: k,
            mode,
            baseUrl: 'https://54196f4801d0c9ea10051e56c205afa3.serveo.net/pay'
        });
        this.key = this.generateEventId();
        this.gestureController = new GestureController();
        this.addStyles();
        this.eventEmitter = new EventEmitter();
        this.currentPollingInterval = null;
        this.PaystackPaymentLink = null;
        this.FlutterwavePaymentLink = null;
        this.InterswitchPaymentLink = null;
    }
  
    showModal(modal) {
        this.removeLoading();
        modal.style.display = "block"
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
        fetch("https://pulse.paywithclay.co/e", {
                method: "POST"
                , headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${this.publicKey}`
                , }
                , body: JSON.stringify(trackingData)
            , })
            .then((response) => {
                if (!response.ok) {
                }
            })
            .catch((error) => {
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
    clayPop() {
        this.eventEmitter.emit('clayPopOpen');
      // Show shadow covering entire page
      const shadow = document.createElement("div");
      shadow.className = "shadow";
      document.body.appendChild(shadow);
        this.currentModal = this.createModalElement();
            document.body.appendChild(this.currentModal);
            this.showModal(this.currentModal);
            this.trackEvent("MODAL_OPEN");
  
    }
  
    hideWalletOptions() {
        const walletOptions = this.currentModal.querySelector('.wallet-options');
        if (walletOptions) {
            walletOptions.style.display = 'none';
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


  async selectWallet(walletName) {
    // Check if the payment link for the selected wallet is already set
    if (this[`${walletName}PaymentLink`] !== null) {
        return true; // Return early if the payment link already exists
    }

    // Construct the API URL (base URL only)
    const apiUrl = `${this.baseUrl}`;
    const amountValue = Number(this.amount);

    // Prepare the request body as JSON
    const requestBody = {
        wallet: walletName,
        key: this.key,
        amount: amountValue,
        currency: this.currency,
        public_key: this.publicKey
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.publicKey}`
            },
            body: JSON.stringify(requestBody) // Convert the data to JSON
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const paymentLink = data.link; // Extract the payment link from the response
        if(walletName === "Paystack"){
            this.PaystackPaymentLink = paymentLink;
        }
        if(walletName === "Flutterwave"){
            this.FlutterwavePaymentLink = paymentLink;
        }
        if(walletName === "Interswitch"){
            this.InterswitchPaymentLink = paymentLink;
        }
        const txRef = data.txRef; // Assuming your API returns a payment ID

        // Start polling for payment status
        this.pollPaymentStatus(txRef);
        return true;
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

  pollPaymentStatus(txRef) {
      // Clear any existing polling interval
      if (this.currentPollingInterval) {
          clearInterval(this.currentPollingInterval);
      }
  
      this.currentPollingInterval = setInterval(() => {
          // Call your API to check payment status
          fetch(`${this.baseUrl}/payment-status?txRef=${txRef}`, {
              method: 'GET', // Use GET method
              headers: {
                  'Content-Type': 'application/json', // Set appropriate headers
                  'Authorization': `Bearer ${this.publicKey}` // Ensure this is valid
              }
          })
          .then(response => {
              if (response.ok) { // Only handle successful responses (200)
                  return response.json(); // Parse the JSON response
              } else {
                  throw new Error('Payment status not successful'); // Handle non-200 responses
              }
          })
          .then(data => {
              // Instead of checking for data.type, check for the status
              if (data.status) {
                  this.handlePaymentMessage(data);
                  
                  // If payment is successful based on the status, stop polling
                  if (data.status === 'success') {
                      clearInterval(this.currentPollingInterval);
                      this.currentPollingInterval = null; // Reset the interval variable
                  }
              } 
          })
          .catch(error => {
              // Optionally handle retries for non-200 responses if needed
          });
      }, 5000); // Poll every 5 seconds
  }

    
    // Helper function to switch pages
    switchPage(modal, title, isBack = false, newPageSelector = ".modal-new-page") {
        const elements = {
            mainContent: modal.querySelector(".modal-main-content"),
            clayScanPage: modal.querySelector(".modal-clay-scan-page"),
            allGatewaysPage: modal.querySelector(".modal-all-gateways-page"),
            selectedOptionPaystack: modal.querySelector(".modal-selected-option-paystack"),
            openPaystackLink: modal.querySelector(".open-paystack-link"),
            openFlutterwaveLink: modal.querySelector(".open-flutterwave-link"),
            openInterswitchLink: modal.querySelector(".open-interswitch-link"),
            selectedOptionFlutterwave: modal.querySelector(".modal-selected-option-flutterwave"),
            selectedOptionInterswitch: modal.querySelector(".modal-selected-option-interswitch"),
            newPage: modal.querySelector(newPageSelector),
            infoIcon: modal.querySelector(".info-icon"),
            backIcon: modal.querySelector(".back-icon"),
            titleElement: modal.querySelector(".modal-title"),
        };
        
        // Update modal title
        elements.titleElement.innerText = title;
        
        // Hide all pages
        const pages = [
            elements.mainContent, 
            elements.clayScanPage, 
            elements.allGatewaysPage, 
            elements.selectedOptionPaystack, 
            elements.selectedOptionFlutterwave, 
            elements.selectedOptionInterswitch, 
            elements.newPage
        ];
        
        pages.forEach(page => {
            page.style.opacity = 0;
            page.style.display = "none";
        });
        
        // Handle search input functionality
        const searchInput = document.getElementById("search-input");
        const clearIcon = document.getElementById("clear-icon");
        
        if (searchInput && clearIcon) {
            searchInput.addEventListener("input", () => {
                clearIcon.style.display = searchInput.value.length > 0 ? "block" : "none";
            });
        
            clearIcon.addEventListener("click", () => {
                searchInput.value = "";
                clearIcon.style.display = "none";
                searchInput.focus();
            });
        }
    
        // Determine what to display based on `isBack`
        if (isBack) {
            // Show main content (wallet options) when navigating back
            elements.infoIcon.style.display = "inline-block";
            elements.backIcon.style.display = "none";
            elements.mainContent.style.display = "block";
            setTimeout(() => elements.mainContent.style.opacity = 1, 300);
        } else {
            // Hide info icon, show back icon and display new page
            elements.infoIcon.style.display = "none";
            elements.backIcon.style.display = "inline-block";
            elements.newPage.style.display = "block";
            setTimeout(() => elements.newPage.style.opacity = 1, 300);
        }
    }
    
  
  
  
  
  handlePaymentMessage(messageData) {
      // Check if the message status is 'success' or 'failure'
      if (messageData.status === 'success') {
          this.hideLoadingSpinner();
          this.showWalletOptions();
          this.eventEmitter.emit('paymentSuccess', messageData); // Emit success event
      } else if (messageData.status === 'failure') {
          this.eventEmitter.emit('paymentFailure', messageData); // Emit failure event
      }
  }
  
  
  
  // Event listener methods
onEvent(eventName, callback) {
    this.eventEmitter.on(eventName, callback);
}

// Usage
onPaymentSuccess(callback) {
    this.onEvent('paymentSuccess', callback);
}

onClayPopOpen(callback) {
    this.onEvent('clayPopOpen', callback);
}

onClayPopClose(callback) {
    this.onEvent('clayPopClose', callback);
}

onPaymentFailure(callback) {
    this.onEvent('paymentFailure', callback);
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
      <div class="loading-background"></div>
     <div class="wallet-options">
    <div class="clay-scan" style="margin-top: 10px">
        <img src="https://cdn.dribbble.com/userupload/13343614/file/original-d9d4912436391b57e1861c93d94ae105.jpg" alt="WalletConnect" />
        <span>Clay Scan</span>
        <div class="qr-code">QR CODE</div>
    </div>
    
    <div class="selected-option-paystack wallet-option">
        <div class="selected-container">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQApU1W4AukdeecItSYUAnaupxpTxdmevCRPg&s" alt="Paystack" />
            <span>Paystack</span>
            <div class="loading-indicator lds-ripple" style="display: none;">
                <div></div>
                <div></div>
            </div>
        </div>
    </div>
    
    <div class="selected-option-flutterwave wallet-option">
    <div class="selected-container">    
        <img src="https://www.fintechfutures.com/files/2023/03/Flutterwave-new.jpg" alt="Flutterwave" />
        <span>Flutterwave</span>
        <div class="loading-indicator lds-ripple" style="display: none;">
            <div></div>
            <div></div>
        </div>
    </div>
    </div>
    </div>
    
    <div class="selected-option-interswitch wallet-option">
    <div class="selected-container">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkNWwt9RAQJUvsPS-mk3XZZay_U4zgBbc9fQ&s" alt="Interswitch" />
        <span>Interswitch</span>
        <div class="loading-indicator lds-ripple" style="display: none;">
            <div></div>
            <div></div>
        </div>
    </div>
    </div>
    
    <div class="all-gateways">
        <div class="wallet-option-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24">
                <g fill="#408bd9" stroke="#408bd9" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" color="currentColor">
                    <rect width="3" height="3" x="18" y="18" rx="1"/>
                    <rect width="3" height="3" x="18" y="10.5" rx="1"/>
                    <rect width="3" height="3" x="18" y="3" rx="1"/>
                    <rect width="3" height="3" x="10.5" y="18" rx="1"/>
                    <rect width="3" height="3" x="10.5" y="10.5" rx="1"/>
                    <rect width="3" height="3" x="10.5" y="3" rx="1"/>
                    <rect width="3" height="3" x="3" y="18" rx="1"/>
                    <rect width="3" height="3" x="3" y="10.5" rx="1"/>
                    <rect width="3" height="3" x="3" y="3" rx="1"/>
                </g>
            </svg>
        </div>
        <span>All Gateways</span>
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
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" style="margin-right: 8px; color: #dbdad5;">
      <g fill="none" stroke="#dbdad5" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" color="currentColor">
          <path d="M14.556 13.218a2.67 2.67 0 0 1-3.774-3.774l2.359-2.36a2.67 2.67 0 0 1 3.628-.135m-.325-3.167a2.669 2.669 0 1 1 3.774 3.774l-2.359 2.36a2.67 2.67 0 0 1-3.628.135"/>
          <path d="M21 13c0 3.771 0 5.657-1.172 6.828S16.771 21 13 21h-2c-3.771 0-5.657 0-6.828-1.172S3 16.771 3 13v-2c0-3.771 0-5.657 1.172-6.828S7.229 3 11 3"/>
      </g>
  </svg>
  <span style="color: #dbdad5; font-size: 10px;">Copy Link</span>
  
  </div>
  
  </div>
  
  
   <div class="modal-all-gateways-page" style="display: none; transition: opacity 0.5s ease; opacity: 0;">
  <div class="search-bar" style="display: flex; align-items: center; justify-content: center;  cursor: pointer; padding: 10px; border: 2px solid #243140; border-radius: 15px; background-color: #1e1e1e; width: 85%; margin-left: auto; margin-right: auto;">
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

<div class="modal-selected-option-paystack" style="display: none; transition: opacity 0.5s ease; opacity: 0;">
    <div class="current-gateway-option">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQApU1W4AukdeecItSYUAnaupxpTxdmevCRPg&s" alt="Paystack" />
    </div>
    <span style="align-items: center; justify-content: center; display: flex; font-size: 16px; font-weight: bold;">Continue in Paystack</span>
    <span style="align-items: center; justify-content: center; display: flex; margin-top: 10px; font-size: 12px; color: #808080;">Open and continue in a new browser tab</span>

    <div class="open-paystack-link" style="display: flex; align-items: center; border: 2px solid #243140; justify-content: center; margin-top: 10px; cursor: pointer; border-radius: 20px; background-color: #1e1e1e; padding: 10px; width: 50px; margin-left: auto; margin-right: auto;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
            <path fill="none" stroke="#05a6db" stroke-width="2" d="m16.289 7.208l-9.766 9.746q-.14.14-.344.13q-.204-.009-.345-.15t-.14-.334t.14-.334L15.582 6.5H6.789q-.213 0-.357-.144t-.143-.357t.143-.356t.357-.143h9.692q.343 0 .575.232t.233.576V16q0 .213-.145.356t-.356.144t-.356-.144t-.144-.356z"/>
        </svg>
        <span style="color: #05a6db; font-size: 14px; font-weight: bold; margin-left: 2px;">Open</span>
    </div>

    <div style="display: flex; align-items: center; justify-content: center; margin-top: 15px; cursor: pointer; margin-bottom: 10px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" style="margin-right: 8px; color: #dbdad5;">
            <g fill="none" stroke="#dbdad5" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" color="currentColor">
                <path d="M14.556 13.218a2.67 2.67 0 0 1-3.774-3.774l2.359-2.36a2.67 2.67 0 0 1 3.628-.135m-.325-3.167a2.669 2.669 0 1 1 3.774 3.774l-2.359 2.36a2.67 2.67 0 0 1-3.628.135"/>
                <path d="M21 13c0 3.771 0 5.657-1.172 6.828S16.771 21 13 21h-2c-3.771 0-5.657 0-6.828-1.172S3 16.771 3 13v-2c0-3.771 0-5.657 1.172-6.828S7.229 3 11 3"/>
            </g>
        </svg>
        <span style="color: #dbdad5; font-size: 10px;">Copy Link</span>
    </div>
</div>

  <div class="modal-selected-option-flutterwave" style="display: none; transition: opacity 0.5s ease; opacity: 0;">
        <div class="current-gateway-option">
          <img src="https://www.fintechfutures.com/files/2023/03/Flutterwave-new.jpg" alt="Flutterwave" />
        
        </div>
        <span style="align-items: center; justify-content: center; display: flex; font-size: 16px; font-weight: bold;">Continue in Flutterwave</span>
        <span style="align-items: center; justify-content: center; display: flex; margin-top: 10px; font-size: 12px; color: #808080;">Open and contnue in a new browser tab</span>
    <div class="open-flutterwave-link" style="display: flex; align-items: center;  border: 2px solid #243140; justify-content: center; margin-top: 10px; cursor: pointer; border-radius: 20px; background-color: #1e1e1e; padding: 10px; width: 50px; margin-left: auto; margin-right: auto;">
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
  <path fill="none" stroke="#05a6db" stroke-width="2" d="m16.289 7.208l-9.766 9.746q-.14.14-.344.13q-.204-.009-.345-.15t-.14-.334t.14-.334L15.582 6.5H6.789q-.213 0-.357-.144t-.143-.357t.143-.356t.357-.143h9.692q.343 0 .575.232t.233.576V16q0 .213-.145.356t-.356.144t-.356-.144t-.144-.356z"/>
</svg>

  <span style="color: #05a6db; font-size: 14px; font-weight: bold; margin-left: 2px;">Open</span>
</div>

   
        <div style="display: flex; align-items: center; justify-content: center; margin-top: 10px;  cursor: pointer; margin-bottom: 10px;">  
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" style="margin-right: 8px; color: #dbdad5;">
      <g fill="none" stroke="#dbdad5" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" color="currentColor">
          <path d="M14.556 13.218a2.67 2.67 0 0 1-3.774-3.774l2.359-2.36a2.67 2.67 0 0 1 3.628-.135m-.325-3.167a2.669 2.669 0 1 1 3.774 3.774l-2.359 2.36a2.67 2.67 0 0 1-3.628.135"/>
          <path d="M21 13c0 3.771 0 5.657-1.172 6.828S16.771 21 13 21h-2c-3.771 0-5.657 0-6.828-1.172S3 16.771 3 13v-2c0-3.771 0-5.657 1.172-6.828S7.229 3 11 3"/>
      </g>
  </svg>
  <span style="color: #dbdad5; font-size: 10px;">Copy Link</span>
  
  </div>
        </div>

  <div class="modal-selected-option-interswitch" style="display: none; transition: opacity 0.5s ease; opacity: 0;">
      <div class="current-gateway-option">  
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkNWwt9RAQJUvsPS-mk3XZZay_U4zgBbc9fQ&s" alt="Interswitch" />
        
        </div>
        <span style="align-items: center; justify-content: center; display: flex; font-size: 16px; font-weight: bold;">Continue in Interswitch</span>
        <span style="align-items: center; justify-content: center; display: flex; margin-top: 10px; font-size: 12px; color: #808080;">Open and contnue in a new browser tab</span>
     <div class="open-interswitch-link" style="display: flex; align-items: center;  border: 2px solid #243140; justify-content: center; margin-top: 10px; cursor: pointer; border-radius: 20px; background-color: #1e1e1e; padding: 10px; width: 50px; margin-left: auto; margin-right: auto;">
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
  <path fill="none" stroke="#05a6db" stroke-width="2" d="m16.289 7.208l-9.766 9.746q-.14.14-.344.13q-.204-.009-.345-.15t-.14-.334t.14-.334L15.582 6.5H6.789q-.213 0-.357-.144t-.143-.357t.143-.356t.357-.143h9.692q.343 0 .575.232t.233.576V16q0 .213-.145.356t-.356.144t-.356-.144t-.144-.356z"/>
</svg>

  <span style="color: #05a6db; font-size: 14px; font-weight: bold; margin-left: 2px;">Open</span>
</div>

    
        <div style="display: flex; align-items: center; justify-content: center; margin-top: 10px;  cursor: pointer; margin-bottom: 10px;">  
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" style="margin-right: 8px; color: #dbdad5;">
      <g fill="none" stroke="#dbdad5" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" color="currentColor">
          <path d="M14.556 13.218a2.67 2.67 0 0 1-3.774-3.774l2.359-2.36a2.67 2.67 0 0 1 3.628-.135m-.325-3.167a2.669 2.669 0 1 1 3.774 3.774l-2.359 2.36a2.67 2.67 0 0 1-3.628.135"/>
          <path d="M21 13c0 3.771 0 5.657-1.172 6.828S16.771 21 13 21h-2c-3.771 0-5.657 0-6.828-1.172S3 16.771 3 13v-2c0-3.771 0-5.657 1.172-6.828S7.229 3 11 3"/>
      </g>
  </svg>
  <span style="color: #dbdad5; font-size: 10px;">Copy Link</span>
  
  </div>
        </div>
  
 
  
  
  </div>`;
  
        // Gesture handling
        this.gestureController.addGestureHandlers(m, this.closeModal.bind(this, m));
        
  
        // Add drag-to-close functionality
      
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
            this.eventEmitter.emit('clayPopClose');
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

// Show loading indicator before switching pages
m.querySelector(".selected-option-paystack").addEventListener("click", async () => {
    const loadingIndicator = m.querySelector('.loading-indicator');
    const loadingBackground = m.querySelector('.loading-background'); // Select the loading background

    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex'; // Show loading spinner
    }
    if (loadingBackground) {
        loadingBackground.style.display = 'block'; // Show loading background
    }

    try {
        const success = await this.selectWallet("Paystack");
        if (success) {
            this.switchPage(m, "Paystack", false, ".modal-selected-option-paystack");
        } else {
            console.error('Failed to select wallet.'); // Log failure if needed
        }
    } catch (error) {
        console.error('Error during wallet selection:', error);
    } finally {
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none'; // Hide loading spinner
        }
        if (loadingBackground) {
            loadingBackground.style.display = 'none'; // Hide loading background
        }
    }
});

m.querySelector(".open-paystack-link").addEventListener('click', () => {
    window.open(this.PaystackPaymentLink, "_blank");
});

m.querySelector(".selected-option-flutterwave").addEventListener("click", async () => {
    const loadingIndicator = m.querySelector('.loading-indicator');
    const loadingBackground = m.querySelector('.loading-background'); // Select the loading background

    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex'; // Show loading spinner
    }
    if (loadingBackground) {
        loadingBackground.style.display = 'block'; // Show loading background
    }

    try {
        const success = await this.selectWallet("Flutterwave");
        if (success) {
            this.switchPage(m, "Flutterwave", false, ".modal-selected-option-flutterwave");
        } else {
            console.error('Failed to select wallet.'); // Log failure if needed
        }
    } catch (error) {
        console.error('Error during wallet selection:', error);
    } finally {
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none'; // Hide loading spinner
        }
        if (loadingBackground) {
            loadingBackground.style.display = 'none'; // Hide loading background
        }
    }

  
});

m.querySelector(".open-flutterwave-link").addEventListener('click', () => {
    window.open(this.FlutterwavePaymentLink, "_blank");
});

m.querySelector(".selected-option-interswitch").addEventListener("click", async () => {
    const loadingIndicator = m.querySelector('.loading-indicator');
    const loadingBackground = m.querySelector('.loading-background'); // Select the loading background

    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex'; // Show loading spinner
    }
    if (loadingBackground) {
        loadingBackground.style.display = 'block'; // Show loading background
    }

    try {
        const success = await this.selectWallet("Interswitch");
        if (success) {
            this.switchPage(m, "Interswitch", false, ".modal-selected-option-interswitch");
        } else {
            console.error('Failed to select wallet.'); // Log failure if needed
        }
    } catch (error) {
        console.error('Error during wallet selection:', error);
    } finally {
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none'; // Hide loading spinner
        }
        if (loadingBackground) {
            loadingBackground.style.display = 'none'; // Hide loading background
        }
    }

  
});

m.querySelector(".open-interswitch-link").addEventListener('click', () => {
    window.open(this.InterswitchPaymentLink, "_blank");
});
  
        return m;
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
  display: flex;
  padding: 15px;
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
  

    .selected-container {
    display: flex;
    align-items: center; /* Align items vertically */
}

.loading-indicator {
    margin-left: 10px; /* Space between the button and loading indicator */
    display: none; /* Initially hidden */
}
.current-gateway-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px 10px 10px 10px;
  border-radius: 10px;
  margin: 5px auto 5px; /* Adjust margin to center horizontally */
  cursor: pointer;
  width: 20%;
  text-align: center;
}

.current-gateway-option img {
  width: 65px;
  height: 65px;
  border-radius: 30px; /* This was duplicated, but left at 20px for roundness */
  border: 4px solid #243140;
  padding: 5px;
}

  
  
  
  .clay-modal {
  z-index: 1001;
  transition: transform 0.3s ease, opacity 0.3s ease;
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
   position: relative; /* Ensure the shadow is positioned relative to the wallet option */
    transition: box-shadow 0.3s ease; /* Smooth transition for shadow */
  }

  .loading-background {
    position: fixed; /* Cover the entire viewport */
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent black background */
    border-radius: 30px;
    z-index: 1000; /* Ensure it appears above other elements */
    display: none; /* Initially hidden */
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
  background-color: #1e1e1e;
  border-radius: 15px;
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