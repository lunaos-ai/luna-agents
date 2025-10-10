# Luna: Task Planning

Break down the design into ordered, actionable implementation tasks.

## Usage

This command will:
1. Read design.md and requirements.md from current project
2. Create task hierarchy with dependencies
3. Define acceptance criteria per task
4. Generate implementation-plan.md with checkboxes

## Prerequisites

Requires in current project:
- `.luna/{current-project}/design.md`
- `.luna/{current-project}/requirements.md`

## Execute

Run from any project directory:

```bash
claude-code --agent ~/.claude/agents/luna-task-planner.md
```

When prompted:
- Press **ENTER** for project-level planning
- Type **feature-name** to match your design scope

## Output

Creates in current project:
- `.luna/{current-project}/implementation-plan.md` (project-level)
- `.luna/{current-project}/{feature}/implementation-plan.md` (feature-level)

Contains ordered tasks with `[ ]` checkboxes that will be marked `[x]` as completed.

## Next Step

Start implementing tasks:
```bash
luna-execute
```