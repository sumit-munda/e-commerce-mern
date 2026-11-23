# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

## Demo Payment Instructions

### Stripe Test Mode

Ecom City uses Stripe Test Mode for demonstration purposes.

**No real money is charged.** Use the test card details below to simulate payments. Do not enter real payment card information.

### Successful Test Payment

| Field | Test Value |
|---|---|
| Card Number | `4242 4242 4242 4242` |
| Expiry Date | `12/30` |
| CVC | `123` |
| ZIP / Postal Code | `834001` |
| Cardholder Name | Any name |

### How to Test Checkout

1. Open the Ecom City application.
2. Browse products and add items to your cart.
3. Proceed to checkout.
4. Enter your shipping information.
5. On the Stripe payment page, enter the test card details above.
6. Submit the payment to simulate a successful transaction.
7. After successful payment and order creation, check your orders page.

### Additional Test Scenarios

Use these cards to test different payment outcomes:

| Scenario | Card Number |
|---|---|
| Successful payment | `4242 4242 4242 4242` |
| Generic card decline | `4000 0000 0000 0002` |
| Insufficient funds | `4000 0000 0000 9995` |
| 3D Secure authentication | `4000 0025 0000 3155` |

For these cards, use a future expiry date and any three-digit CVC.

**Important:** These are Stripe test card numbers. They work only when the Stripe integration is configured to use test mode.

Official documentation: https://docs.stripe.com/testing
