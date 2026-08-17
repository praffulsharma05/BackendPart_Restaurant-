# 🔍 Backend Code Review & Refactoring Log

This document highlights backend architecture standards, controller error handling, and SQL transaction safety.

---

## 🛠️ Audit Summary & Identified Code Smells

| Category | Initial Mistake / Anti-Pattern Found | Target Location | Refactored Senior Solution |
| :--- | :--- | :--- | :--- |
| **Unhandled Async Rejections** | Uncaught async error can crash the Express node process | `Backend/src/controllers/order.controller.ts` | Wrapped controllers in `try/catch` and passed errors to `next(error)` central error handling middleware. |
| **SQL Injection Risk** | String concatenation inside raw SQL queries | `Backend/src/services/` | Converted all raw database queries to parameterized SQL queries (`?` placeholders). |
