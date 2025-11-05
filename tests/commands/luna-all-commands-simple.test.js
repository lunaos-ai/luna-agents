/**
 * Luna All Commands Test Suite (Simplified)
 * Basic validation for all Luna agent commands
 */

const { LunaTestFramework } = require('../framework/luna-test-framework');
const path = require('path');
const fs = require('fs');

class LunaAllCommandsSimpleTests {
  constructor() {
    this.framework = new LunaTestFramework();
    this.rootDir = path.resolve(__dirname, '../..');
    this.commandsDir = path.join(this.rootDir, 'commands');
    this.scriptsDir = path.join(this.rootDir, 'scripts');

    this.setupTestSuite();
  }

  setupTestSuite() {
    const suite = this.framework.createTestSuite('Luna All Commands');

    this.framework.addTest('Luna All Commands', 'should have all command documentation files', async () => {
      const expectedCommands = [
        'luna-deploy.md',
        'luna-design.md',
        'luna-docs.md',
        'luna-execute.md',
        'luna-monitor.md',
        'luna-plan.md',
        'luna-postlaunch.md',
        'luna-requirements.md',
        'luna-review.md',
        'luna-test.md',
        'luna-hig.md',
        'luna-plan-v2.md',
        'luna-config.md',
        'luna-shortcuts.md',
        'luna-ui-convert.md',
        'luna-cloudflare-auto.md',
        'luna-dockerize.md',
        'luna-rag.md'
      ];

      for (const commandFile of expectedCommands) {
        const filePath = path.join(this.commandsDir, commandFile);
        const exists = await this.framework.fileExists(filePath);
        this.framework.assert(exists, `Command documentation ${commandFile} should exist`);
      }
    });

    this.framework.addTest('Luna All Commands', 'should have valid markdown format', async () => {
      const commandFiles = await fs.promises.readdir(this.commandsDir);

      for (const file of commandFiles) {
        if (file.endsWith('.md')) {
          const content = await this.framework.readFile(path.join(this.commandsDir, file));

          // Check for required markdown elements
          this.framework.assert(content.includes('#'), `${file} should have a title`);
          this.framework.assert(content.includes('##'), `${file} should have sections`);
        }
      }
    });

    this.framework.addTest('Luna All Commands', 'should have luna-shortcuts implementation', async () => {
      const shortcutsScript = path.join(this.scriptsDir, 'luna-shortcuts.js');
      const exists = await this.framework.fileExists(shortcutsScript);
      this.framework.assert(exists, 'luna-shortcuts.js implementation should exist');

      const content = await this.framework.readFile(shortcutsScript);
      this.framework.assert(content.includes('class LunaShortcuts'), 'Should have LunaShortcuts class');
      this.framework.assert(content.includes('module.exports'), 'Should export functionality');
    });

    this.framework.addTest('Luna All Commands', 'should have validate-plugin implementation', async () => {
      const validateScript = path.join(this.scriptsDir, 'validate-plugin.js');
      const exists = await this.framework.fileExists(validateScript);
      this.framework.assert(exists, 'validate-plugin.js should exist');
    });

    this.framework.addTest('Luna All Commands', 'should have link-plugin implementation', async () => {
      const linkScript = path.join(this.scriptsDir, 'link-plugin.js');
      const exists = await this.framework.fileExists(linkScript);
      this.framework.assert(exists, 'link-plugin.js should exist');
    });

    this.framework.addTest('Luna All Commands', 'should have valid AGENTS_OVERVIEW.md', async () => {
      const overviewPath = path.join(this.rootDir, 'AGENTS_OVERVIEW.md');
      const exists = await this.framework.fileExists(overviewPath);
      this.framework.assert(exists, 'AGENTS_OVERVIEW.md should exist');

      const content = await this.framework.readFile(overviewPath);
      this.framework.assert(content.includes('# Luna Agents'), 'Should have main title');
      this.framework.assert(content.includes('luna-rag'), 'Should include luna-rag agent');
    });

    this.framework.addTest('Luna All Commands', 'should have agents directory with files', async () => {
      const agentsDir = path.join(this.rootDir, 'agents');
      const exists = await this.framework.fileExists(agentsDir);
      this.framework.assert(exists, 'agents directory should exist');

      const agentFiles = await fs.promises.readdir(agentsDir);
      const markdownFiles = agentFiles.filter(f => f.endsWith('.md'));

      this.framework.assert(markdownFiles.length >= 15,
        `Should have at least 15 agent files, found ${markdownFiles.length}`);
    });

    this.framework.addTest('Luna All Commands', 'should have consistent naming conventions', async () => {
      const commandFiles = await fs.promises.readdir(this.commandsDir);
      const markdownFiles = commandFiles.filter(f => f.endsWith('.md'));

      for (const file of markdownFiles) {
        // All command files should follow luna-*.md pattern
        this.framework.assert(file.startsWith('luna-'),
          `Command file ${file} should start with 'luna-'`);
        this.framework.assert(file.endsWith('.md'),
          `Command file ${file} should end with '.md'`);
      }
    });

    this.framework.addTest('Luna All Commands', 'should have reasonable file sizes', async () => {
      const commandFiles = await fs.promises.readdir(this.commandsDir);

      for (const file of commandFiles) {
        if (file.endsWith('.md')) {
          const stats = await fs.promises.stat(path.join(this.commandsDir, file));
          const sizeKB = stats.size / 1024;

          // Each command file should be between 1KB and 50KB
          this.framework.assert(sizeKB >= 1 && sizeKB <= 50,
            `Command file ${file} should be between 1KB and 50KB, is ${sizeKB.toFixed(1)}KB`);
        }
      }
    });
  }

  // Run all tests
  async runTests() {
    return await this.framework.runTests();
  }
}

module.exports = { LunaAllCommandsSimpleTests };
