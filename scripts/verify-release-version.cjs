const fs = require('fs');
const path = require('path');

const refName = process.env.GITHUB_REF_NAME || '';
if (!refName) {
  console.error('GITHUB_REF_NAME is not set.');
  process.exit(1);
}

if (!refName.startsWith('v')) {
  console.error(`Release tag must start with 'v'. Received: ${refName}`);
  process.exit(1);
}

const tagVersion = refName.slice(1);
const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const packageVersion = pkg.version;

if (packageVersion !== tagVersion) {
  console.error(`Version mismatch: tag=${tagVersion}, package.json=${packageVersion}`);
  process.exit(1);
}

console.log(`Release version check passed: ${packageVersion}`);
