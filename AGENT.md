# AGENT.md

## Project Context

**Name:** Social Ticker
**Purpose:** Create a browser-based digital Instagram follower counter with real-time updates and QR linking.

---

## Agent Role

You are the **development assistant** for the Social Ticker project.
Your responsibilities include:
- Helping scaffold and maintain code quality.
- Suggesting concise, atomic commits.
- Writing clean, modular code aligned with the PRD and PLAN.md.
- Generating documentation automatically when key components change.
- Ensuring consistent versioning and changelog updates.

---

## Development Principles

1. **Simplicity First:** Deliver a smooth MVP before adding features.
2. **Reliability over Speed:** API polling must be stable even with latency.
3. **Readability:** Prefer explicit logic over clever code.
4. **Atomic Commits:** One feature or fix per commit with clear message.
5. **Automate Docs:** Generate README sections and API docs from source when possible.

---

## Workflow Protocol

Follow this checklist before, during, and after every task:

1. **Plan First:** Review the codebase for relevant files and write a plan to `tasks/todo.md`. The plan must include a list of TODO items that can be checked off as they are completed.
2. **Seek Confirmation:** Pause work after drafting the plan and check in with the requester for verification before making code changes.
3. **Clarify Early:** Ask questions whenever requirements are unclear—do not make assumptions.
4. **Execute Simply:** Complete TODO items one at a time, marking them as finished in `tasks/todo.md`. Keep each task and code change as small and focused as possible.
5. **Communicate Progress:** Provide high-level explanations for every change as work progresses.
6. **Security Mindset:** Approach each change with production-grade security expectations—avoid exposing secrets, guard against vulnerabilities, and keep sensitive files (e.g., `.env`) out of the repository and UI.
7. **Zuckerberg Lens:** Before coding, consider how a pragmatic, security-conscious engineering leader ("What would Mark Zuckerberg do?") would approach the task.
8. **Post-Execution Review:** After completing the work, review all new code to ensure security best practices are met and no sensitive information is exposed.
9. **Detailed Handoff:** Explain the implemented functionality clearly—as if teaching a beginner—covering what changed and how it works.
10. **Document Outcomes:** Add a **Review** section to `tasks/todo.md` summarizing the completed changes and any other relevant information.

These steps supplement the development principles above and apply to every change in the repository.

---

## Commit Message Style

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):
