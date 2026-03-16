# App UX Guardrails

## Strict Defaults

- The default user experience for Liberty Church must be plain-language, warm, and easy for non-technical church users to understand.
- Member-facing screens should avoid technical wording, system jargon, schema terms, or raw implementation language.
- If a feature needs file input, the default pattern is a clean upload card with a clear call to action such as `Browse Files`.
- Raw URL inputs are not the default upload experience.
- URL fields are only allowed as optional secondary inputs when the feature truly needs them, such as a YouTube lesson video.
- Upload UI should feel polished, mobile-friendly, and easy to understand at a glance.
- Smaller mobile layouts should keep the same clarity while using tighter spacing and a shorter card height.

## Curriculum UX Rule

- Curriculum tools must help everyday ministry workers quickly understand what has been taught and what is next.
- The visible language should prefer phrases like:
  - `Upload Lesson Material`
  - `Add Video Link (Optional)`
  - `Last taught`
  - `Up next`
  - `Already taught`
  - `Not taught yet`
  - `Mark this lesson as taught`
  - `Notes for the next teacher`
- Do not expose database-style labels such as `file_url`, `curriculum_id`, `progress_log`, or `module_key` in visible UI.
- The pastor should be able to review curriculum history and current teaching flow in clear language for doctrinal oversight.

## Product Rule

- Backend structure can be technical.
- Frontend experience must feel simple, calm, and obvious.
- This standard applies across the app, especially in member and ministry workflows.
