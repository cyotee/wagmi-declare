import Ajv2020 from 'ajv/dist/2020'
import schema from './contractlist.schema.json'

const ajv = new Ajv2020({ allErrors: true, strict: false })
const validate = ajv.compile(schema)

export function validateContractList(json: any) {
  const ok = validate(json)
  return { valid: Boolean(ok), errors: validate.errors }
}

export default validateContractList
