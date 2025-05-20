import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as Application from "expo-application";
import { device_data, getDeeplinkURL, getLinkRunnerInstallInstanceId, setDeeplinkURL } from "./helper";
import type { CampaignData, LRIPLocationData, UserData } from "./types";

// Get package version
const package_version = "1.3.3";
const app_version = Application.nativeApplicationVersion || "";

const baseUrl = "https://api.linkrunner.io";

const initApiCall = async (token: string, source: "GENERAL" | "ADS", link?: string, debug?: boolean) => {
    try {
        const fetch_result = await fetch(baseUrl + "/api/client/init", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token,
                package_version,
                app_version,
                device_data: await device_data(),
                platform: "EXPO",
                source,
                link,
                install_instance_id: await getLinkRunnerInstallInstanceId(),
                debug,
            }),
        });

        const result = await fetch_result.json();

        if (result?.status !== 200 && result?.status !== 201) {
            throw new Error(result?.msg);
        }

        if (__DEV__) {
            console.log("Linkrunner initialised successfully 🔥");
            console.log("init response > ", result);
        }

        if (!!result?.data?.deeplink) setDeeplinkURL(result?.data?.deeplink);

        return result?.data;
    } catch (error) {
        console.error("Error initializing linkrunner", error);
    }
};

class Linkrunner {
    private token: string | null;

    constructor() {
        this.token = null;
    }

    async init(token: string, options?: { debug: boolean }): Promise<void | LRInitResponse> {
        if (!token) {
            console.error("Linkrunner needs your project token to initialize!");
            return;
        }

        this.token = token;

        return await initApiCall(token, "GENERAL", undefined, options?.debug);
    }

    async signup({
        data,
        user_data,
    }: {
        data?: { [key: string]: any };
        user_data: UserData;
    }): Promise<void | LRTriggerResponse> {
        if (!this.token) {
            console.error("Linkrunner: Signup failed, token not initialized");
            return;
        }

        try {
            const response = await fetch(baseUrl + "/api/client/trigger", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: this.token,
                    user_data,
                    platform: "EXPO",
                    data: {
                        ...data,
                        device_data: await device_data(),
                    },
                    install_instance_id: await getLinkRunnerInstallInstanceId(),
                }),
            });
            const result = await response.json();

            if (result?.status !== 200 && result?.status !== 201) {
                console.error("Linkrunner: Signup failed");
                console.error("Linkrunner: ", result?.msg);
                return;
            }

            if (__DEV__) {
                console.log("Linkrunner: Signup called 🔥");
            }

            return result.data;
        } catch (err: any) {
            console.error("Linkrunner: Signup failed");
            console.error("Linkrunner: ", err.message);
        }
    }

    async triggerDeeplink() {
        const deeplink_url = await getDeeplinkURL();

        if (!deeplink_url) {
            console.error("Linkrunner: Deeplink URL not found");
            return;
        }

        Linking.openURL(deeplink_url).then(() => {
            fetch(baseUrl + "/api/client/deeplink-triggered", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: this.token,
                }),
            })
                .then(() => {
                    if (__DEV__) {
                        console.log("Linkrunner: Deeplink triggered successfully", deeplink_url);
                    }
                })
                .catch(() => {
                    if (__DEV__) {
                        console.error("Linkrunner: Deeplink triggering failed", deeplink_url);
                    }
                });
        });
    }

    async setUserData(user_data: UserData) {
        if (!this.token) {
            console.error("Linkrunner: Set user data failed, token not initialized");
            return;
        }

        try {
            const response = await fetch(baseUrl + "/api/client/set-user-data", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: this.token,
                    user_data,
                    device_data: await device_data(),
                    install_instance_id: await getLinkRunnerInstallInstanceId(),
                }),
            });

            const result = await response.json();

            if (result?.status !== 200 && result?.status !== 201) {
                console.error("Linkrunner: Set user data failed");
                console.error("Linkrunner: ", result?.msg);
                return;
            }

            return result.data;
        } catch (err: any) {
            console.error("Linkrunner: Set user data failed");
            console.error("Linkrunner: ", err?.message);
        }
    }

    async capturePayment({
        amount,
        userId,
        paymentId,
        type,
        status,
    }: {
        paymentId?: string;
        userId: string;
        amount: number;
        type?:
            | "FIRST_PAYMENT"
            | "WALLET_TOPUP"
            | "FUNDS_WITHDRAWAL"
            | "SUBSCRIPTION_CREATED"
            | "SUBSCRIPTION_RENEWED"
            | "DEFAULT"
            | "ONE_TIME"
            | "RECURRING";
        status?: "PAYMENT_INITIATED" | "PAYMENT_COMPLETED" | "PAYMENT_FAILED" | "PAYMENT_CANCELLED";
    }) {
        if (!this.token) {
            console.error("Linkrunner: Capture payment failed, token not initialized");
            return;
        }

        try {
            const response = await fetch(baseUrl + "/api/client/capture-payment", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: this.token,
                    user_id: userId,
                    platform: "EXPO",
                    data: {
                        device_data: await device_data(),
                    },
                    amount,
                    payment_id: paymentId,
                    type,
                    status,
                    install_instance_id: await getLinkRunnerInstallInstanceId(),
                }),
            });

            const result = await response.json();

            if (result?.status !== 200 && result?.status !== 201) {
                console.error("Linkrunner: Capture payment failed");
                console.error("Linkrunner: ", result?.msg);
                return;
            }

            if (__DEV__) {
                console.log("Linkrunner: Payment captured successfully 💸", {
                    amount,
                    paymentId,
                    userId,
                    type,
                    status,
                });
            }
        } catch (error) {
            console.error("Linkrunner: Payment capturing failed!");
            return;
        }
    }

    async removePayment({ userId, paymentId }: { paymentId?: string; userId: string }) {
        if (!this.token) {
            console.error("Linkrunner: Remove payment failed, token not initialized");
            return;
        }

        if (!paymentId && !userId) {
            return console.error("Linkrunner: Either paymentId or userId must be provided!");
        }

        try {
            const response = await fetch(baseUrl + "/api/client/remove-captured-payment", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: this.token,
                    user_id: userId,
                    platform: "EXPO",
                    data: {
                        device_data: await device_data(),
                    },
                    payment_id: paymentId,
                    install_instance_id: await getLinkRunnerInstallInstanceId(),
                }),
            });

            const result = await response.json();

            if (result?.status !== 200 && result?.status !== 201) {
                console.error("Linkrunner: Remove payment failed");
                console.error("Linkrunner: ", result?.msg);
                return;
            }

            if (__DEV__) {
                console.log("Linkrunner: Payment entry removed successfully!", {
                    paymentId,
                    userId,
                });
            }
        } catch (error) {
            console.error("Linkrunner: Payment removal failed!");
            return;
        }
    }

    async trackEvent(eventName: string, eventData?: Record<string, any>) {
        if (!this.token) {
            console.error("Linkrunner: Track event failed, token not initialized");
            return;
        }

        if (!eventName) {
            return console.error("Linkrunner: Event name is required");
        }

        try {
            const response = await fetch(baseUrl + "/api/client/capture-event", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: this.token,
                    event_name: eventName,
                    event_data: eventData,
                    device_data: await device_data(),
                    install_instance_id: await getLinkRunnerInstallInstanceId(),
                }),
            });

            const result = await response.json();

            if (result?.status !== 200 && result?.status !== 201) {
                console.error("Linkrunner: Track event failed");
                console.error("Linkrunner: ", result?.msg);
                return;
            }

            if (__DEV__) {
                console.log("Linkrunner: Tracking event", eventName, eventData);
            }

            return result?.data;
        } catch (error) {
            console.error("Linkrunner: Track event failed");
            console.error("Linkrunner: ", error);
        }
    }

    /**
     * Processes Google Analytics with GCLID from install referrer
     * Note: This functionality is limited in Expo compared to React Native
     * @param analytics - Instance of Firebase Analytics
     */
    async processGoogleAnalytics(analytics: any): Promise<void> {
        if (Platform.OS !== "android") {
            return;
        }

        console.warn(
            "Linkrunner: processGoogleAnalytics has limited functionality in Expo. For full functionality, consider using a development build with native modules."
        );

        try {
            // In Expo, we can't directly access the install referrer
            // Instead, we'll check if Analytics is available and log a placeholder event
            if (analytics && typeof analytics().logEvent === "function") {
                await analytics().logEvent("expo_linkrunner_init", {
                    platform: "expo",
                });
            }
        } catch (error) {
            console.error("Linkrunner: Error processing Google Analytics:", error);
        }
    }
}

const linkrunner = new Linkrunner();

export type LRInitResponse = {
    ip_location_data: LRIPLocationData;
    deeplink: string;
    root_domain: boolean;
    campaign_data: CampaignData;
    attribution_source?: "ORGANIC" | "META" | "GOOGLE";
};

export type LRTriggerResponse = {
    ip_location_data: LRIPLocationData;
    deeplink: string;
    root_domain: boolean;
    trigger?: boolean;
    campaign_data: CampaignData;
};

export default linkrunner;
