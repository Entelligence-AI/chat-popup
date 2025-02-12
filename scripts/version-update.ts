#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');

type VersionType = 'major' | 'minor' | 'patch';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function updateVersion(type: VersionType): void {
  try {
    // Read current version
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const currentVersion = packageJson.version;
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    // Calculate new version
    let newVersion: string;
    switch (type) {
      case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
      case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case 'patch':
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
    }

    // Update package.json
    packageJson.version = newVersion;
    fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));

    console.log(`Version updated from ${currentVersion} to ${newVersion}`);
    
    // Git commands
    execSync('git add package.json');
    execSync(`git commit -m "chore: bump version to ${newVersion}"`);
    execSync(`git tag v${newVersion}`);
    
    console.log(`
✅ Version ${newVersion} ready to publish!
Next steps:
1. Push changes: git push origin main
2. Push tags: git push origin v${newVersion}
3. Run: npm publish
    `);

  } catch (error) {
    console.error('Error updating version:', error);
    process.exit(1);
  }
}

function askVersionType(): void {
  rl.question('Select version update type (major/minor/patch): ', (answer: string) => {
    const type = answer.toLowerCase().trim() as VersionType;
    
    if (!['major', 'minor', 'patch'].includes(type)) {
      console.error('Invalid version type. Please use major, minor, or patch');
      rl.close();
      process.exit(1);
    }

    updateVersion(type);
    rl.close();
  });
}

askVersionType(); 