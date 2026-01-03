# Luna Auto-Execute 🚀

Hands-free execution of all Luna Agents implementation tasks.

## Quick Start

### Installation

```bash
# Install the command
./.luna/install.sh

# Reload your shell or run:
source ~/.bashrc  # or ~/.zshrc
```

### Basic Usage

```bash
# Execute all remaining tasks automatically
luna-execute-auto

# Continue from where you left off
luna-execute-auto --continue

# Preview what will be executed (dry run)
luna-execute-auto --dry-run

# Execute with verbose output
luna-execute-auto --verbose
```

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

## Command Options

| Option | Short | Description |
|--------|-------|-------------|
| `--continue` | `-c` | Continue from last completed task |
| `--dry-run` | `-d` | Show execution plan without executing |
| `--force` | `-f` | Continue execution even if errors occur |
| `--verbose` | `-v` | Verbose output with detailed progress |
| `--skip-tests` | | Skip test execution for faster deployment |
| `--auto-deploy` | | Automatically deploy when all tasks complete |
| `--timeout` | `-t` | Maximum execution time per task (minutes) |
| `--max-tasks` | | Maximum number of tasks to execute |

## Usage Examples

### Development Workflow
```bash
# Continue development from current state
luna-execute-auto --continue --verbose

# Execute next 5 tasks only
luna-execute-auto --max-tasks 5

# Skip tests for rapid iteration
luna-execute-auto --skip-tests --max-tasks 3
```

### Production Deployment
```bash
# Full execution with auto-deployment
luna-execute-auto --auto-deploy --force

# Extended timeout for complex tasks
luna-execute-auto --timeout 60 --auto-deploy
```

### Planning and Validation
```bash
# Preview execution plan
luna-execute-auto --dry-run --verbose

# Check current state
luna-execute-auto --dry-run
```

## Configuration

Edit `.luna/auto-execution.yml` to customize behavior:

```yaml
execution:
  timeout: 30              # Timeout per task (minutes)
  retry_count: 3           # Retry attempts
  auto_deploy: false       # Auto-deploy on completion
  skip_tests: false        # Skip tests
  verbose: false           # Verbose output

agents:
  database: luna-database
  analytics: luna-analytics
  ui: luna-hig

quality:
  min_test_coverage: 80    # Minimum test coverage (%)
  max_slow_queries: 5      # Maximum slow queries allowed
  max_avg_query_time: 50   # Maximum average query time (ms)
```

## Progress Tracking

### State Persistence
- Execution state saved in `.luna/execution-state.json`
- Resume interrupted sessions with `--continue`
- Detailed task history maintained

### Reports Generated
- `.luna/execution-report.json` - Detailed JSON report
- `.luna/execution-report.md` - Human-readable report
- Performance metrics and timing data

### Real-time Monitoring
```bash
# Watch progress with detailed output
luna-execute-auto --verbose

# Monitor specific task types
luna-execute-auto --verbose --agents database,analytics
```

## Error Handling

### Automatic Recovery
- Failed tasks are retried up to 3 times
- Alternative agent assignment on failures
- Automatic rollback on critical errors
- Progress preservation between runs

### Error Categories
1. **Recoverable Errors** - Retried automatically
2. **Agent-Specific Errors** - Different agent assigned
3. **Critical Errors** - Execution paused with notification
4. **Timeout Errors** - Task retried with extended timeout

### Troubleshooting
```bash
# Debug mode with detailed logs
luna-execute-auto --verbose --debug

# Continue despite errors
luna-execute-auto --force

# Reset execution state
rm .luna/execution-state.json
luna-execute-auto
```

## Performance Tips

### Optimization Strategies
```bash
# Skip tests for rapid development
luna-execute-auto --skip-tests

# Extend timeout for complex tasks
luna-execute-auto --timeout 60

# Limit concurrent resource usage
luna-execute-auto --max-tasks 5
```

### Resource Management
- Monitor system resources during execution
- Use `--max-tasks` to limit concurrent workload
- Adjust `--timeout` based on task complexity
- Enable `--skip-tests` for faster iteration cycles

## Integration

### CI/CD Integration
```bash
# Add to your CI/CD pipeline
- name: Auto-Execute Luna Tasks
  run: |
    luna-execute-auto --max-tasks 10 --force
    luna-execute-auto --auto-deploy
```

### Git Hooks
```bash
# Pre-commit hook
#!/bin/bash
luna-execute-auto --max-tasks 1 --skip-tests
```

### VS Code Tasks
```json
{
  "tasks": {
    "Luna Auto Execute": {
      "command": "luna-execute-auto",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always"
      }
    }
  }
}
```

## Monitoring and Observability

### Execution Metrics
- Task completion rate
- Average execution time per task
- Agent performance metrics
- Error rates and retry patterns

### Health Checks
```bash
# Check current execution status
cat .luna/execution-state.json

# Review latest execution report
cat .luna/execution-report.md
```

### Performance Optimization
- Monitor cache hit rates
- Track database query performance
- Analyze agent efficiency
- Identify bottlenecks

## Advanced Usage

### Selective Task Execution
```bash
# Execute specific task categories
luna-execute-auto --include "database,analytics"

# Exclude certain task types
luna-execute-auto --exclude "ui,documentation"
```

### Custom Agent Assignment
```bash
# Override default agent assignments
luna-execute-auto --agents "database:luna-database,analytics:luna-analytics"
```

### Parallel Execution
```bash
# Enable parallel execution (experimental)
luna-execute-auto --parallel --max-concurrent 3
```

## Troubleshooting Common Issues

### Task Timeouts
```bash
# Increase timeout for all tasks
luna-execute-auto --timeout 60

# Specific task timeout in config
execution:
  timeout: 90
```

### Agent Failures
```bash
# Force execution despite agent failures
luna-execute-auto --force

# Check agent availability
luna-execute-auto --dry-run --verbose
```

### Resource Exhaustion
```bash
# Limit concurrent execution
luna-execute-auto --max-tasks 3

# Monitor system resources
htop  # during execution
```

## Support

- **Documentation**: See `.luna/commands/luna-execute-auto.md`
- **Configuration**: Edit `.luna/auto-execution.yml`
- **Issues**: Check `.luna/execution-report.md` for detailed error information
- **Logs**: Review console output for real-time progress

---

**Note**: This tool automatically executes the entire Luna Agents implementation lifecycle. Use with caution in production environments and always review the execution plan with `--dry-run` first.