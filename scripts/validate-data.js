#!/usr/bin/env node
/**
 * Validates every Data Doc listed in /data/index.json against its JSON
 * Schema (for JSON docs) or checks for required frontmatter (for Markdown
 * docs). Run with `npm run validate:data`.
 */
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const matter = require('gray-matter');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SCHEMA_DIR = path.join(DATA_DIR, 'schema');

const SCHEMA_BY_CATEGORY = {
  plants: 'plant.schema.json',
  soil: 'soil-profile.schema.json',
  fertilizer: 'fertilizer-recipe.schema.json',
  seasonal: 'seasonal-rule.schema.json',
};

function loadSchema(fileName) {
  const filePath = path.join(SCHEMA_DIR, fileName);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  const validatorCache = new Map();

  function getValidator(schemaFile) {
    if (!validatorCache.has(schemaFile)) {
      validatorCache.set(schemaFile, ajv.compile(loadSchema(schemaFile)));
    }
    return validatorCache.get(schemaFile);
  }

  const index = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'index.json'), 'utf8'));
  let errorCount = 0;
  let checkedCount = 0;

  for (const [category, files] of Object.entries(index)) {
    if (category.startsWith('$')) continue;

    const schemaFile = SCHEMA_BY_CATEGORY[category];

    for (const relPath of files) {
      const fullPath = path.join(DATA_DIR, relPath);
      checkedCount += 1;

      if (!fs.existsSync(fullPath)) {
        console.error(`✗ Missing file listed in index.json: ${relPath}`);
        errorCount += 1;
        continue;
      }

      if (relPath.endsWith('.md')) {
        const raw = fs.readFileSync(fullPath, 'utf8');
        const { data } = matter(raw);
        if (!data || Object.keys(data).length === 0) {
          console.error(`✗ ${relPath}: missing YAML frontmatter`);
          errorCount += 1;
        } else {
          console.log(`✓ ${relPath}`);
        }
        continue;
      }

      if (!schemaFile) {
        console.log(`✓ ${relPath} (no schema configured for category "${category}", skipped)`);
        continue;
      }

      const validate = getValidator(schemaFile);
      const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

      if (!validate(content)) {
        console.error(`✗ ${relPath}:`);
        for (const err of validate.errors) {
          console.error(`    ${err.instancePath || '(root)'} ${err.message}`);
        }
        errorCount += 1;
      } else {
        console.log(`✓ ${relPath}`);
      }
    }
  }

  console.log(`\nChecked ${checkedCount} doc(s), ${errorCount} error(s).`);
  if (errorCount > 0) {
    process.exit(1);
  }
}

main();
