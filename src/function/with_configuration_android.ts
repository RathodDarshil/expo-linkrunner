import { ConfigPlugin, withProjectBuildGradle } from '@expo/config-plugins'
import { ExpoConfig } from '@expo/config-types'

import { LinkrunnerConfiguration } from '../type/configuration'

const withConfiguration_Android: ConfigPlugin<LinkrunnerConfiguration> = (
    expoConfig: ExpoConfig,
    _configuration: LinkrunnerConfiguration,
): ExpoConfig => {
    // Add gradle repository for rn-linkrunner
    expoConfig = withProjectBuildGradle(expoConfig, (config) => {
        console.log('ExpoLinkrunner: Adding Maven repository for rn-linkrunner')
        
        if(config.modResults.language == 'groovy') {
            // Check if the repository is already added
            if (!config.modResults.contents.includes('maven { url "https://repo1.maven.org/maven2" }')) {
                config.modResults.contents +=`
allprojects {
    repositories {
        maven { url "https://repo1.maven.org/maven2" }
    }
}
`;
            }
        } else {
            // Check if the repository is already added
            if (!config.modResults.contents.includes('maven("https://repo1.maven.org/maven2")')) {
                config.modResults.contents +=`
allprojects {
    repositories {
        maven("https://repo1.maven.org/maven2")
    }
}
`;
            }
        }

        return config;
    });

    return expoConfig
}

export { withConfiguration_Android } 