# 📦 secrets-sniffer
[![npm version](https://img.shields.io/npm/v/secrets-sniffer.svg)](https://www.npmjs.com/package/secrets-sniffer)
[![license](https://img.shields.io/npm/l/secrets-sniffer.svg)](LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/KushBhakkad/secrets-sniffer-NPM-Package)](https://github.com/KushBhakkad/secrets-sniffer-NPM-Package/issues)
[![GitHub stars](https://img.shields.io/github/stars/KushBhakkad/secrets-sniffer-NPM-Package)](https://github.com/KushBhakkad/secrets-sniffer-NPM-Package/stargazers)

🚀 **secrets-sniffer** is a powerful tool that scans Git repositories for accidentally committed secrets (e.g., API keys, passwords, tokens). It provides a JSON report, GitHub release, and downloadable file if secrets are detected. It seamlessly integrates into development workflows, supporting both CLI usage and CI/CD pipeline integration.

---

## 📌 Installation

Install via npm:
```sh
npm install secrets-sniffer
```

Or using yarn:
```sh
yarn global add secrets-sniffer
```

---

## 📌 Usage

### 1️⃣ Run as a CLI tool
```sh
npx secrets-sniffer
```

#### ✅ Example Output:
```sh
⚠️ No config.json found. Using only default patterns.
🔍 Scanning directory: .
🚫 Skipping: .git
🚫 Skipping: node_modules
🚫 Skipping: package-lock.json
✅ JSON report saved: D:\secrets-sniffer\scan_results.json
📖 Log saved: D:\secrets-sniffer\scan_results.log
✅ Scan complete!
```

---

### 2️⃣ Customize Secret Patterns

You can define your own secret patterns in a `config.json` file. This file allows you to specify custom regex patterns for scanning.

#### 📄 Create `config.json`
```sh
mkdir -p $(pwd)
cat <<EOL > config.json
{
    "patterns": {
        "Custom API Key": "/custom_api_key\\s*=\\s*['\"][A-Za-z0-9]{10,}['\"]/",
        "Custom Secret": "/custom_secret\\s*=\\s*['\"][A-Za-z0-9]{15,}['\"]/"
    }
}
EOL
```

#### Now run as a CLI tool:
```sh
npx secrets-sniffer
```

#### ✅ Example Output when using a custom config:
```sh
🔧 Loading additional regex patterns from config.json...
🔍 Scanning directory: .
🚫 Skipping: .git
🚫 Skipping: node_modules
🚫 Skipping: package-lock.json
✅ JSON report saved: D:\secrets-sniffer\scan_results.json
📖 Log saved: D:\secrets-sniffer\scan_results.log
✅ Scan complete!
```

---

### 3️⃣ Integrate with CI/CD (GitHub Actions)

To automate security scanning in CI/CD, create a workflow file in `.github/workflows/security_scan.yml`.

#### 📄 Create `.github/workflows/security_scan.yml`
```sh
mkdir -p .github/workflows
cat <<EOL > .github/workflows/security_scan.yml
name: Security Scan

on: [push, pull_request]

permissions:
  contents: write  # Required for creating a release
  actions: read    

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Clear Cached GitHub Actions  
        run: rm -rf ${{ github.workspace }}/_actions  

      - name: Checkout Repository  
        uses: actions/checkout@v4  

      - name: Install Node.js  
        uses: actions/setup-node@v3  
        with:  
          node-version: 20  

      - name: Install Dependencies  
        run: npm install  

      - name: Run Security Scan  
        run: node node_modules.secrets-sniffer.index.js 

      - name: Ensure scan_results.json Exists  
        run: |
          if [ ! -f scan_results.json ]; then
            echo '[]' > scan_results.json  
          fi

      - name: Upload JSON Report as an Artifact  
        uses: actions/upload-artifact@v4  
        with:  
          name: security-scan-results  
          path: scan_results.json  

      - name: Create GitHub Release 📢  
        uses: softprops/action-gh-release@v2  
        with:  
          tag_name: "v1.0.${{ github.run_number }}"  
          name: "Security Scan Report - Run #${{ github.run_number }}"  
          body: "🔍 Security scan results for commit `${{ github.sha }}`.\nDownload the report below."  
          files: scan_results.json  

      - name: Generate Summary Report
        run: |
          echo "### Security Scan Results" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          if [ -s scan_results.json ]; then
            echo '```json' >> $GITHUB_STEP_SUMMARY
            cat scan_results.json >> $GITHUB_STEP_SUMMARY
            echo '```' >> $GITHUB_STEP_SUMMARY
          else
            echo "✅ No security issues found!" >> $GITHUB_STEP_SUMMARY
          fi
      
      - name: Debug - List Files  
        run: ls -R
EOL
```

Once added, GitHub Actions will run the sniffer on every push and pull request, providing results in the **GitHub Releases** and **Artifacts** section.

---

## 🚀 Features
✔ Easy to use CLI tool  
✔ Lightweight & Fast  
✔ Pre-commit hook to prevent secrets from being committed  
✔ CI/CD integration with GitHub Actions  
✔ Support for custom regex patterns  
✔ Well-documented and actively maintained  

---

## 🤝 Contributing
We welcome contributions! To contribute:
1. Fork this repository
2. Clone your fork:
   ```sh
   git clone https://github.com/KushBhakkad/Secrets-sniffer-NPM-Package.git
   ```
3. Create a feature branch:
   ```sh
   git checkout -b feature-name
   ```
4. Commit your changes:
   ```sh
   git commit -m "Add new feature"
   ```
5. Push to the branch:
   ```sh
   git push origin feature-name
   ```
6. Open a Pull Request

---

## 🛠 Development Setup

1. Clone the repo:
   ```sh
   git clone https://github.com/KushBhakkad/Secrets-sniffer-NPM-Package.git
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Run the command:
   ```sh
   secrets-sniffer
   ```

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📬 Contact & Support
📧 Email: [kushbhakkad@gmail.com]  
📘 GitHub: [Repository](https://github.com/KushBhakkad/Secrets-sniffer-NPM-Package)  

If you find this package useful, please ⭐️ the repo to support its development!

