# expo-linkrunner

Expo Package for [linkrunner.io](https://www.linkrunner.io) - Track and analyze your user journeys without requiring custom native code or development builds!

## Table of Contents

-   [Installation](#installation)
-   [Configuration](#configuration)
-   [Usage](#usage)
    -   [Initialisation](#initialisation)
    -   [Signup](#signup)
    -   [Set User Data](#set-user-data)
    -   [Trigger Deeplink](#trigger-deeplink-for-deferred-deep-linking)
    -   [Track Event](#track-event)
    -   [Capture Payment](#capture-payment)
    -   [Remove Payment](#remove-payment)
    -   [Set Additional Data](#set-additional-data)
-   [Function Placement Guide](#function-placement-guide)
-   [Support](#facing-issues-during-integration)
-   [License](#license)

## Installation

Install the package and its required dependencies:

```sh
npx expo install expo-linkrunner
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

```js
import linkrunner from "expo-linkrunner";
import { useEffect } from "react";

export default function App() {
    useEffect(() => {
        initLinkrunner();
    }, []);

    const initLinkrunner = async () => {
        const initData = await linkrunner.init("YOUR_PROJECT_TOKEN");

        // The response contains IP location data, deeplink info, and campaign data
        console.log(initData);
    };

    // Rest of your app
}
```

#### Response type for `linkrunner.init`

```typescript
{
    ip_location_data: {
        ip: string;
        city: string;
        countryLong: string;
        countryShort: string;
        latitude: number;
        longitude: number;
        region: string;
        timeZone: string;
        zipCode: string;
    }
    deeplink: string;
    root_domain: boolean;
    campaign_data: {
        id: string;
        name: string;
        type: "ORGANIC" | "INORGANIC";
        ad_network: "META" | "GOOGLE" | null;
        group_name: string | null;
        asset_group_name: string | null;
        asset_name: string | null;
    }
    attribution_source: "ORGANIC" | "META" | "GOOGLE";
}
```

### Signup

Call this function once after the user completes your app's onboarding:

```js
import linkrunner from "expo-linkrunner";

const onSignup = async () => {
    const signup = await linkrunner.signup({
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

### Trigger Deeplink (For Deferred Deep Linking)

This function triggers the original deeplink that led to app installation:

```js
import linkrunner from "expo-linkrunner";

const onTriggerDeeplink = async () => {
    await linkrunner.triggerDeeplink();
};
```

Note: For this to work properly, make sure you have added verification objects on the [Linkrunner Dashboard](https://www.linkrunner.io/settings?sort_by=activity-1&s=store-verification).

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

-   `amount`: number (required) - The payment amount
-   `userId`: string (required) - Identifier for the user making the payment
-   `paymentId`: string (optional) - Unique identifier for the payment
-   `type`: string (optional) - Type of payment. Available options:
    -   `FIRST_PAYMENT` - First payment made by the user
    -   `WALLET_TOPUP` - Adding funds to a wallet
    -   `FUNDS_WITHDRAWAL` - Withdrawing funds
    -   `SUBSCRIPTION_CREATED` - New subscription created
    -   `SUBSCRIPTION_RENEWED` - Subscription renewal
    -   `ONE_TIME` - One-time payment
    -   `RECURRING` - Recurring payment
    -   `DEFAULT` - Default type (used if not specified)
-   `status`: string (optional) - Status of the payment. Available options:
    -   `PAYMENT_INITIATED` - Payment has been initiated
    -   `PAYMENT_COMPLETED` - Payment completed successfully (default if not specified)
    -   `PAYMENT_FAILED` - Payment attempt failed
    -   `PAYMENT_CANCELLED` - Payment was cancelled

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

### Set Additional Data

Send integration data to the Linkrunner server:

```js
import linkrunner from "expo-linkrunner";

const sendIntegrationData = async () => {
    await linkrunner.setAdditionalData({
        clevertapId: "user_clevertap_id", // CleverTap identifier
    });
};
```

#### Parameters for `linkrunner.setAdditionalData`

-   `integrationData`: object (required) - Object containing integration data
    -   `clevertapId`: string (optional) - CleverTap identifier for the user

## Function Placement Guide

Here's where to place each function in your application:

| Function                     | Where to Place                                                          | When to Call                                             |
| ---------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------- |
| `linkrunner.init`            | In your `App.tsx` within a `useEffect` hook with empty dependency array | Once when the app starts                                 |
| `linkrunner.signup`          | In your onboarding flow                                                 | Once after user completes the onboarding process         |
| `linkrunner.setUserData`     | In your authentication logic                                            | Every time the app is opened and the user is logged in   |
| `linkrunner.triggerDeeplink` | After navigation initialization                                         | Once after your navigation is ready to handle deep links |
| `linkrunner.trackEvent`      | Throughout your app                                                     | When specific user actions or events occur               |
| `linkrunner.capturePayment`  | In your payment processing flow                                         | When a user makes a payment                              |
| `linkrunner.removePayment`   | In your payment cancellation flow                                       | When a payment needs to be removed                       |
| `linkrunner.setAdditionalData` | After initializing analytics SDKs                                      | When you want to associate analytics IDs with the user   |

## Facing issues during integration?

Mail us at darshil@linkrunner.io

## License

MIT
