import { ConfigPlugin } from '@expo/config-plugins'
import { ExpoConfig } from '@expo/config-types'

import { LinkrunnerConfiguration } from '../type/configuration'

const withConfiguration_Android: ConfigPlugin<LinkrunnerConfiguration> = (
    expoConfig: ExpoConfig,
    _configuration: LinkrunnerConfiguration,
): ExpoConfig => {
    return expoConfig
}

export { withConfiguration_Android } 