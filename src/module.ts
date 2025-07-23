import { createRunOncePlugin } from '@expo/config-plugins'

import { withLinkrunner } from './withLinkrunner'

const packageJSON = require('../package.json')
const pluginName = packageJSON['name'] ?? 'expo-linkrunner'
const pluginVersion = packageJSON['version']

const plugin = createRunOncePlugin(withLinkrunner, pluginName, pluginVersion)

export default plugin 