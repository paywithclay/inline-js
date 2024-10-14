# Clay InlineJS - Payment Integration Library

[![NPM Downloads](https://img.shields.io/npm/dw/@paywithclay/inline-js)](https://www.npmjs.com/package/@paywithclay/inline-js)
[![License](https://img.shields.io/npm/l/@paywithclay/inline-js)](LICENSE)



**Clay InlineJS** is a simple, open-source JavaScript library that helps developers integrate multiple payment gateways with minimal code. Whether you're working with Paystack, Flutterwave, or other supported gateways, Clay simplifies the process by offering a unified interface for payments.

---

## ⚠️ **Important Notice:**

This library is currently in early development and is still being worked on. Although it already supports basic payment integration, **it is not yet ready for production use**. Please use it for testing and development purposes only.

---

## 🚀 Features

- **Unified Payments**: Easily integrate with multiple gateways like Paystack and Flutterwave using a single code base.
- **Minimal Setup**: Just include the library and use a few lines of code to add a payment button.
- **Popup Payment Modal**: Initiates payment using a non-intrusive modal without redirecting the user.
- **Customizable**: Customize the look and feel of the payment button and modal.
- **Open Source**: Constantly evolving with community feedback.

## 📦 Installation

You can start experimenting by installing **Clay InlineJS** via npm:

```
npm install @paywithclay/inline-js
```

## 🛠️ Basic Usage

Once installed, simply include the script in your HTML or JavaScript file and set up the payment button as shown below:

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Clay Payment Example</title>
    <script src="https://unpkg.com/@paywithclay/inline-js"></script>
</head>
<body>
    <h1>Welcome to Clay Payment System</h1>
    <div id="payment-option">Pay with Clay</div>
    <script>
        const clay = new Clay(1500, "NGN", "CLAY_TEST-E8F5jLh6AQyGf78Dhmk2Yt7yPs3UkFdR4qS9GvLxWcO", "dark");
        document.getElementById("payment-option").onclick = () => {
            clay.clayPop();
        };
        clay.onClayPopOpen(() => {
            console.log("Clay pop open");
        });

        clay.onClayPopClose(() => {
            console.log("Clay pop close");
        });

    </script>
</body>
</html>

```

Or if you prefer to initialize it via JavaScript:

```javascript
// Example usage in JavaScript
const paymentButton = new Clay(1000, 'NGN', 'CLAY_PUBLIC_KEY').createPaymentButton();
document.body.appendChild(paymentButton);
```

This will create a payment button on your webpage. When clicked, it will open a payment modal for users to complete the transaction.

## 📋 API Documentation

To use Clay InlineJS, you can call the `Clay()` constructor with the following parameters:

- `amount`: Amount to be paid in the smallest currency unit (e.g., kobo for NGN).
- `currency`: The currency in which the payment is made (e.g., NGN, USD).
- `key`: Your public key from the payment gateway (e.g., Paystack or Flutterwave).
- `theme`: Optional. You can choose between `"dark"` or `"light"` for the button style.

Example:

```javascript
const paymentButton = new Clay(
  5000,          // Amount in currency subunit (e.g., 5000 kobo = ₦50)
  'NGN',         // Currency
  'CLAY_PUBLIC_KEY',  // Your clay public key
  'dark'         // Theme (optional)
);
paymentButton.createPaymentButton();  // Create and append button
```

## 🎯 Supported Gateways

- **Paystack**
- **Flutterwave**
- (More gateways to be added soon)

## 🚧 Roadmap

- Support for additional gateways (Stripe, Razorpay, etc.)
- Enhanced error handling and event hooks
- Subscription payments
- Detailed documentation and examples

## 💬 Contributions

We appreciate contributions from the community! If you would like to help improve **Clay InlineJS**, feel free to open an issue or submit a pull request. Contributions are welcome, whether it’s a feature request, bug report, or improvement.

## 🛠️ Community Support

For questions, suggestions, or feedback, reach out to us via:

- **Instagram**: [@paywithclay](https://instagram.com/paywithclay)
- **Twitter**: [@paywithclay](https://twitter.com/paywithclay)
- **Telegram**: [@paywithclay](https://t.me/paywithclay)

You can also raise an issue on our [GitHub repository](https://github.com/paywithclay/inline-js).

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

### **Reminder:**

**Clay InlineJS is still under development** and is not yet recommended for production use. Please feel free to experiment with it in a test or development environment and provide feedback as we continue to improve the library.
