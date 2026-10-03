const fs = require('fs');
const cp = require('child_process');

const packageJson = JSON.parse(
    fs.readFileSync('package.json', 'utf8')
);

const version = packageJson.version;

fs.mkdirSync('build', { recursive: true });

const output =
    `build/CppBetterTypes-${version}.vsix`;

cp.execSync(
    `vsce package --out "${output}"`,
    {
        stdio: 'inherit'
    }
);