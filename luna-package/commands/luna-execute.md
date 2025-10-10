# Luna Execute Command

Implement tasks from the implementation plan.

## Usage

```bash
cd /path/to/your-project
luna-execute
```

## Prerequisites

- Implementation plan must exist (run `luna-plan` first)

## What Happens

1. Reads implementation-plan.md
2. Finds next uncompleted task
3. Implements code following design
4. Writes tests
5. Marks task complete
6. Moves to next task

## Output

- Implemented code in source files
- Updated implementation-plan.md with [x] markers

## Next Step

```bash
luna-review
```
