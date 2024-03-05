// config.ts
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { join } from 'path';

export const yamlConfigLoader = () => {
  const YAML_CONFIG_FILENAME = 'scrape-config.yaml';
  const filePath = join(process.cwd(), YAML_CONFIG_FILENAME);
  return yaml.load(fs.readFileSync(filePath, 'utf8')) as Record<string, any>;
};
