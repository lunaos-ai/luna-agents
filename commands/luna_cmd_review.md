# Luna: Code Review

Perform comprehensive code review of implemented features.

## Usage

This command will:
1. Review all completed tasks in current project
2. Check code quality and security
3. Validate against requirements
4. Identify issues and improvements
5. Generate code-review-report.md

## Prerequisites

Requires in current project:
- `.luna/{current-project}/implementation-plan.md` (with completed tasks)
- `.luna/{current-project}/design.md`
- `.luna/{current-project}/requirements.md`
- Implemented source code

## Execute

Run from any project directory:

```bash
claude-code --agent ~/.claude/agents/luna-code-review.md
```

When prompted:
- Press **ENTER** for project-level review
- Type **feature-name** to match your implementation scope

## Output

Creates in current project:
- `.luna/{current-project}/code-review-report.md` (project-level)
- `.luna/{current-project}/{feature}/code-review-report.md` (feature-level)

Includes:
- Critical/Major/Minor issues found
- Security analysis
- Performance review
- Recommendations with code examples
- Approval status

## Next Step

After addressing any critical issues, run tests:
```bash
luna-test
```