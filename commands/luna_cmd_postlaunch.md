# Luna: Post-Launch Review

Analyze launch metrics and provide recommendations for improvement.

## Usage

This command will:
1. Collect metrics from first 7 days of current project
2. Review incidents and issues
3. Analyze user feedback and adoption
4. Compare against original requirements
5. Generate post-launch-review.md

## Prerequisites

Requires in current project:
- `.luna/{current-project}/deployment-report.md`
- `.luna/{current-project}/monitoring-observability-report.md`
- `.luna/{current-project}/test-validation-report.md`
- `.luna/{current-project}/requirements.md`
- 7 days of production data

**Important**: Run this **7 days after launch** for meaningful metrics.

## Execute

Run from any project directory:

```bash
claude-code --agent ~/.claude/agents/luna-post-launch-review.md
```

When prompted:
- Press **ENTER** for project-level review
- Type **feature-name** for feature-specific review

## Output

Creates in current project:
- `.luna/{current-project}/post-launch-review.md` (project-level)
- `.luna/{current-project}/{feature}/post-launch-review.md` (feature-level)

Includes:
- Launch objectives review
- Performance metrics analysis
- User adoption metrics
- Incident summary
- What went well / could improve
- Lessons learned
- Actionable recommendations
- Success metrics for next 30 days

## Continuous Improvement

Schedule regular reviews:
- Week 2-4: Run this command again
- Monthly: Track progress against recommendations
- Quarterly: Major feature reviews