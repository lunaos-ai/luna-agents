# Luna: Testing & Validation

Create comprehensive test suites and validate against requirements.

## Usage

This command will:
1. Create missing test cases in current project
2. Run all test suites (unit, integration, E2E)
3. Validate acceptance criteria
4. Check code coverage
5. Generate test-validation-report.md

## Prerequisites

Requires in current project:
- `.luna/{current-project}/requirements.md`
- `.luna/{current-project}/design.md`
- `.luna/{current-project}/implementation-plan.md`
- `.luna/{current-project}/code-review-report.md`
- Implemented source code

## Execute

Run from any project directory:

```bash
claude-code --agent ~/.claude/agents/luna-testing-validation.md
```

When prompted:
- Press **ENTER** for project-level testing
- Type **feature-name** to match your implementation scope

## Output

Creates in current project:
- `.luna/{current-project}/test-validation-report.md` (project-level)
- `.luna/{current-project}/{feature}/test-validation-report.md` (feature-level)

Includes:
- Test coverage summary
- Requirements validation matrix
- Failed/passed tests breakdown
- Performance test results
- Security scan results
- Go/No-Go recommendation

## Next Step

After all tests pass, deploy:
```bash
luna-deploy
```