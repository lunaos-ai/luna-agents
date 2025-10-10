# Luna: Monitoring & Observability

Set up comprehensive monitoring, dashboards, and alerts.

## Usage

This command will:
1. Configure monitoring tools (Sentry, CloudWatch) for current project
2. Create dashboards (health, performance, business)
3. Set up alerts (critical, warning, info)
4. Configure log aggregation
5. Generate monitoring-observability-report.md

## Prerequisites

Requires in current project:
- `.luna/{current-project}/deployment-report.md`
- `.luna/{current-project}/design.md`
- `.luna/{current-project}/requirements.md`
- Production application running

## Execute

Run from any project directory:

```bash
claude-code --agent ~/.claude/agents/luna-monitoring-observability.md
```

When prompted:
- Press **ENTER** for project-level monitoring
- Type **feature-name** for feature-specific monitoring

## Output

Creates in current project:
- `.luna/{current-project}/monitoring-observability-report.md` (project-level)
- `.luna/{current-project}/{feature}/monitoring-observability-report.md` (feature-level)

Includes:
- Monitoring tools configuration
- Dashboard URLs
- Alert configurations
- Current system health
- SLO/SLA status
- Recommendations

## Next Step

After 7 days in production, run post-launch review:
```bash
luna-review-launch
```