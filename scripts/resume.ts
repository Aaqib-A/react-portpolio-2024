// `npm run -s resume`: prints the portfolio as a JSON Resume, the same object served at /resume.json.
// Save it with `npm run -s resume > resume.json`.

import { resumeJson } from '../src/lib/resume.ts'

process.stdout.write(resumeJson() + '\n')
