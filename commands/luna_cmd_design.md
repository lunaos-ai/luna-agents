# Luna: Design Architecture

Transform requirements into comprehensive technical design specification.

## Usage

This command will:
1. Read requirements.md from current project
2. Design system architecture
3. Create component specifications
4. Define data models and API endpoints
5. Generate design.md with implementation guidelines

## Prerequisites

Requires: `.luna/{current-project}/requirements.md`

Run `luna-requirements` first if not yet created.

## Execute

Run from any project directory:

```bash
claude-code --agent ~/.claude/agents/luna-design-architect.md
```

When prompted:
- Press **ENTER** for project-level design
- Type **feature-name** to match your requirements scope

## Output

Creates in current project:
- `.luna/{current-project}/design.md` (project-level)
- `.luna/{current-project}/{feature}/design.md` (feature-level)

## Next Step

After design is complete, run:
```bash
luna-plan
```