# Luna GLM Vision Commands

## /luna-glm-setup
Initialize the GLM Vision agent with your GLM API configuration and testing environment.

**Usage:** `/luna-glm-setup`

**Description:**
- Interactive setup for GLM API key and base URL
- Validate GLM API connection
- Configure screenshot and testing preferences
- Set up reporting directories

**Example:**
```
/luna-glm-setup
```

## /luna-glm-capture
Capture and analyze current screen or specific UI area using GLM-4.5V.

**Usage:** `/luna-glm-capture [options]`

**Options:**
- `--area=x,y,width,height` - Capture specific area
- `--quality=90` - Screenshot quality (1-100)
- `--no-analyze` - Skip GLM analysis

**Examples:**
```
/luna-glm-capture
/luna-glm-capture --area=100,200,400,300
/luna-glm-capture --quality=95 --no-analyze
```

## /luna-glm-test
Run comprehensive UI testing scenarios with automated interactions.

**Usage:** `/luna-glm-test <scenario> [options]`

**Scenarios:**
- `login-flow` - Test user login functionality
- `form-validation` - Test form input validation
- `navigation` - Test navigation and routing
- `responsive` - Test responsive design
- `custom` - Custom test workflow

**Options:**
- `--steps=number` - Number of test steps
- `--report=format` - Report format (html/json/markdown)
- `--output=path` - Custom output path

**Examples:**
```
/luna-glm-test login-flow
/luna-glm-test form-validation --report=html
/luna-glm-test custom --steps=10 --output=./my-test-report.html
```

## /luna-glm-click
Click on UI elements based on visual analysis and description.

**Usage:** `/luna-glm-click <element_description> [options]`

**Options:**
- `--area=x,y,width,height` - Search in specific area
- `--confidence=0.7` - Minimum confidence threshold

**Examples:**
```
/luna-glm-click "Submit button"
/luna-glm-click "Login form" --area=100,100,600,400
/luna-glm-click "Menu item Settings" --confidence=0.8
```

## /luna-glm-type
Type text into UI elements using keyboard automation.

**Usage:** `/luna-glm-type <text> [options]`

**Options:**
- `--element=description` - Target element description
- `--clear` - Clear field before typing

**Examples:**
```
/luna-glm-type "hello@example.com"
/luna-glm-type "password123" --element="Password field"
/luna-glm-type "New text" --clear
```

## /luna-glm-swipe
Perform swipe gestures for mobile testing or scrolling.

**Usage:** `/luna-glm-swipe <start_x> <start_y> <end_x> <end_y> [options]`

**Options:**
- `--duration=500` - Gesture duration in milliseconds

**Examples:**
```
/luna-glm-swipe 100 500 100 100
/luna-glm-swipe 50 300 350 300 --duration=800
```

## /luna-glm-analyze
Analyze UI for specific issues or characteristics.

**Usage:** `/luna-glm-analyze <type> [options]`

**Types:**
- `layout` - Analyze layout structure and spacing
- `elements` - Identify all UI elements
- `accessibility` - Check accessibility compliance
- `regression` - Look for visual regressions

**Options:**
- `--image=path` - Analyze specific screenshot
- `--context=text` - Additional analysis context

**Examples:**
```
/luna-glm-analyze layout
/luna-glm-analyze accessibility --context="mobile view"
/luna-glm-analyze regression --image=./screenshot.png
```

## /luna-glm-compare
Compare two screenshots for visual regression testing.

**Usage:** `/luna-glm-compare <baseline_image> <current_image> [options]`

**Options:**
- `--threshold=0.1` - Difference threshold (0-1)
- `--diff` - Generate diff image
- `--report` - Generate comparison report

**Examples:**
```
/luna-glm-compare baseline.png current.png
/luna-glm-compare before.png after.png --threshold=0.05
/luna-glm-compare old.png new.png --diff --report
```

## /luna-glm-report
Generate comprehensive test reports from test results.

**Usage:** `/luna-glm-report [options]`

**Options:**
- `--format=html` - Report format (html/json/markdown)
- `--output=path` - Custom output path
- `--include-screenshots` - Include screenshots in report

**Examples:**
```
/luna-glm-report
/luna-glm-report --format=markdown --output=./report.md
/luna-glm-report --include-screenshots --format=html
```

## /luna-glm-validate
Validate UI against design specifications and requirements.

**Usage:** `/luna-glm-validate <specification_type> [options]`

**Types:**
- `design-system` - Validate against design system
- `accessibility` - WCAG compliance check
- `responsive` - Responsive design validation
- `custom` - Custom validation rules

**Options:**
- `--rules=path` - Custom validation rules file
- `--strict` - Enable strict validation mode

**Examples:**
```
/luna-glm-validate design-system
/luna-glm-validate accessibility --strict
/luna-glm-validate custom --rules=./my-rules.json
```

## Integration with Existing Luna Commands

### Enhanced /luna-test
The existing `/luna-test` command now supports GUI testing with GLM Vision:

```
/luna-test --type=gui --scenario=login-flow
/luna-test --type=visual-regression --baseline=baseline.png
/luna-test --type=accessibility --standard=wcag
```

### Enhanced /luna-review
The `/luna-review` command can now include UI analysis:

```
/luna-review --include-ui --screenshot=./current-ui.png
/luna-review --ui-depth=full --accessibility-check
```

### Enhanced /luna-deploy
The `/luna-deploy` command can run automated UI tests before deployment:

```
/luna-deploy --pre-deploy-tests=gui
/luna-deploy --ui-test-suite=smoke --fail-on-ui-errors
```

## Configuration

### Environment Variables
Set these environment variables to configure GLM Vision:

```bash
export GLM_API_KEY="your_glm_api_key"
export GLM_BASE_URL="https://open.bigmodel.cn/api/paas/v4"
export GLM_MODEL="glm-4.5v"
export GLM_TEST_REPORTS_DIR="./test-reports"
export GLM_SCREENSHOT_QUALITY="90"
export GLM_THINKING_MODE="true"
```

### Configuration File
Create `.luna-glm-vision.json` in your project root:

```json
{
  "api": {
    "key": "${GLM_API_KEY}",
    "base_url": "${GLM_BASE_URL}",
    "model": "glm-4.5v",
    "timeout": 30000,
    "max_retries": 3
  },
  "testing": {
    "screenshot_quality": 90,
    "default_confidence": 0.7,
    "reports_dir": "./test-reports",
    "auto_generate_reports": true
  },
  "platforms": {
    "web": {
      "browsers": ["chrome", "firefox", "safari"],
      "viewports": ["desktop", "tablet", "mobile"]
    },
    "mobile": {
      "devices": ["ios", "android"],
      "orientations": ["portrait", "landscape"]
    }
  }
}
```

## Workflows

### 1. Basic UI Testing Workflow
```bash
# Setup
/luna-glm-setup

# Capture current UI
/luna-glm-capture

# Analyze elements
/luna-glm-analyze elements

# Test interactions
/luna-glm-click "Submit button"
/luna-glm-type "test@example.com" --element="Email field"

# Generate report
/luna-glm-report
```

### 2. Visual Regression Testing Workflow
```bash
# Capture baseline
/luna-glm-capture --baseline

# Make changes to your application

# Capture current state
/luna-glm-capture

# Compare with baseline
/luna-glm-compare baseline.png current.png --diff --report

# Run full regression test suite
/luna-glm-test visual-regression
```

### 3. Accessibility Testing Workflow
```bash
# Analyze accessibility
/luna-glm-analyze accessibility

# Validate against WCAG
/luna-glm-validate accessibility --strict

# Test keyboard navigation
/luna-glm-test accessibility --focus=keyboard-navigation

# Generate accessibility report
/luna-glm-report --format=html --include-accessibility
```

### 4. Mobile Testing Workflow
```bash
# Setup mobile testing
/luna-glm-setup --platform=mobile

# Test mobile gestures
/luna-glm-swipe 100 500 100 100 --duration=300

# Test responsive design
/luna-glm-test responsive --viewports=mobile,tablet

# Analyze mobile-specific elements
/luna-glm-analyze elements --context="mobile interface"
```

## Troubleshooting

### Common Issues
- **API Key Issues**: Ensure GLM_API_KEY is set correctly
- **Screenshot Problems**: Check permissions for screen capture
- **Click Accuracy**: Adjust confidence threshold for better element detection
- **Performance**: Use smaller areas for faster analysis

### Debug Mode
Enable verbose logging:
```bash
export GLM_DEBUG=true
/luna-glm-test debug --verbose
```

### Test Connection
Verify GLM API connectivity:
```bash
/luna-glm-setup --test-connection-only
```