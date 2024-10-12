import Clay from "./src/Clay.js";

const clay = new Clay(100, "USD", "api-key");
clay.renderPaymentButton("payment-button-container");
