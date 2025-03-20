import fs from 'fs';
import path from 'path';

const defaultPatterns = [
    { name: "API Key", regex: /apikey\s*=\s*['"][A-Za-z0-9]{10,}['"]/i },
    { name: "Auth Token", regex: /token\s*=\s*['"][A-Za-z0-9-_]{10,}['"]/i },
    { name: "Bearer Token", regex: /Bearer\s+[A-Za-z0-9-_]{20,}/ },

    // Cloud & Service Credentials
    { name: "Access Key", regex: /ACCESS_KEY\s*=\s*['"][A-Za-z0-9-_]+['"]/i },
    { name: "Client ID", regex: /CLIENT_ID\s*=\s*['"][0-9]+-[A-Za-z0-9]+\.apps\.googleusercontent\.com['"]/i },
    { name: "Client Secret", regex: /CLIENT_SECRET\s*=\s*['"][A-Za-z0-9-_]{24,}['"]/i },
    
    // Generic API Key Patterns
    { name: "API Key", regex: /API_KEY\s*=\s*['"][A-Za-z0-9-_]{20,}['"]/i },
    { name: "Service API Key", regex: /[A-Za-z0-9]{30,}/ },

    // Database & Connection Strings
    { name: "Database URL", regex: /DATABASE_URL\s*=\s*['"][^'"]+['"]/i },
    { name: "Database User", regex: /_USER\s*=\s*['"][A-Za-z0-9]+['"]/i },
    { name: "Database Password", regex: /_PASSWORD\s*=\s*['"][^'"]{6,}['"]/i },
    { name: "Database Host", regex: /_HOST\s*=\s*['"][^'"]+['"]/i },
    { name: "Database Port", regex: /_PORT\s*=\s*\d{4,5}/ },
    { name: "Database Name", regex: /_DB\s*=\s*['"][A-Za-z0-9]+['"]/i },

    // Passwords & Secrets
    { name: "Basic Password", regex: /password\s*=\s*['"][^'"]{6,}['"]/i },
    { name: "Session Secret", regex: /SESSION_SECRET\s*=\s*['"][A-Za-z0-9-_]+['"]/i },
    { name: "SSH Key", regex: /ssh-rsa\s+[A-Za-z0-9+\/=]+/ },

    // JWT (JSON Web Token)
    { name: "JWT", regex: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/ }
];

// Directories and files to ignore
const default_IGNORED_PATHS = new Set([
    'node_modules', '.git', 'dist', 'build', 'coverage', // Directories
    '.env', 'package-lock.json' // Files
]);

// Load patterns from config.json if available
const configPath = path.join(process.cwd(), 'config.json');
let patterns = [...defaultPatterns]; // Start with default patterns
let ignoredPaths = new Set(default_IGNORED_PATHS);

try {
    if (fs.existsSync(configPath)) {
        console.log("🔧 Loading additional customizations from config.json...");
        const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        if (configData.patterns) {
            const customPatterns = Object.entries(configData.patterns).map(([key, value]) => ({
                name: key,
                regex: new RegExp(value.slice(1, -1), value.charAt(0) === '/' ? value.split('/').pop() : '')
            }));

            patterns = [...defaultPatterns, ...customPatterns]; // Merge default and custom patterns
        }
        if (configData.ignored_paths) {
            configData.ignored_paths.forEach((p) => ignoredPaths.add(p));
        }
    } else {
        console.log("⚠️ No config.json found. Using only default patterns and ignored paths.");
    }
} catch (error) {
    console.error("❌ Error loading config.json. Using only default patterns and ignored paths.");
}

// Export merged patterns
export { patterns, ignoredPaths };