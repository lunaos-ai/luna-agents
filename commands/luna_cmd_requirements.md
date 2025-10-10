# Luna: Requirements Analysis

Analyze the project codebase and generate comprehensive requirements document.

## Usage

This command will:
1. Prompt for project/feature scope
2. Scan project structure and codebase
3. Identify gaps and missing functionality
4. Generate requirements.md with acceptance criteria

## Execute

Run from any project directory:

```bash
claude-code --agent ~/.claude/agents/luna-requirements-analyzer.md
```

When prompted:
- Press **ENTER** for entire project analysis
- Type **feature-name** for specific feature (e.g., "user-authentication")

## Output

Creates in current project:
- `.luna/{current-project}/requirements.md` (project-level)
- `.luna/{current-project}/{feature}/requirements.md` (feature-level)

## Next Step

After requirements are generated, run:
```bash
luna-design
```