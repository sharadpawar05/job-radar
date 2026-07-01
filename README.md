# 🎯 Job Radar

> Smart job scraping application with automated matching, notifications, and analytics dashboard.

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org)
[![EJS](https://img.shields.io/badge/EJS-B4CA65?style=for-the-badge&logo=ejs&logoColor=white)](https://ejs.co)

---

## ✨ Features

- 🔍 **Multi-source job scraping** from popular job boards
- 🎯 **Smart matching** based on skills, experience, and preferences
- 📧 **Email notifications** for new matching jobs
- 📊 **Analytics dashboard** with job market insights
- 🔄 **Automated scheduling** with cron jobs
- 💾 **SQLite storage** for offline access and history

---

## 🏗️ Architecture

```
job-radar/
├── adapters/          # Job board adapters (LinkedIn, Indeed, etc.)
├── matcher/           # Smart job matching engine
├── notifier/          # Email/notification service
├── storage/           # SQLite database layer
├── views/             # EJS templates for dashboard
├── public/            # Static assets (CSS, JS)
├── config.json        # Configuration
├── index.js           # Main entry point
├── server.js          # Express server
└── pipeline.js        # Job processing pipeline
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/sharadpawar05/job-radar.git
cd job-radar

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start the application
npm start
```

### Configuration

Edit `config.json` to customize:

```json
{
  "scrapeInterval": "0 */6 * * *",
  "emailNotifications": true,
  "matchingCriteria": {
    "skills": ["JavaScript", "React", "Node.js"],
    "experience": "senior",
    "location": "remote"
  }
}
```

---

## 📊 Dashboard

Access the dashboard at `http://localhost:3000` to:

- View scraped jobs
- Track application status
- See analytics and trends
- Manage notification preferences

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js |
| Server | Express.js |
| Database | SQLite |
| Templating | EJS |
| Scheduling | node-cron |
| HTTP Client | axios |

---

## 📝 License

MIT

---

**Built by [Sharad Pawar](https://github.com/sharadpawar05)**
