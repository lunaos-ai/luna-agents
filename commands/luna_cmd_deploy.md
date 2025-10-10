# Luna: Deployment

Deploy application to staging and production environments.

## Usage

This command will:
1. Verify deployment readiness
2. Configure infrastructure
3. Deploy to staging
4. Run smoke tests
5. Deploy to production
6. Generate deployment-report.md

## Prerequisites

Requires in current project:
- `.luna/{current-project}/implementation-plan.md`
- `.luna/{current-project}/code-review-report.md`
- `.luna/{current-project}/test-validation-report.md`
- `.luna/{current-project}/design.md`
- All tests passing

## Execute

Run from any project directory:

```bash
claude-code --agent ~/.claude/agents/luna-deployment.md
```

When prompted:
- Press **ENTER** for project-level deployment
- Type **feature-name** to match your implementation scope

## Output

Creates in current project:
- `.luna/{current-project}/deployment-report.md` (project-level)
- `.luna/{current-project}/{feature}/deployment-report.md` (feature-level)

Includes:
- Deployment timeline
- Environment configuration
- Health check results
- Performance validation
- Rollback plan
- Access credentials

## Next Step

After deployment, create documentation:
```bash
luna-docs
```