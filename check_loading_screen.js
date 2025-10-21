// Let's check if the loadingScreen object has a hide method
const fs = require('fs');
const content = fs.readFileSync('test_camera_character_integration.html', 'utf8');

// Find where loadingScreen is defined
const loadingScreenMatch = content.match(/loadingScreen\s*=\s*{[\s\S]*?};/);
if (loadingScreenMatch) {
  console.log('Found loadingScreen definition:');
  console.log(loadingScreenMatch[0]);
}

// Find where it's used
const hideMatches = content.match(/loadingScreen\.hide\(\)/g);
console.log('\nloadingScreen.hide() calls:', hideMatches ? hideMatches.length : 0);
