# Luna: Task Execution

Implement tasks from the implementation plan in order.

## Usage

This command will:
1. Find next uncompleted task `[ ]` in current project
2. Implement code following design specs
3. Write tests for new functionality
4. Mark task complete `[x]`
5. Update implementation-plan.md

## Prerequisites

Requires in current project:
- `.luna/{current-project}/implementation-plan.md`
- `.luna/{current-project}/design.md`
- `.luna/{current-project}/requirements.md`

## Execute

Run from any project directory:

```bash
claude-code --agent ~/.claude/agents/luna-task-executor.md
```

When prompted:
- Press **ENTER** for project-level execution
- Type **feature-name** to match your plan scope

## Run Multiple Times

Each execution completes ONE task. Run repeatedly to complete all tasks:

```bash
# Run until all tasks are done
luna-execute  # Completes task 1.1
luna-execute  # Completes task 1.2
luna-execute  # Completes task 1.3
# ... continue until all [ ] become [x]
```

## Output

In current project:
- Modified source code files
- Updated implementation-plan.md with `[x]` marks
- Git commits for each completed task

## Next Step

After all tasks complete, run code review:
```bash
luna-review
```