# 🧪 Backend Test Cases & Integration Workflows

This document outlines backend API testing matrix and controller interaction flows.

---

## 🔄 Review Approval & Bonus Points Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant FE as Frontend App
    participant BE as Express Backend
    actor Admin
    participant AdminUI as Admin Dashboard

    Customer->>FE: Open Food Review Sheet after Order Completion
    Customer->>FE: Select Rating (e.g. 5 Stars), Tags, and Comment
    FE->>BE: POST /reviews (Status: "pending")
    BE-->>FE: Return Confirmation ("Submitted for Admin Approval")
    Admin->>AdminUI: Navigate to Rating & Reviews Tab
    AdminUI->>BE: GET /reviews/admin
    BE-->>AdminUI: Render Pending Reviews Table
    Admin->>AdminUI: Click "Approve Review"
    AdminUI->>BE: PUT /reviews/:id/approve
    BE-->>BE: Award +10 Bonus Reward Points to Customer Profile
    BE-->>AdminUI: Success Toast ("Review Approved & +10 Points Awarded!")
```

---

## 🧪 Test Cases Matrix

| Test ID | Category | Target Component | Input / Trigger | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BE-01** | Integration | `POST /orders` | Valid cart payload | Creates order record with `pending` status and returns HTTP 201. |
| **TC-BE-02** | Security | `PUT /reviews/:id/approve` | Unauthorized request without JWT | Returns HTTP 401 Unauthorized. |
