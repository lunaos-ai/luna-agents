---
name: luna-execute-auto
description: Auto-execute all implementation tasks from design to completion without user interaction
usage: |
  luna-execute-auto [options]

  Automatically executes all remaining tasks in the implementation plan until completion.
  Continues through requirements gathering, design, planning, and execution phases.
  Progresses through tasks sequentially without waiting for user confirmation.

options:
  -p, --project <path>     Project path (default: current directory)
  -t, --timeout <minutes>  Maximum execution time per task (default: 30)
  -c, --continue           Continue from last completed task
  -d, --dry-run           Show execution plan without executing
  -f, --force            Force execution even if errors occur
  -v, --verbose          Verbose output with detailed progress
  --max-tasks <number>   Maximum number of tasks to execute (default: unlimited)
  --skip-tests          Skip test execution for faster deployment
  --auto-deploy         Automatically deploy when all tasks complete

examples:
  luna-execute-auto                    # Execute all remaining tasks
  luna-execute-auto --continue         # Continue from where we left off
  luna-execute-auto --dry-run          # Show execution plan only
  luna-execute-auto --max-tasks 5      # Execute only next 5 tasks
  luna-execute-auto --skip-tests --auto-deploy

# Auto-Execution Command

This command automatically executes the entire Luna Agents implementation lifecycle without requiring user interaction. It's designed for hands-free deployment and continuous development workflows.

## Features

### 🤖 Intelligent Task Management
- Automatically detects current implementation state
- Executes tasks in correct dependency order
- Skips completed tasks automatically
- Handles task failures with retry logic

### ⚡ Continuous Execution
- No manual intervention required
- Automatic task progression
- Real-time progress reporting
- Error recovery and rollback capabilities

### 🔄 Full Lifecycle Coverage
- Requirements analysis (if not complete)
- Technical design (if not complete)
- Implementation planning (if not complete)
- Task execution with automatic testing
- Deployment preparation

### 📊 Progress Tracking
- Real-time execution status
- Task completion metrics
- Performance monitoring
- Detailed execution logs

## Execution Flow

### 1. **Initialization Phase**
```
🔍 Analyzing current project state...
📋 Loading implementation plan...
🔧 Setting up execution environment...
⏱️  Configuring timeout and retry settings...
```

### 2. **Task Discovery**
- Reads `.luna/implementation-plan.md`
- Identifies completed and remaining tasks
- Builds execution dependency graph
- Validates task prerequisites

### 3. **Sequential Execution**
For each remaining task:
```
🎯 Starting Task X.Y: [Task Name]
   ↳ Validating dependencies...
   ↳ Assigning specialist agents...
   ↳ Executing implementation...
   ↳ Running automated tests...
   ↳ Updating progress tracking...
   ↳ Task completed successfully! ✅
```

### 4. **Auto-Deployment (Optional)**
```
🚀 All tasks completed!
   ↳ Running final validation...
   ↳ Preparing deployment package...
   ↳ Deploying to production...
   ↳ Deployment completed! 🎉
```

## Usage Scenarios

### **Development Mode**
```bash
# Continue development from current state
luna-execute-auto --continue --verbose
```

### **Rapid Prototyping**
```bash
# Skip tests for faster iteration
luna-execute-auto --skip-tests --max-tasks 10
```

### **Production Deployment**
```bash
# Full execution with auto-deployment
luna-execute-auto --auto-deploy --force
```

### **Planning Mode**
```bash
# Preview execution without running
luna-execute-auto --dry-run --verbose
```

## Error Handling

### **Automatic Recovery**
- Retry failed tasks up to 3 times
- Alternative agent assignment on failures
- Automatic rollback on critical errors
- Progress preservation between runs

### **Error Categories**
1. **Recoverable Errors** - Retried automatically
2. **Agent-Specific Errors** - Different agent assigned
3. **Critical Errors** - Execution paused with user notification
4. **Timeout Errors** - Task retried with extended timeout

### **Progress Persistence**
```bash
# Execution state saved after each task
.luna/execution-state.json
.luna/task-history.json
.luna/error-logs.json
```

## Monitoring and Reporting

### **Real-time Dashboard**
```bash
# Monitor execution progress
luna-execute-auto --verbose

# Shows:
# - Current task status
# - Completion percentage
# - Time estimates
# - Performance metrics
```

### **Execution Reports**
```bash
# Generated after completion:
.luna/execution-report.md    # Summary report
.luna/performance-metrics.json # Performance data
.luna/task-results.json      # Detailed task outcomes
```

## Advanced Options

### **Selective Execution**
```bash
# Execute specific task categories
luna-execute-auto --include "analytics,database" --exclude "ui"

# Execute with custom agent assignments
luna-execute-auto --agents "database:luna-database,analytics:luna-analytics"
```

### **Performance Optimization**
```bash
# Parallel execution where possible
luna-execute-auto --parallel --max-concurrent 3

# Extended timeouts for complex tasks
luna-execute-auto --timeout 60 --retry-count 5
```

### **Integration Options**
```bash
# Integrate with CI/CD
luna-execute-auto --ci-mode --output-format junit

# Custom hooks
luna-execute-auto --pre-hook "npm test" --post-hook "npm run build"
```

## Safety Features

### **Execution Guards**
- Pre-execution validation checks
- Automatic backup creation
- Rollback capability on failures
- Resource usage monitoring

### **Quality Assurance**
- Automated test execution (unless skipped)
- Code review simulation
- Performance benchmarking
- Security validation

## Exit Codes

- `0` - Success (all tasks completed)
- `1` - Partial completion (some tasks failed)
- `2` - Critical error (execution stopped)
- `3` - Timeout (maximum time exceeded)
- `4` - User interruption

## Configuration

### **Environment Variables**
```bash
LUNA_AUTO_TIMEOUT=60          # Default timeout per task
LUNA_AUTO_RETRY_COUNT=3       # Retry attempts
LUNA_AUTO_PARALLEL=false     # Parallel execution
LUNA_AUTO_DEPLOY=false       # Auto-deployment
```

### **Configuration File**
```yaml
# .luna/auto-execution.yml
execution:
  timeout: 30
  retry_count: 3
  parallel: false
  auto_deploy: false

agents:
  database: luna-database
  analytics: luna-analytics
  ui: luna-hig

hooks:
  pre_task: ["npm test"]
  post_task: ["npm run lint"]
  completion: ["npm run build"]
```

## Integration with IDE

### **VS Code Extension Integration**
```json
// .vscode/tasks.json
{
  "tasks": [
    {
      "label": "Luna Auto Execute",
      "type": "shell",
      "command": "luna-execute-auto",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    }
  ]
}
```

### **Git Hooks Integration**
```bash
# .git/hooks/pre-commit
#!/bin/bash
luna-execute-auto --max-tasks 1 --skip-tests
```

## Troubleshooting

### **Common Issues**
1. **Task Timeouts** - Increase timeout with `--timeout`
2. **Agent Failures** - Check agent availability and permissions
3. **Dependency Issues** - Run with `--force` to bypass minor issues
4. **Resource Limits** - Monitor system resources during execution

### **Debug Mode**
```bash
# Detailed debugging information
luna-execute-auto --verbose --debug --trace

# Save detailed logs
luna-execute-auto --log-file /tmp/luna-execution.log
```

### **Recovery from Failures**
```bash
# Continue from last successful task
luna-execute-auto --continue --force

# Reset and start fresh
luna-execute-auto --reset --clean-state
```

## Performance Tips

### **Optimization Strategies**
1. Use `--skip-tests` for rapid development cycles
2. Enable `--parallel` for independent tasks
3. Adjust `--timeout` based on task complexity
4. Monitor system resources during execution

### **Resource Management**
```bash
# Limit resource usage
luna-execute-auto --max-memory 4GB --max-cpu 2

# Execute during off-peak hours
luna-execute-auto --schedule "2:00 AM"
```

## Best Practices

### **Before Execution**
1. Ensure all dependencies are installed
2. Verify agent availability and permissions
3. Backup current codebase
4. Review implementation plan

### **During Execution**
1. Monitor progress with `--verbose`
2. Watch for performance bottlenecks
3. Check error logs regularly
4. Validate task outputs

### **After Execution**
1. Review execution report
2. Run final validation tests
3. Update documentation
4. Deploy if using `--auto-deploy`

This command enables fully automated, hands-free execution of the entire Luna Agents implementation lifecycle, perfect for continuous integration, rapid prototyping, and automated deployment workflows.