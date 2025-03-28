import * as Application from "expo-application";
import * as Device from "expo-device";
import * as Network from "expo-network";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as TrackingTransparency from "expo-tracking-transparency";
import { Platform } from "react-native";

// Constants for storage
const STORAGE_KEY = "linkrunner_install_instance_id";
const DEEPLINK_URL_STORAGE_KEY = "linkrunner_deeplink_url";
const ID_LENGTH = 20;

// Function to get device data (replacing device_data from original)
const device_data = async (): Promise<Record<string, any>> => {
    try {
        // Collect data in parallel where possible
        const [networkState, deviceType] = await Promise.all([
            Network.getNetworkStateAsync(),
            Device.getDeviceTypeAsync(),
        ]);

        // Get manufacturer directly, as it's a property not an async method
        const manufacturer = Device.manufacturer;

        // Get the device IP address (may be localhost in development)
        const ipAddress = await Network.getIpAddressAsync();

        // Helper function to safely get device info with fallback
        const safeGet = async <T>(getter: () => Promise<T> | T, fallback: T = null as unknown as T): Promise<T> => {
            try {
                return await getter();
            } catch (error) {
                console.warn(`DeviceInfo error: ${error}`);
                return fallback;
            }
        };

        // Create a map of device information
        return {
            // Device information
            brand: await safeGet(() => Device.brand),
            device: await safeGet(() => Device.modelName),
            device_id: await safeGet(() => Device.modelId),
            device_type: Device.DeviceType[deviceType],
            manufacturer,
            system_version: await safeGet(() => Device.osVersion),
            device_name: await safeGet(() => Device.deviceName),

            // Application information
            application_name: await safeGet(() => Application.applicationName),
            build_number: await safeGet(() => Application.nativeBuildVersion),
            bundle_id: await safeGet(() => Application.applicationId),
            version: await safeGet(() => Application.nativeApplicationVersion),

            // Network information
            device_ip: ipAddress,
            connectivity: networkState.type,
            // Check if the network type is cellular
            carrier: networkState.type === Network.NetworkStateType.CELLULAR ? "cellular" : null,

            // Unique identifiers
            android_id: Platform.OS === "android" ? await safeGet(Application.getAndroidId) : null,

            // Advertising IDs with privacy controls
            idfa: Platform.OS === "ios" ? await getAdvertisingIdentifier() : null,
            gaid: Platform.OS === "android" ? await safeGet(Application.getAndroidId) : null,

            // For IDFV, use dedicated function
            idfv: Platform.OS === "ios" ? await getIosIdentifierForVendor() : null,

            // Only call getInstallReferrerAsync on Android
            install_ref: Platform.OS === "android" ? await safeGet(Application.getInstallReferrerAsync) : null,

            // User agent - this method doesn't exist in the current API
            // If you need user agent, consider alternative approaches
            user_agent: null,
        };
    } catch (error) {
        console.error("Error collecting device data:", error);
        return { error: "Failed to collect device data" };
    }
};

// Function to get advertising identifier
const getAdvertisingIdentifier = async (): Promise<string | null> => {
    if (Platform.OS === "ios") {
        try {
            const isAvailable = await TrackingTransparency.isAvailable();
            if (!isAvailable) {
                return null;
            }
            const { status: initialStatus } = await TrackingTransparency.getTrackingPermissionsAsync();
            if (initialStatus === "granted") {
                // Use the correct getAdvertisingId method from TrackingTransparency
                return await TrackingTransparency.getAdvertisingId();
            }
            // Request tracking permission first
            const { status: requestStatus } = await TrackingTransparency.requestTrackingPermissionsAsync();
            if (requestStatus === "granted") {
                // Use the correct getAdvertisingId method from TrackingTransparency
                return await TrackingTransparency.getAdvertisingId();
            }
            return null;
        } catch (error) {
            console.error("Error getting advertising identifier:", error);
            return null;
        }
    }
    return null;
};

// Function to get iOS Identifier for Vendor
const getIosIdentifierForVendor = async (): Promise<string | null> => {
    if (Platform.OS === "ios") {
        try {
            return await Application.getIosIdForVendorAsync();
        } catch (error) {
            console.error("Error getting iOS identifier for vendor:", error);
            return null;
        }
    }
    return null;
};

// Function to get or generate install instance ID
async function getLinkRunnerInstallInstanceId(): Promise<string> {
    try {
        // Try to get the existing ID
        let installInstanceId = await AsyncStorage.getItem(STORAGE_KEY);

        // If the ID doesn't exist, generate a new one and store it
        if (installInstanceId === null) {
            installInstanceId = generateRandomString(ID_LENGTH);
            await AsyncStorage.setItem(STORAGE_KEY, installInstanceId);
        }

        return installInstanceId;
    } catch (error) {
        console.error("Error accessing AsyncStorage:", error);
        return "ERROR_GENERATING_INSTALL_INSTANCE_ID";
    }
}

function generateRandomString(length: number): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array(length)
        .fill(null)
        .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
        .join("");
}

// Functions for deeplink URL storage
async function setDeeplinkURL(deeplink_url: string) {
    try {
        await AsyncStorage.setItem(DEEPLINK_URL_STORAGE_KEY, deeplink_url);
    } catch (error) {
        console.error("Error setting deeplink URL:", error);
    }
}

async function getDeeplinkURL(): Promise<string | null> {
    try {
        return await AsyncStorage.getItem(DEEPLINK_URL_STORAGE_KEY);
    } catch (error) {
        console.error("Error getting deeplink URL:", error);
        return null;
    }
}

export { device_data, getDeeplinkURL, getLinkRunnerInstallInstanceId, setDeeplinkURL };
