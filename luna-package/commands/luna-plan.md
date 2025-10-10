# Luna Plan Command

Break design into actionable implementation tasks.

## Usage

```bash
cd /path/to/your-project
luna-plan
```

## Prerequisites

- Design document must exist (run `luna-design` first)

## What Happens

1. Reads design.md
2. Breaks into logical phases
3. Creates detailed task breakdown
4. Orders by dependencies

## Output

- `.luna/{project}/implementation-plan.md` - Task breakdown

## Next Step

```bash
luna-execute
```
