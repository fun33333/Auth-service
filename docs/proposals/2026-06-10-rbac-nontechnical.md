# Role-Based Access Control — Business Proposal

**Prepared by:** Engineering Team  
**Date:** June 10, 2026  
**Audience:** Project Managers, Business Stakeholders, Team Leads  
**Status:** Awaiting Approval

---

## Executive Summary

Today, any employee who has access to the HR Management System can perform any action — create employees, modify departments, grant access to other systems, and more. There is no way to limit what a specific person can do within their role. This proposal introduces a **Role-Based Access Control (RBAC)** system that allows administrators to define job-specific roles (e.g., "HR Manager", "Branch Admin"), assign them to employees, and fine-tune individual permissions — all without requiring any software deployment or developer involvement.

---

## The Problem

### 1. No Control Over Who Can Do What

Currently, once an employee is given access to the system, they can perform every action available: adding employees, editing records, granting access to other services, creating departments, and more. There is no distinction between an HR assistant and an HR manager. **Everyone has full access.**

This is a security and compliance risk. If a junior employee's account is compromised, an attacker has full system access.

### 2. Adding Roles Requires a Developer

Today's system has roles for HDMS (Help Desk) and VMS (Visitor Management) — but these roles are **hardcoded into the software**. Every time a new service is added and needs roles, an engineer must write code, test it, and deploy a new version. This is slow, expensive, and creates a dependency on the engineering team for what should be a simple admin task.

### 3. No Record of Who Has What Role

There is no consolidated view of which employees have which roles and when those roles were assigned or changed. Auditing "who could access what, on which date" is not straightforward.

---

## Proposed Solution

We propose building a flexible, admin-managed permission system with three simple concepts:

### Permissions — Individual Actions
A permission is a single named action. Examples:
- "Create Employee"
- "Edit Employee"
- "Delete Employee"
- "Create Department"
- "Grant System Access to Others"

These are defined once by the engineering team and never need to change unless a genuinely new capability is added to the system.

### Roles — Bundles of Permissions
A role is a named group of permissions. Examples:

| Role | Permissions Included |
|------|----------------------|
| HR Manager | Create Employee, Edit Employee, Delete Employee, Grant System Access |
| HR Assistant | Create Employee, Edit Employee |
| Branch Admin | Create Department, Create Branch, Edit Branch |
| Read-Only Viewer | View Employees only |

Administrators create and modify roles directly from the Services page — **no developer needed.**

### Individual Overrides — Fine-Tuning Per Person
Sometimes one specific person needs more (or less) than their role provides. Examples:
- Ali is an HR Assistant, but also needs "Create Department" permission → add it just for Ali
- Fatima is an HR Manager, but should NOT be able to delete employees → block that permission for Fatima only

**Effective access = Role permissions + individual additions − individual blocks**

---

## How Administrators Will Use This

All management happens from the existing **Services page** in the application — no new screens to learn:

1. **Create a Role** → Go to Services → Auth tab → Roles → "New Role" → give it a name, tick the permissions it should have → Save
2. **Assign a Role to an Employee** → Find the employee in the Services page → Assign Role → Select role → Save
3. **Add/Remove Individual Permission** → Find the employee → Permissions tab → Add or block a specific permission

No code. No deployments. Done in minutes.

---

## Benefits

| Benefit | Detail |
|---------|--------|
| **Security** | Employees can only do what their job requires — nothing more |
| **Self-Service** | Admins manage roles day-to-day without engineering support |
| **Scalability** | When a new service is added, its roles are created as data, not code |
| **Compliance** | Full audit trail: who was granted what role, by whom, on which date |
| **Flexibility** | Individual overrides handle exceptions without changing the whole role |

---

## What Is NOT Changing

- HDMS (Help Desk) and VMS (Visitor Management) roles remain exactly as they are today — this proposal only affects the HR Management System (Auth-service) in this phase
- Employee data, the org hierarchy (branches, departments, designations), and the login flow are unchanged
- Existing employees will continue to work as normal during rollout

---

## Effort and Timeline

| Phase | Scope | Estimated Duration |
|-------|-------|--------------------|
| **MVP (this proposal)** | Backend permission engine + Services page update (Auth-service only) | ~2–3 weeks |
| **Phase 2 (future)** | Migrate HDMS/VMS roles into the same system; scoped permissions per branch | ~2–3 weeks |

---

## Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| Existing users lose access during migration | No existing data is changed in MVP — new system is additive only |
| Admin assigns wrong role to employee | Audit log records every change; roles can be reassigned immediately |
| Performance (checking permissions on every action) | Permission results are cached — no noticeable impact on response times |

---

## Recommendation

Approve MVP scope. Begin Phase 2 planning after MVP is stable in production.

**Approval requested from:** Project Manager, Technical Lead

---

*Document prepared by Engineering Team — June 10, 2026*
