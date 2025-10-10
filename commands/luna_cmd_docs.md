# Luna: Documentation

Create comprehensive user, developer, and API documentation.

## Usage

This command will:
1. Generate user guides for current project
2. Create developer documentation
3. Document API endpoints
4. Write deployment guides
5. Create operations runbooks

## Prerequisites

Requires in current project:
- `.luna/{current-project}/requirements.md`
- `.luna/{current-project}/design.md`
- `.luna/{current-project}/implementation-plan.md`
- `.luna/{current-project}/deployment-report.md`
- Source code

## Execute

Run from any project directory:

```bash
claude-code --agent ~/.claude/agents/luna-documentation.md
```

When prompted:
- Press **ENTER** for project-level documentation
- Type **feature-name** for feature-specific docs

## Output

Creates comprehensive documentation in current project's `docs/` directory:
- `docs/user-guide/` - End-user documentation
- `docs/developers/` - Developer documentation
- `docs/api/` - API reference
- `docs/operations/` - DevOps documentation

References Luna specifications from `.luna/{current-project}/` files.

## Next Step

Set up monitoring:
```bash
luna-monitor
```