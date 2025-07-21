# expo-linkrunner

Expo Package for [linkrunner.io](https://www.linkrunner.io) - Track and analyze your user journeys without requiring custom native code or development builds!

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
    - [Initialisation](#initialisation)
    - [Get Attribution Data](#get-attribution-data)
    - [Signup](#signup)
    - [Set User Data](#set-user-data)
    - [Track Event](#track-event)
    - [Capture Payment](#capture-payment)
    - [Remove Payment](#remove-payment)
- [Function Placement Guide](#function-placement-guide)
- [Support](#facing-issues-during-integration)
- [License](#license)

## Installation

Install the package and its required dependencies:

```sh
npx expo install expo-linkrunner
```

You will also need to install the following dependencies required by expo-linkrunner:

```sh
npx expo install @react-native-async-storage/async-storage expo-application expo-device expo-network expo-tracking-transparency
```

## Configuration

### iOS Configuration

For iOS, to access the advertising identifier (IDFA), add this to your `app.json`:

```json
{
    "expo": {
        "plugins": [
            [
                "expo-tracking-transparency",
                {
                    "userTrackingPermission": "This identifier will be used to deliver personalized ads and improve your app experience."
                }
            ]
        ]
    }
}
```

## Usage

### Initialisation

Initialize linkrunner with your project token in your `App.js`/`App.tsx`:

Note: The init function does not return any data. To get the attribution data and the deeplink, use the [getAttributionData](#get-attribution-data) function.

```js
import linkrunner from "expo-linkrunner";
import { useEffect } from "react";

export default function App() {
    useEffect(() => {
        initLinkrunner();
    }, []);

    const initLinkrunner = async () => {
        await linkrunner.init("YOUR_PROJECT_TOKEN");
    };

    // Rest of your app
}
```

### Get Attribution Data

To retrieve attribution data and deeplink related to an install, use the `getAttributionData` function. This function returns information about the installation source, campaign data, and deeplink information.

```js
const getAttributionInfo = async () => {
    const attributionData = await linkrunner.getAttributionData();
};
```

Note: Only use this function if you need the attribution data inside your app. You can access the same data via webhooks and API calls from the [Linkrunner Dashboard](https://www.linkrunner.io/settings?s=data-apis).

#### Response type for `linkrunner.getAttributionData`

```typescript
{
    deeplink: string; // The deeplink that led to the install
    campaign_data: {
        // Information about the campaign
        id: string; // Linkrunner Campaign ID
        name: string; // Campaign name
        type: "ORGANIC" | "INORGANIC";
        ad_network: string | null;
        group_name: string | null; // Ad group name
        asset_group_name: string | null; // Asset group name
        asset_name: string | null; // Asset name
        installed_at: string; // ISO timestamp of installation
        store_click_at: string; // ISO timestamp of store click
    }
    attribution_source: "ORGANIC" | "META" | "GOOGLE" | "INORGANIC";
}
```

### Signup

Call this function once after the user completes your app's onboarding:

```js
import linkrunner from "expo-linkrunner";

const onSignup = async () => {
    await linkrunner.signup({
        user_data: {
            id: "1",
            name: "John Doe", // optional
            phone: "9583849238", // optional
            email: "support@linkrunner.io", //optional
        },
        data: {}, // Any other data you might need
    });
};
```

### Set User Data

Call this function every time the app is opened and the user is logged in:

```js
import linkrunner from "expo-linkrunner";

const setUserData = async () => {
    await linkrunner.setUserData({
        user_data: {
            id: "1",
            name: "John Doe", // optional
            phone: "9583849238", // optional
            email: "support@linkrunner.io", //optional
        },
    });
};
```

### Track Event

Track custom events with optional additional data:

```js
const trackEvent = async () => {
    await linkrunner.trackEvent(
        "event_name", // Name of the event
        { key: "value" } // Optional: Additional JSON data for the event
    );
};
```

### Capture Payment

Capture payment information:

```js
const capturePayment = async () => {
    await linkrunner.capturePayment({
        amount: 100, // Payment amount
        userId: "user123", // User identifier
        paymentId: "payment456", // Optional: Unique payment identifier
        type: "FIRST_PAYMENT", // Optional: Payment type
        status: "PAYMENT_COMPLETED", // Optional: Payment status
    });
};
```

#### Parameters for `linkrunner.capturePayment`

- `amount`: number (required) - The payment amount
- `userId`: string (required) - Identifier for the user making the payment
- `paymentId`: string (optional) - Unique identifier for the payment
- `type`: string (optional) - Type of payment. Available options:
    - `FIRST_PAYMENT` - First payment made by the user
    - `WALLET_TOPUP` - Adding funds to a wallet
    - `FUNDS_WITHDRAWAL` - Withdrawing funds
    - `SUBSCRIPTION_CREATED` - New subscription created
    - `SUBSCRIPTION_RENEWED` - Subscription renewal
    - `ONE_TIME` - One-time payment
    - `RECURRING` - Recurring payment
    - `DEFAULT` - Default type (used if not specified)
- `status`: string (optional) - Status of the payment. Available options:
    - `PAYMENT_INITIATED` - Payment has been initiated
    - `PAYMENT_COMPLETED` - Payment completed successfully (default if not specified)
    - `PAYMENT_FAILED` - Payment attempt failed
    - `PAYMENT_CANCELLED` - Payment was cancelled

### Remove Payment

Remove a captured payment:

```js
const removePayment = async () => {
    await linkrunner.removePayment({
        userId: "user123", // User identifier
        paymentId: "payment456", // Optional: Unique payment identifier
    });
};
```

## Function Placement Guide

Here's where to place each function in your application:

| Function                        | Where to Place                                                          | When to Call                                                                |
| ------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `linkrunner.init`               | In your `App.tsx` within a `useEffect` hook with empty dependency array | Once when the app starts                                                    |
| `linkrunner.getAttributionData` | In your app's attribution handling logic                                | When you need to access attribution data (campaign, deeplink, install info) |
| `linkrunner.signup`             | In your onboarding flow                                                 | Once after user completes the onboarding process                            |
| `linkrunner.setUserData`        | In your authentication logic                                            | Every time the app is opened and the user is logged in                      |
| `linkrunner.trackEvent`         | Throughout your app                                                     | When specific user actions or events occur                                  |
| `linkrunner.capturePayment`     | In your payment processing flow                                         | When a user makes a payment                                                 |
| `linkrunner.removePayment`      | In your payment cancellation flow                                       | When a payment needs to be removed                                          |

## Facing issues during integration?

Mail us at darshil@linkrunner.io

## License

MIT
