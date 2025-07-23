import { ConfigPlugin, withInfoPlist, withPlugins } from '@expo/config-plugins'
import { ExpoConfig } from '@expo/config-types'

import { LinkrunnerConfiguration } from '../type/configuration'

const withConfiguration_iOS: ConfigPlugin<LinkrunnerConfiguration> = (
    expoConfig: ExpoConfig,
    _configuration: LinkrunnerConfiguration,
): ExpoConfig => {
    console.log('ExpoLinkrunner: Applying iOS configuration')

    expoConfig = withInfoPlist(expoConfig, expoConfig => {

        // Add default tracking description if not already present
        if (!expoConfig.modResults.NSUserTrackingUsageDescription) {
            expoConfig.modResults.NSUserTrackingUsageDescription = 
                "This identifier will be used to deliver personalized ads to you."
        }

        console.log('ExpoLinkrunner: iOS Info.plist configured successfully')
        return expoConfig
    })

    // Automatically apply expo-tracking-transparency plugin
    expoConfig = withPlugins(expoConfig, [
        [
            'expo-tracking-transparency',
            {
                userTrackingPermission: 'This identifier will be used to deliver personalized ads and improve your app experience.'
            }
        ]
    ])

    return expoConfig
}

export { withConfiguration_iOS } 