#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import chalk from 'chalk'; // Colored console output
import stripAnsi from 'strip-ansi'; // Strip ANSI colors before saving logs

// Load sensitive patterns
let patterns = [];
// Directories and files to ignore
let IGNORED_PATHS = new Set([]);
try {
    const { patterns: importedPatterns, ignoredPaths: importedIgnoredPaths } = await import('./loadconfig.js');
    patterns = importedPatterns;
    IGNORED_PATHS = importedIgnoredPaths;
} catch (error) {
    console.error(chalk.red(`⚠️ Error loading loadconfig.js: ${error.message}`));
    process.exit(1);
}

// Function to mask sensitive values
const maskValue = (value) => {
    if (value.length <= 4) return '****';
    return value[0] + '*'.repeat(value.length - 2) + value[value.length - 1];
};

// Function to scan files for sensitive patterns
const scanFile = (filePath) => {
    let results = [];

    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        let lineNumber = 1;

        fileContent.split('\n').forEach((line) => {
            patterns.forEach(({ name, regex }) => {
                const match = line.match(regex);
                if (match) {
                    results.push({
                        file: filePath,
                        pattern: name,
                        match: maskValue(match[0]), // Masked match
                        line: lineNumber
                    });
                }
            });
            lineNumber++;
        });
    } catch (error) {
        console.error(chalk.red(`⚠️ Error reading file ${filePath}: ${error.message}`));
    }

    return results;
};

// Function to recursively scan a directory (skipping ignored directories and files)
const scanDirectory = (dirPath) => {
    let allResults = [];

    try {
        const files = fs.readdirSync(dirPath);
        files.forEach((file) => {
            const fullPath = path.join(dirPath, file);
            const stats = fs.statSync(fullPath);

            if (IGNORED_PATHS.has(file)) {  // Skip both directories and files
                console.log(chalk.yellow(`🚫 Skipping: ${fullPath}`));
                return;
            }

            if (stats.isDirectory()) {
                allResults = [...allResults, ...scanDirectory(fullPath)];
            } else if (stats.isFile()) {
                const results = scanFile(fullPath);
                if (results.length > 0) {
                    allResults = [...allResults, ...results];
                }
            }
        });
    } catch (error) {
        console.error(chalk.red(`⚠️ Error scanning directory ${dirPath}: ${error.message}`));
    }

    return allResults;
};

// 🏁 Main Execution
const scanPath = process.argv[2] || '.';
console.log(chalk.blue(`🔍 Scanning directory: ${scanPath}`));

const scanResults = scanDirectory(scanPath);

// 📁 Paths for output
const jsonOutputPath = path.join(process.cwd(), 'scan_results.json');
const logOutputPath = path.join(process.cwd(), 'scan_results.log');

// 📜 Read existing JSON results if available
let existingResults = [];
if (fs.existsSync(jsonOutputPath)) {
    try {
        existingResults = JSON.parse(fs.readFileSync(jsonOutputPath, 'utf8'));
    } catch (error) {
        console.error(chalk.red(`⚠️ Error reading existing scan_results.json: ${error.message}`));
    }
}

// 📝 Merge results and save to JSON
const updatedResults = [...existingResults, ...scanResults];
try {
    fs.writeFileSync(jsonOutputPath, JSON.stringify(updatedResults, null, 2), 'utf8');
    console.log(chalk.green(`✅ JSON report saved: ${jsonOutputPath}`));
} catch (error) {
    console.error(chalk.red(`⚠️ Error saving JSON report: ${error.message}`));
}

// 📝 Save to log file (strip ANSI colors)
try {
    const logData = scanResults.map(r => 
        `[${r.pattern}] Found in ${r.file} at line ${r.line} → ${r.match}`
    ).join('\n');

    fs.writeFileSync(logOutputPath, stripAnsi(logData), 'utf8');
    console.log(chalk.green(`📖 Log saved: ${logOutputPath}`));
} catch (error) {
    console.error(chalk.red(`⚠️ Error saving log file: ${error.message}`));
}

console.log(chalk.green(`✅ Scan complete!`));