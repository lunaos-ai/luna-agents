#!/usr/bin/env node

/**
 * Luna Auto-Execute Script
 * Automatically executes all implementation tasks without user interaction
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

class AutoExecutor {
  constructor(options = {}) {
    this.options = {
      projectPath: options.projectPath || process.cwd(),
      timeout: parseInt(options.timeout) || 30,
      continue: options.continue || false,
      dryRun: options.dryRun || false,
      force: options.force || false,
      verbose: options.verbose || false,
      maxTasks: options.maxTasks ? parseInt(options.maxTasks) : null,
      skipTests: options.skipTests || false,
      autoDeploy: options.autoDeploy || false,
      parallel: options.parallel || false,
      retryCount: options.retryCount || 3,
      ...options
    };

    this.state = {
      currentTask: null,
      completedTasks: [],
      failedTasks: [],
      executionLog: [],
      startTime: Date.now(),
      tasksExecuted: 0
    };

    this.agents = {
      'luna-auth': 'Authentication & Security Specialist',
      'luna-database': 'Database & Performance Specialist',
      'luna-analytics': 'Analytics & Monitoring Specialist',
      'luna-rag': 'RAG & Search Specialist',
      'luna-hig': 'UI/UX Design Specialist',
      'luna-cloudflare': 'Infrastructure & DevOps Specialist',
      'luna-deployment': 'Deployment & CI/CD Specialist',
      'luna-testing': 'Quality Assurance Specialist',
      'luna-code-review': 'Code Review Specialist',
      'luna-documentation': 'Documentation Specialist'
    };
  }

  async execute() {
    try {
      this.log('🚀 Starting Luna Auto-Execution', 'info');

      // Initialize execution environment
      await this.initializeEnvironment();

      // Load and analyze implementation plan
      const plan = await this.loadImplementationPlan();

      // Determine tasks to execute
      const tasksToExecute = this.getTasksToExecute(plan);

      if (tasksToExecute.length === 0) {
        this.log('✅ All tasks are already completed!', 'success');
        return await this.generateReport();
      }

      if (this.options.dryRun) {
        this.log('📋 Dry Run Mode - Tasks to execute:', 'info');
        tasksToExecute.forEach((task, index) => {
          this.log(`  ${index + 1}. ${task.task}`, 'info');
        });
        return { dryRun: true, tasks: tasksToExecute };
      }

      // Execute tasks sequentially
      for (let i = 0; i < tasksToExecute.length; i++) {
        if (this.options.maxTasks && i >= this.options.maxTasks) {
          this.log(`🛑 Reached maximum task limit (${this.options.maxTasks})`, 'warning');
          break;
        }

        const task = tasksToExecute[i];
        await this.executeTask(task, i + 1, tasksToExecute.length);
      }

      // Handle auto-deployment
      if (this.options.autoDeploy && this.state.failedTasks.length === 0) {
        await this.autoDeploy();
      }

      return await this.generateReport();

    } catch (error) {
      this.log(`❌ Critical error: ${error.message}`, 'error');
      throw error;
    }
  }

  async initializeEnvironment() {
    this.log('🔧 Initializing execution environment...', 'info');

    // Verify project structure
    await this.verifyProjectStructure();

    // Load configuration
    await this.loadConfiguration();

    // Setup state tracking
    await this.setupStateTracking();

    this.log('✅ Environment initialized successfully', 'success');
  }

  async verifyProjectStructure() {
    const requiredPaths = [
      '.luna',
      'backend',
      '.luna/implementation-plan.md'
    ];

    for (const requiredPath of requiredPaths) {
      try {
        await fs.access(path.join(this.options.projectPath, requiredPath));
      } catch (error) {
        throw new Error(`Required path not found: ${requiredPath}`);
      }
    }
  }

  async loadConfiguration() {
    const configPath = path.join(this.options.projectPath, '.luna', 'auto-execution.yml');

    try {
      const configData = await fs.readFile(configPath, 'utf8');
      this.config = { ...this.options, ...this.parseYaml(configData) };
      this.log('📋 Configuration loaded', 'success');
    } catch (error) {
      this.log('⚠️ Using default configuration', 'warning');
      this.config = this.options;
    }
  }

  async setupStateTracking() {
    const statePath = path.join(this.options.projectPath, '.luna', 'execution-state.json');

    if (this.options.continue) {
      try {
        const stateData = await fs.readFile(statePath, 'utf8');
        this.state = { ...this.state, ...JSON.parse(stateData) };
        this.log(`📂 Resuming from previous execution (completed ${this.state.completedTasks.length} tasks)`, 'info');
      } catch (error) {
        this.log('⚠️ No previous state found, starting fresh', 'warning');
      }
    }

    // Save initial state
    await this.saveState();
  }

  async loadImplementationPlan() {
    const planPath = path.join(this.options.projectPath, '.luna', 'implementation-plan.md');
    const planData = await fs.readFile(planPath, 'utf8');

    return this.parseImplementationPlan(planData);
  }

  parseImplementationPlan(planData) {
    const tasks = [];
    const lines = planData.split('\n');
    let currentSection = null;
    let currentTask = null;

    for (const line of lines) {
      const trimmed = line.trim();

      // Detect sections
      if (trimmed.startsWith('### ')) {
        currentSection = trimmed.replace('### ', '');
        continue;
      }

      // Detect tasks
      if (trimmed.startsWith('#### ')) {
        const isCompleted = trimmed.includes('✅ COMPLETED');
        const taskTitle = trimmed.replace('#### ', '').replace(/✅ COMPLETED.*/, '').trim();

        currentTask = {
          id: `${currentSection}_${taskTitle.replace(/\s+/g, '_').toLowerCase()}`,
          task: taskTitle,
          section: currentSection,
          completed: isCompleted,
          acceptance_criteria: [],
          dependencies: [],
          agent: null,
          estimated_effort: null,
          priority: null
        };

        tasks.push(currentTask);
        continue;
      }

      // Parse task details
      if (currentTask && trimmed.startsWith('- **')) {
        if (trimmed.includes('Priority:')) {
          currentTask.priority = trimmed.match(/Priority: (.*)/)?.[1]?.trim() || null;
        } else if (trimmed.includes('Agent Assigned:')) {
          currentTask.agent = trimmed.match(/Agent Assigned: (.*)/)?.[1]?.trim() || null;
        } else if (trimmed.includes('Estimated Effort:')) {
          currentTask.estimated_effort = trimmed.match(/Estimated Effort: (.*)/)?.[1]?.trim() || null;
        } else if (trimmed.includes('Dependencies:')) {
          const deps = trimmed.match(/Dependencies: (.*)/)?.[1]?.trim();
          if (deps && deps !== 'None') {
            currentTask.dependencies = deps.split(',').map(d => d.trim());
          }
        }
      }

      // Parse acceptance criteria
      if (currentTask && trimmed.startsWith('**Acceptance Criteria**:')) {
        const criteriaStart = lines.indexOf(line);
        for (let i = criteriaStart + 1; i < lines.length; i++) {
          const criteriaLine = lines[i].trim();
          if (criteriaLine.startsWith('####') || criteriaLine.startsWith('###')) break;
          if (criteriaLine.startsWith('- [') || criteriaLine.startsWith('-   [')) {
            currentTask.acceptance_criteria.push(criteriaLine);
          }
        }
      }
    }

    return { tasks, sections: this.extractSections(planData) };
  }

  extractSections(planData) {
    const sections = [];
    const lines = planData.split('\n');

    for (const line of lines) {
      if (line.startsWith('## ')) {
        sections.push(line.replace('## ', '').trim());
      }
    }

    return sections;
  }

  getTasksToExecute(plan) {
    let tasks = [...plan.tasks];

    // Filter completed tasks if not continuing
    if (!this.options.continue) {
      tasks = tasks.filter(task => !task.completed);
    } else {
      // Filter tasks that are already in completed state
      tasks = tasks.filter(task =>
        !task.completed && !this.state.completedTasks.some(completed => completed.id === task.id)
      );
    }

    // Sort by dependencies and priority
    tasks = this.sortTasksByDependencies(tasks);

    return tasks;
  }

  sortTasksByDependencies(tasks) {
    const sorted = [];
    const visited = new Set();
    const visiting = new Set();

    const visit = (task) => {
      if (visiting.has(task.id)) {
        throw new Error(`Circular dependency detected: ${task.id}`);
      }
      if (visited.has(task.id)) {
        return;
      }

      visiting.add(task.id);

      // Visit dependencies first
      for (const dep of task.dependencies) {
        const depTask = tasks.find(t => t.id.includes(dep.toLowerCase()));
        if (depTask) {
          visit(depTask);
        }
      }

      visiting.delete(task.id);
      visited.add(task.id);

      if (!sorted.includes(task)) {
        sorted.push(task);
      }
    };

    for (const task of tasks) {
      visit(task);
    }

    // Sort by priority within dependency order
    const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
    sorted.sort((a, b) => {
      const aPriority = priorityOrder[a.priority] || 3;
      const bPriority = priorityOrder[b.priority] || 3;
      return aPriority - bPriority;
    });

    return sorted;
  }

  async executeTask(task, taskNumber, totalTasks) {
    this.state.currentTask = task;
    const startTime = Date.now();

    this.log(`\n🎯 [${taskNumber}/${totalTasks}] Starting: ${task.task}`, 'info');
    this.log(`   📍 Section: ${task.section}`, 'info');
    if (task.agent) {
      this.log(`   🤖 Agent: ${task.agent} (${this.agents[task.agent] || 'Specialist'})`, 'info');
    }

    try {
      // Validate dependencies
      await this.validateTaskDependencies(task);

      // Assign and execute with appropriate agent
      await this.executeWithAgent(task);

      // Run tests (unless skipped)
      if (!this.options.skipTests) {
        await this.runTaskTests(task);
      }

      // Mark as completed
      this.state.completedTasks.push({
        ...task,
        completed_at: new Date().toISOString(),
        execution_time: Date.now() - startTime
      });

      this.state.tasksExecuted++;

      this.log(`   ✅ Task completed successfully! (${Math.round((Date.now() - startTime) / 1000)}s)`, 'success');

      await this.saveState();

    } catch (error) {
      this.log(`   ❌ Task failed: ${error.message}`, 'error');

      const retryCount = task.retryCount || 0;
      if (retryCount < this.options.retryCount) {
        this.log(`   🔄 Retrying task (attempt ${retryCount + 1}/${this.options.retryCount})`, 'warning');
        task.retryCount = retryCount + 1;
        await this.executeTask(task, taskNumber, totalTasks);
        return;
      }

      this.state.failedTasks.push({
        ...task,
        error: error.message,
        failed_at: new Date().toISOString(),
        execution_time: Date.now() - startTime
      });

      if (!this.options.force) {
        throw new Error(`Task execution failed: ${task.task}`);
      }

      this.log(`   ⚠️ Continuing despite failure (force mode)`, 'warning');
      await this.saveState();
    }
  }

  async validateTaskDependencies(task) {
    if (task.dependencies.length === 0) {
      return;
    }

    this.log(`   🔍 Validating dependencies...`, 'info');

    for (const dep of task.dependencies) {
      const isCompleted = this.state.completedTasks.some(completed =>
        completed.id.includes(dep.toLowerCase()) || completed.task.toLowerCase().includes(dep.toLowerCase())
      );

      if (!isCompleted) {
        throw new Error(`Dependency not satisfied: ${dep}`);
      }
    }

    this.log(`   ✅ Dependencies satisfied`, 'success');
  }

  async executeWithAgent(task) {
    const agent = task.agent || this.selectBestAgent(task);
    this.log(`   🤖 Executing with agent: ${agent}`, 'info');

    try {
      // Execute the appropriate Luna Agent command
      const command = this.buildAgentCommand(task, agent);
      this.log(`   🔄 Running: ${command}`, 'info');

      if (!this.options.dryRun) {
        const { stdout, stderr } = await execAsync(command, {
          cwd: this.options.projectPath,
          timeout: this.options.timeout * 60 * 1000 // Convert to milliseconds
        });

        if (stdout) {
          this.log(`   📤 Output: ${stdout.substring(0, 200)}...`, 'info');
        }

        if (stderr) {
          this.log(`   ⚠️ Warning: ${stderr}`, 'warning');
        }
      }

    } catch (error) {
      throw new Error(`Agent execution failed: ${error.message}`);
    }
  }

  selectBestAgent(task) {
    // Determine best agent based on task content
    const taskLower = task.task.toLowerCase() + ' ' + task.section.toLowerCase();

    if (taskLower.includes('auth') || taskLower.includes('security') || taskLower.includes('login')) {
      return 'luna-auth';
    } else if (taskLower.includes('database') || taskLower.includes('performance') || taskLower.includes('query')) {
      return 'luna-database';
    } else if (taskLower.includes('analytics') || taskLower.includes('metrics') || taskLower.includes('dashboard')) {
      return 'luna-analytics';
    } else if (taskLower.includes('rag') || taskLower.includes('search') || taskLower.includes('index')) {
      return 'luna-rag';
    } else if (taskLower.includes('ui') || taskLower.includes('design') || taskLower.includes('interface')) {
      return 'luna-hig';
    } else if (taskLower.includes('deploy') || taskLower.includes('infrastructure') || taskLower.includes('cloudflare')) {
      return 'luna-deployment';
    } else {
      return 'luna-analytics'; // Default agent
    }
  }

  buildAgentCommand(task, agent) {
    // Map agents to their Luna commands
    const agentCommands = {
      'luna-auth': 'luna-auth',
      'luna-database': 'luna-database',
      'luna-analytics': 'luna-analytics',
      'luna-rag': 'luna-rag',
      'luna-hig': 'luna-hig',
      'luna-deployment': 'luna-deploy',
      'luna-testing': 'luna-test',
      'luna-code-review': 'luna-review',
      'luna-documentation': 'luna-docs'
    };

    const baseCommand = agentCommands[agent] || 'luna-execute';

    // Add task-specific parameters
    let params = '';
    if (task.acceptance_criteria.length > 0) {
      params += ` --criteria "${task.acceptance_criteria.length} acceptance criteria"`;
    }
    if (task.priority) {
      params += ` --priority ${task.priority}`;
    }
    if (task.estimated_effort) {
      params += ` --effort "${task.estimated_effort}"`;
    }

    return `${baseCommand} "${task.task}"${params}`;
  }

  async runTaskTests(task) {
    this.log(`   🧪 Running tests for ${task.task}...`, 'info');

    try {
      // Look for test files related to the task
      const testPatterns = [
        `backend/tests/*${task.task.toLowerCase().replace(/\s+/g, '-')}*.test.js`,
        `backend/tests/*${task.section.toLowerCase().replace(/\s+/g, '-')}*.test.js`
      ];

      let testResults = [];

      for (const pattern of testPatterns) {
        try {
          const { stdout } = await execAsync(`npm test -- ${pattern}`, {
            cwd: this.options.projectPath,
            timeout: this.options.timeout * 60 * 1000
          });

          testResults.push(stdout);
          this.log(`   ✅ Tests passed for pattern: ${pattern}`, 'success');
        } catch (error) {
          this.log(`   ⚠️ No tests found for pattern: ${pattern}`, 'warning');
        }
      }

      if (testResults.length === 0) {
        // Run general tests if no specific tests found
        try {
          await execAsync('npm test', {
            cwd: this.options.projectPath,
            timeout: this.options.timeout * 60 * 1000
          });
          this.log(`   ✅ General tests passed`, 'success');
        } catch (error) {
          if (!this.options.force) {
            throw new Error(`Tests failed: ${error.message}`);
          }
          this.log(`   ⚠️ Tests failed but continuing (force mode)`, 'warning');
        }
      }

    } catch (error) {
      if (!this.options.force) {
        throw new Error(`Test execution failed: ${error.message}`);
      }
      this.log(`   ⚠️ Test failures ignored (force mode)`, 'warning');
    }
  }

  async autoDeploy() {
    this.log('\n🚀 Starting auto-deployment...', 'info');

    try {
      // Run deployment preparation
      await execAsync('npm run build', {
        cwd: this.options.projectPath,
        timeout: this.options.timeout * 60 * 1000
      });

      this.log('   📦 Build completed', 'success');

      // Deploy to Cloudflare
      await execAsync('wrangler deploy --env production', {
        cwd: path.join(this.options.projectPath, 'backend'),
        timeout: this.options.timeout * 60 * 1000
      });

      this.log('   🌐 Deployment completed successfully!', 'success');

    } catch (error) {
      this.log(`   ❌ Deployment failed: ${error.message}`, 'error');
      if (!this.options.force) {
        throw error;
      }
    }
  }

  async saveState() {
    const statePath = path.join(this.options.projectPath, '.luna', 'execution-state.json');

    try {
      await fs.writeFile(statePath, JSON.stringify(this.state, null, 2));
    } catch (error) {
      this.log(`⚠️ Failed to save state: ${error.message}`, 'warning');
    }
  }

  async generateReport() {
    const executionTime = Date.now() - this.state.startTime;
    const report = {
      summary: {
        total_tasks: this.state.tasksExecuted + this.state.completedTasks.length + this.state.failedTasks.length,
        completed_tasks: this.state.completedTasks.length,
        failed_tasks: this.state.failedTasks.length,
        execution_time_minutes: Math.round(executionTime / 60000),
        execution_time_formatted: this.formatDuration(executionTime)
      },
      completed_tasks: this.state.completedTasks,
      failed_tasks: this.state.failedTasks,
      performance: {
        avg_task_time: this.state.completedTasks.length > 0
          ? Math.round(this.state.completedTasks.reduce((sum, task) => sum + task.execution_time, 0) / this.state.completedTasks.length / 1000)
          : 0,
        fastest_task: this.state.completedTasks.length > 0
          ? Math.min(...this.state.completedTasks.map(t => t.execution_time)) / 1000
          : 0,
        slowest_task: this.state.completedTasks.length > 0
          ? Math.max(...this.state.completedTasks.map(t => t.execution_time)) / 1000
          : 0
      },
      generated_at: new Date().toISOString()
    };

    // Save report
    const reportPath = path.join(this.options.projectPath, '.luna', 'execution-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Generate markdown report
    await this.generateMarkdownReport(report);

    this.log('\n📊 Execution Report Generated', 'success');
    this.log(`   ✅ Completed: ${report.summary.completed_tasks} tasks`, 'success');
    this.log(`   ⏱️  Total time: ${report.summary.execution_time_formatted}`, 'info');

    if (report.summary.failed_tasks > 0) {
      this.log(`   ❌ Failed: ${report.summary.failed_tasks} tasks`, 'error');
    }

    this.log(`   📄 Report saved to: .luna/execution-report.json`, 'info');

    return report;
  }

  async generateMarkdownReport(report) {
    const markdown = `# Luna Auto-Execution Report

## Summary
- **Total Tasks**: ${report.summary.total_tasks}
- **Completed**: ${report.summary.completed_tasks}
- **Failed**: ${report.summary.failed_tasks}
- **Execution Time**: ${report.summary.execution_time_formatted}
- **Average Task Time**: ${report.performance.avg_task_time}s

## Completed Tasks
${report.completed_tasks.length > 0
  ? report.completed_tasks.map(task =>
      `### ✅ ${task.task}
- **Agent**: ${task.agent || 'Auto-selected'}
- **Section**: ${task.section}
- **Execution Time**: ${Math.round(task.execution_time / 1000)}s
- **Completed At**: ${task.completed_at}`
    ).join('\n\n')
  : 'No completed tasks.'}

## Failed Tasks
${report.failed_tasks.length > 0
  ? report.failed_tasks.map(task =>
      `### ❌ ${task.task}
- **Agent**: ${task.agent || 'Auto-selected'}
- **Section**: ${task.section}
- **Error**: ${task.error}
- **Failed At**: ${task.failed_at}`
    ).join('\n\n')
  : 'No failed tasks.'}

## Performance Metrics
- **Fastest Task**: ${report.performance.fastest_task}s
- **Slowest Task**: ${report.performance.slowest_task}s
- **Average Task Time**: ${report.performance.avg_task_time}s

---
*Report generated at ${report.generated_at}*`;

    const reportPath = path.join(this.options.projectPath, '.luna', 'execution-report.md');
    await fs.writeFile(reportPath, markdown);
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  parseYaml(yamlString) {
    // Simple YAML parser for basic configuration
    const config = {};
    const lines = yamlString.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split(':');
        if (key && valueParts.length > 0) {
          const value = valueParts.join(':').trim();
          config[key] = value === 'true' ? true : value === 'false' ? false :
                      value.startsWith('"') ? value.slice(1, -1) :
                      !isNaN(value) ? Number(value) : value;
        }
      }
    }

    return config;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = {
      'info': '📋',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌'
    }[type] || '📋';

    console.log(`[${timestamp}] ${prefix} ${message}`);

    // Save to execution log
    this.state.executionLog.push({
      timestamp: new Date().toISOString(),
      message,
      type
    });
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--continue':
      case '-c':
        options.continue = true;
        break;
      case '--dry-run':
      case '-d':
        options.dryRun = true;
        break;
      case '--force':
      case '-f':
        options.force = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--skip-tests':
        options.skipTests = true;
        break;
      case '--auto-deploy':
        options.autoDeploy = true;
        break;
      case '--timeout':
      case '-t':
        options.timeout = args[++i];
        break;
      case '--max-tasks':
        options.maxTasks = args[++i];
        break;
      case '--project':
      case '-p':
        options.projectPath = args[++i];
        break;
      case '--retry-count':
        options.retryCount = parseInt(args[++i]);
        break;
    }
  }

  try {
    const executor = new AutoExecutor(options);
    const result = await executor.execute();

    if (result.dryRun) {
      console.log('\n📋 Dry run completed. Use without --dry-run to execute tasks.');
    } else {
      console.log('\n🎉 Auto-execution completed!');
    }

  } catch (error) {
    console.error(`\n💥 Auto-execution failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default AutoExecutor;