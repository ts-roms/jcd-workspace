# Roles and Permissions Documentation

Generated on: 2/23/2026, 9:37:44 AM

---

## Table of Contents

1. [Roles Overview](#roles-overview)
2. [Roles Details](#roles-details)
3. [Permissions by Category](#permissions-by-category)
4. [Permission Matrix](#permission-matrix)

---

## Roles Overview

| Role | Display Name | Hierarchy | System Role | Permissions Count |
|------|--------------|-----------|-------------|-------------------|
| admin | Administrator | 1 | Yes | 0 |
| super admin | Super Admin | 1 | Yes | 24 |
| president | President | 2 | Yes | 0 |
| vp-acad | VP Academic Affairs | 3 | Yes | 0 |
| dean | Dean | 4 | No | 7 |
| hr | Human Resources | 5 | No | 0 |
| teaching | Teaching | 6 | No | 0 |
| non-teaching | Non-Teaching | 7 | No | 0 |
| student | Student | 8 | No | 0 |
| super | Super Administrator | N/A | Yes | 24 |

---

## Roles Details

### Administrator (`admin`)

**Description:** System administrator with elevated permissions

**Hierarchy Level:** 1

**System Role:** Yes

**Permissions:** None assigned

---

### Super Admin (`super admin`)

**Description:** Full system access with all permissions

**Hierarchy Level:** 1

**System Role:** Yes

**Permissions (24):**

#### Analytics

- **View Analytics** (`analytics.view`)
  - View analytics and reports
- **Export Analytics** (`analytics.export`)
  - Export analytics data

#### Evaluation Forms

- **Read Evaluation Forms** (`evaluation-forms.read`)
  - View evaluation forms
- **Manage Evaluation Forms** (`evaluation-forms.manage`)
  - Create and update evaluation forms

#### Permission Management

- **Read Permissions** (`permissions.read`)
  - View permissions
- **Manage Permissions** (`permissions.manage`)
  - Manage system permissions

#### Project Management

- **Create Projects** (`projects.create`)
  - Create new projects
- **Read Projects** (`projects.read`)
  - View project information
- **Update Projects** (`projects.update`)
  - Update project information
- **Delete Projects** (`projects.delete`)
  - Delete projects

#### Role Management

- **Create Roles** (`roles.create`)
  - Create new roles
- **Read Roles** (`roles.read`)
  - View role information
- **Update Roles** (`roles.update`)
  - Update role information
- **Delete Roles** (`roles.delete`)
  - Delete roles

#### Settings Management

- **View Settings** (`settings.view`)
  - View application settings
- **Manage Settings** (`settings.manage`)
  - Manage application settings

#### Subject Management

- **Create Subjects** (`subjects.create`)
  - Create new subjects
- **Read Subjects** (`subjects.read`)
  - View subject information
- **Update Subjects** (`subjects.update`)
  - Update subject information
- **Delete Subjects** (`subjects.delete`)
  - Delete subjects

#### User Management

- **Create Users** (`users.create`)
  - Create new users
- **Read Users** (`users.read`)
  - View user information
- **Update Users** (`users.update`)
  - Update user information
- **Delete Users** (`users.delete`)
  - Delete users

---

### President (`president`)

**Description:** University president with full administrative authority

**Hierarchy Level:** 2

**System Role:** Yes

**Permissions:** None assigned

---

### VP Academic Affairs (`vp-acad`)

**Description:** Vice President for Academic Affairs

**Hierarchy Level:** 3

**System Role:** Yes

**Permissions:** None assigned

---

### Dean (`dean`)

**Description:** College dean with department management permissions

**Hierarchy Level:** 4

**System Role:** No

**Permissions (7):**

#### Subject Management

- **Create Subjects** (`subjects.create`)
  - Create new subjects
- **Update Subjects** (`subjects.update`)
  - Update subject information
- **Delete Subjects** (`subjects.delete`)
  - Delete subjects
- **Read Subjects** (`subjects.read`)
  - View subject information

#### User Management

- **Create Users** (`users.create`)
  - Create new users
- **Delete Users** (`users.delete`)
  - Delete users
- **Update Users** (`users.update`)
  - Update user information

---

### Human Resources (`hr`)

**Description:** Human Resources personnel

**Hierarchy Level:** 5

**System Role:** No

**Permissions:** None assigned

---

### Teaching (`teaching`)

**Description:** Teaching faculty member

**Hierarchy Level:** 6

**System Role:** No

**Permissions:** None assigned

---

### Non-Teaching (`non-teaching`)

**Description:** Non-teaching staff member

**Hierarchy Level:** 7

**System Role:** No

**Permissions:** None assigned

---

### Student (`student`)

**Description:** Student evaluator

**Hierarchy Level:** 8

**System Role:** No

**Permissions:** None assigned

---

### Super Administrator (`super`)

**Description:** Full system access with all permissions

**Hierarchy Level:** Not specified

**System Role:** Yes

**Permissions (24):**

#### Analytics

- **View Analytics** (`analytics.view`)
  - View analytics and reports
- **Export Analytics** (`analytics.export`)
  - Export analytics data

#### Evaluation Forms

- **Read Evaluation Forms** (`evaluation-forms.read`)
  - View evaluation forms
- **Manage Evaluation Forms** (`evaluation-forms.manage`)
  - Create and update evaluation forms

#### Permission Management

- **Read Permissions** (`permissions.read`)
  - View permissions
- **Manage Permissions** (`permissions.manage`)
  - Manage system permissions

#### Project Management

- **Create Projects** (`projects.create`)
  - Create new projects
- **Read Projects** (`projects.read`)
  - View project information
- **Update Projects** (`projects.update`)
  - Update project information
- **Delete Projects** (`projects.delete`)
  - Delete projects

#### Role Management

- **Create Roles** (`roles.create`)
  - Create new roles
- **Read Roles** (`roles.read`)
  - View role information
- **Update Roles** (`roles.update`)
  - Update role information
- **Delete Roles** (`roles.delete`)
  - Delete roles

#### Settings Management

- **View Settings** (`settings.view`)
  - View application settings
- **Manage Settings** (`settings.manage`)
  - Manage application settings

#### Subject Management

- **Create Subjects** (`subjects.create`)
  - Create new subjects
- **Read Subjects** (`subjects.read`)
  - View subject information
- **Update Subjects** (`subjects.update`)
  - Update subject information
- **Delete Subjects** (`subjects.delete`)
  - Delete subjects

#### User Management

- **Create Users** (`users.create`)
  - Create new users
- **Read Users** (`users.read`)
  - View user information
- **Update Users** (`users.update`)
  - Update user information
- **Delete Users** (`users.delete`)
  - Delete users

---

## Permissions by Category

### Analytics

| Permission Name | Display Name | Description | Resource | Action |
|----------------|--------------|-------------|----------|--------|
| `analytics.export` | Export Analytics | Export analytics data | analytics | export |
| `analytics.view` | View Analytics | View analytics and reports | analytics | view |

### Evaluation Forms

| Permission Name | Display Name | Description | Resource | Action |
|----------------|--------------|-------------|----------|--------|
| `evaluation-forms.manage` | Manage Evaluation Forms | Create and update evaluation forms | evaluation-forms | manage |
| `evaluation-forms.read` | Read Evaluation Forms | View evaluation forms | evaluation-forms | read |

### Permission Management

| Permission Name | Display Name | Description | Resource | Action |
|----------------|--------------|-------------|----------|--------|
| `permissions.manage` | Manage Permissions | Manage system permissions | permissions | manage |
| `permissions.read` | Read Permissions | View permissions | permissions | read |

### Project Management

| Permission Name | Display Name | Description | Resource | Action |
|----------------|--------------|-------------|----------|--------|
| `projects.create` | Create Projects | Create new projects | projects | create |
| `projects.delete` | Delete Projects | Delete projects | projects | delete |
| `projects.read` | Read Projects | View project information | projects | read |
| `projects.update` | Update Projects | Update project information | projects | update |

### Role Management

| Permission Name | Display Name | Description | Resource | Action |
|----------------|--------------|-------------|----------|--------|
| `roles.create` | Create Roles | Create new roles | roles | create |
| `roles.delete` | Delete Roles | Delete roles | roles | delete |
| `roles.read` | Read Roles | View role information | roles | read |
| `roles.update` | Update Roles | Update role information | roles | update |

### Settings Management

| Permission Name | Display Name | Description | Resource | Action |
|----------------|--------------|-------------|----------|--------|
| `settings.manage` | Manage Settings | Manage application settings | settings | manage |
| `settings.view` | View Settings | View application settings | settings | view |

### Subject Management

| Permission Name | Display Name | Description | Resource | Action |
|----------------|--------------|-------------|----------|--------|
| `subjects.create` | Create Subjects | Create new subjects | subjects | create |
| `subjects.delete` | Delete Subjects | Delete subjects | subjects | delete |
| `subjects.read` | Read Subjects | View subject information | subjects | read |
| `subjects.update` | Update Subjects | Update subject information | subjects | update |

### User Management

| Permission Name | Display Name | Description | Resource | Action |
|----------------|--------------|-------------|----------|--------|
| `users.create` | Create Users | Create new users | users | create |
| `users.delete` | Delete Users | Delete users | users | delete |
| `users.read` | Read Users | View user information | users | read |
| `users.update` | Update Users | Update user information | users | update |

---

## Permission Matrix

This matrix shows which roles have which permissions.

| Permission | Administrator | Super Admin | President | VP Academic Affairs | Dean | Human Resources | Teaching | Non-Teaching | Student | Super Administrator |
|------------|---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|
| **Export Analytics**<br/>`analytics.export` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **View Analytics**<br/>`analytics.view` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Manage Evaluation Forms**<br/>`evaluation-forms.manage` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Read Evaluation Forms**<br/>`evaluation-forms.read` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Manage Permissions**<br/>`permissions.manage` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Read Permissions**<br/>`permissions.read` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Create Projects**<br/>`projects.create` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Delete Projects**<br/>`projects.delete` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Read Projects**<br/>`projects.read` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Update Projects**<br/>`projects.update` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Create Roles**<br/>`roles.create` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Delete Roles**<br/>`roles.delete` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Read Roles**<br/>`roles.read` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Update Roles**<br/>`roles.update` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Manage Settings**<br/>`settings.manage` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **View Settings**<br/>`settings.view` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Create Subjects**<br/>`subjects.create` | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Delete Subjects**<br/>`subjects.delete` | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Read Subjects**<br/>`subjects.read` | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Update Subjects**<br/>`subjects.update` | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Create Users**<br/>`users.create` | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Delete Users**<br/>`users.delete` | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Read Users**<br/>`users.read` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Update Users**<br/>`users.update` | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Legend

- ✅ = Role has this permission
- ❌ = Role does not have this permission
- **System Role** = Cannot be deleted or modified by regular administrators
- **Hierarchy Level** = Lower numbers indicate higher authority (0 is highest)

