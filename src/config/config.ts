import { readFileSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';

const YAML_CONFIG_PROD = 'production.yaml';
const YAML_CONFIG_DEV = 'development.yaml';

export default () => {
  return yaml.load(
    process.env.NODE_ENV === 'production'
      ? readFileSync(join(__dirname, YAML_CONFIG_PROD), 'utf8')
      : readFileSync(join(__dirname, YAML_CONFIG_DEV), 'utf8'),
  ) as Record<string, any>;
};
