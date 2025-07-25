import { ConfigPlugin } from '@expo/config-plugins'
import { ExpoConfig } from '@expo/config-types'

import { withConfiguration_Android, withConfiguration_iOS } from './function/module'
import { LinkrunnerConfiguration } from './type/configuration'

const withLinkrunner: ConfigPlugin<LinkrunnerConfiguration> = (
    expoConfig: ExpoConfig,
    configuration: LinkrunnerConfiguration,
): ExpoConfig => {
    if (configuration?.debug) {
        console.log('ExpoLinkrunner: Applying plugin configuration')
    }

    expoConfig = withConfiguration_Android(expoConfig, configuration)
    expoConfig = withConfiguration_iOS(expoConfig, configuration)
    return expoConfig
}

export { withLinkrunner } 