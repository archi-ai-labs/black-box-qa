---
name: add-project
description: Add a new project to the QA Dashboard for testing
---
# Skill: Add QA Project

Use this skill when the user asks you to register a new project in the dashboard.

## Execution Steps
1. Open `data/projects.json`.
2. Append a new object to the array:
   ```json
   {
     "id": "project-my-new-app",
     "name": "My New App",
     "description": "Description provided by user",
     "targetUrl": "URL provided by user",
     "type": "api"
   }
   ```
3. Create the data directory: `mkdir -p data/project-my-new-app`
4. Create an empty `results.json` in that directory:
   ```json
   {
     "lastUpdated": "",
     "summary": { "total": 0, "passed": 0, "failed": 0 },
     "mockServerStatus": "stopped",
     "runs": []
   }
   ```
5. Confirm to the user that the project has been added.
