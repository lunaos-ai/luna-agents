# Luna Commands - Enhanced with GLM Vision Integration

## Core Commands

### /luna-test
Enhanced with GUI testing capabilities using GLM Vision.

**Basic Usage:**
```bash
/luna-test                          # Run standard tests
/luna-test --type=gui              # Run GUI tests with GLM Vision
/luna-test --type=visual-regression # Run visual regression tests
/luna-test --type=accessibility     # Run accessibility tests
```

**GUI Testing Examples:**
```bash
/luna-test --type=gui --scenario=login-flow
/luna-test --type=gui --element=submit-button --action=click
/luna-test --type=gui --workflow=user-registration
```

**Visual Regression Examples:**
```bash
/luna-test --type=visual-regression --baseline=./screenshots/baseline/
/luna-test --type=visual-regression --threshold=0.05 --generate-diff
```

### /luna-review
Enhanced with UI analysis capabilities.

**Standard Review:**
```bash
/luna-review                        # Standard code review
/luna-review --include-ui           # Include UI analysis
/luna-review --screenshot=./current-ui.png
```

**UI-Focused Review:**
```bash
/luna-review --focus=ui --accessibility-check
/luna-review --design-system-validation
/luna-review --responsive-design-check
```

### /luna-deploy
Enhanced with pre-deployment GUI testing.

**Standard Deployment:**
```bash
/luna-deploy                        # Standard deployment
/luna-deploy --pre-deploy-tests=gui # Run GUI tests before deploy
```

**Safe Deployment with UI Validation:**
```bash
/luna-deploy --ui-test-suite=smoke --fail-on-ui-errors
/luna-deploy --visual-regression-check --rollback-on-failure
```

## GLM Vision Specific Commands

### Quick Start Commands
```bash
/luna-glm-setup                     # Initial setup
/luna-glm-capture                   # Quick screenshot
/luna-glm-test login-flow          # Test common workflow
/luna-glm-report                   # Generate report
```

### Advanced Testing Commands
```bash
/luna-glm-click "Submit button"    # Element interaction
/luna-glm-type "user@example.com"  # Text input
/luna-glm-analyze accessibility    # Accessibility analysis
/luna-glm-compare before.png after.png  # Visual regression
```

## Command Combinations

### Complete UI Testing Workflow
```bash
# 1. Setup and baseline
/luna-glm-setup
/luna-glm-capture --baseline

# 2. Run comprehensive tests
/luna-test --type=gui --scenario=full-user-journey
/luna-test --type=accessibility --standard=wcag-aa

# 3. Visual regression
/luna-glm-compare baseline.png current.png --threshold=0.1

# 4. Generate reports
/luna-glm-report --format=html --include-screenshots
```

### Development Workflow with UI Testing
```bash
# 1. Code review with UI analysis
/luna-review --include-ui --accessibility-check

# 2. Run tests before commit
/luna-test --type=gui --quick

# 3. Deploy with UI validation
/luna-deploy --pre-deploy-tests=gui --visual-regression-check
```

### CI/CD Integration Examples

**GitHub Actions with GLM Vision:**
```yaml
- name: Setup GLM Vision
  run: /luna-glm-setup

- name: Run GUI Tests
  run: /luna-test --type=gui --format=junit --output=test-results.xml

- name: Visual Regression
  run: /luna-glm-compare baseline.png current.png --fail-on-diff
```

**Jenkins Pipeline with GLM Vision:**
```groovy
stage('UI Testing') {
    steps {
        sh '/luna-glm-setup'
        sh '/luna-test --type=gui --scenario=smoke-tests'
        sh '/luna-glm-analyze accessibility --strict'
    }
}
```

## Configuration Management

### Project-Specific Configuration
Create `.luna/config.json`:
```json
{
  "glm_vision": {
    "enabled": true,
    "api_key": "${GLM_API_KEY}",
    "test_scenarios": ["login-flow", "navigation", "form-validation"],
    "accessibility_standards": ["wcag-aa"],
    "visual_regression": {
      "threshold": 0.1,
      "auto_baseline": true
    }
  },
  "testing": {
    "include_gui_tests": true,
    "pre_deploy_gui_validation": true
  }
}
```

### Environment-Specific Settings
```bash
# Development
export GLM_TEST_MODE=development
export GLM_SCREENSHOT_QUALITY=80

# Staging
export GLM_TEST_MODE=staging
export GLM_VISUAL_REGRESSION=true

# Production
export GLM_TEST_MODE=production
export GLM_ACCESSIBILITY_STRICT=true
```

## Error Handling and Troubleshooting

### Common Command Errors
```bash
# API key issues
/luna-glm-setup --check-api

# Screenshot permissions
/luna-glm-setup --check-permissions

# Element detection issues
/luna-glm-test --debug-mode --verbose-logging
```

### Recovery Commands
```bash
/luna-glm-setup --reset-configuration
/luna-glm-capture --test-capture
/luna-test --dry-run --validate-workflow
```

## Performance Optimization

### Fast Testing Mode
```bash
/luna-test --type=gui --fast-mode --reduced-screenshots
/luna-glm-analyze --quick-scan --low-resolution
```

### Batch Testing
```bash
/luna-test --batch --scenarios=all --parallel=4
/luna-glm-compare --batch ./baseline/ ./current/
```

## Integration with External Tools

### Design System Integration
```bash
/luna-glm-validate design-system --rules=./design-system.json
/luna-review --design-system-compliance
```

### Analytics Integration
```bash
/luna-test --type=gui --track-metrics --send-to-analytics
/luna-glm-report --include-performance-metrics
```

### A/B Testing Support
```bash
/luna-glm-test --variant=A --baseline=variant-a.png
/luna-glm-test --variant=B --baseline=variant-b.png
/luna-glm-compare variant-a.png variant-b.png --report=ab-test
```

## Advanced Usage Patterns

### Custom Test Workflows
```bash
/luna-test --workflow=./custom-workflow.json
/luna-glm-test --interactive --step-by-step
```

### Continuous Monitoring
```bash
/luna-glm-monitor --schedule=hourly --threshold=0.05
/luna-test --type=visual-regression --watch=./screenshots/
```

### Multi-Platform Testing
```bash
/luna-test --platform=web,browser=chrome
/luna-test --platform=mobile,device=iphone
/luna-test --platform=desktop,os=macos
```