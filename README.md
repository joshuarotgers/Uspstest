# USPS LOT NAV V11 — National Deployment Package

✅ **Version:** V11 (Secure National USPS Build)
✅ **Last Updated:** June 2025

---

## 📦 System Overview

- ✅ National USPS LOT Tracking Platform
- ✅ Fully MDM compatible
- ✅ Full Disaster Recovery
- ✅ District Admin, HQ Admin, Supervisor & Carrier Access
- ✅ Dockerized for USPS private cloud or on-prem

---

## 🚀 Deployment Prerequisites

- ✅ Ubuntu 22+ or RHEL server (GovCloud or USPS Datacenter)
- ✅ Docker & Docker Compose installed
- ✅ Encrypted secure filesystem mounted for JWT Secret

---

## 🔧 System Folder Structure

```bash
/server/
  package.json, index.js, models/, uploads/, scripts/
  
/client-admin/
  index.html, main.js, styles.css
  
/client-carrier/
  index.html, main.js, styles.css
  
/client-reporting/
  index.html, main.js, styles.css
  
/docker-compose.yml
