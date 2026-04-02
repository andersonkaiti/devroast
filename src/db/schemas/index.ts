export { analysisFindings } from './analysis-findings'
export { roastModeEnum, severityEnum } from './enums'
export { submissions } from './submissions'

export const schema = {
  roastModeEnum: require('./enums').roastModeEnum,
  severityEnum: require('./enums').severityEnum,
  submissions: require('./submissions').submissions,
  analysisFindings: require('./analysis-findings').analysisFindings,
}
