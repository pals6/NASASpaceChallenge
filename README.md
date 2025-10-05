````markdown
# 🪐 **Aletheia**  
### *Revealing the science of life beyond Earth.*

---

## 🌟 Overview

**Aletheia** is an **AI-powered exploration platform** that unveils insights hidden within NASA’s bioscience publications.  
Designed for **scientists, mission planners, and students**, it transforms over six decades of space biology research into **interactive, accessible knowledge**.

This project directly addresses the **NASA Space Apps Challenge 2025** by converting an overwhelming archive of **600+ bioscience publications** into an intelligent, interactive knowledge system.  
Instead of manually searching through dense technical papers, **Aletheia** uses:

- 🧠 **AI-driven summarization**  
- 🌐 **Knowledge graphs**  
- 🔎 **Semantic retrieval & search**

…to reveal **patterns, insights, and relationships** across decades of space biology research.

> **Aletheia empowers decision-makers and researchers** to build upon NASA’s legacy data — exposing trends, knowledge gaps, and transformative findings.  
> It turns passive archives into **living knowledge**, making space bioscience both **discoverable and inspiring**.

---

## ✨ Features

- 🔍 **Search with AI** – Natural-language search across NASA’s space biology corpus  
- 🕐 **Timeline** – Interactive research history visualization over decades  
- 🔗 **Knowledge Graph** – Dynamic graph linking studies, topics, and missions  
- 🎙️ **Podcast Creator** – Auto-generate short dialogues to explain discoveries  
- 📚 **Comic Generator** – Turn research stories into engaging visual comics  
- 🎴 **Flash Cards** – Learn space biology concepts interactively  
- 🧭 **Accessible NASA-inspired UI** – Clean, responsive, and public-friendly

---

## 🛠️ Tech Stack

| Layer          | Technologies                                                                 |
|----------------|-----------------------------------------------------------------------------|
| **Frontend**   | Next.js 15 · TypeScript · TailwindCSS v4 · shadcn/ui                        |
| **Backend**    | [LightRAG](https://github.com/HKUDS/LightRAG) for Retrieval-Augmented Generation |
| **Data**       | NASA Space Biology Publications (600+ open-access studies)                  |
| **Visualization** | Interactive graphs, timelines, and learning tools                         |

---

## 🚀 Getting Started

### 1️⃣ Prerequisites
- Node.js 18+
- npm or yarn
- Python 3.10+ (if running LightRAG backend)

### 2️⃣ Setup Frontend

```bash
cd front_end
npm install
npm run dev
````

Visit [http://localhost:3000](http://localhost:3000)

### 3️⃣ Setup LightRAG Backend

```bash
cd lightrag
pip install -e ".[api]"
lightrag-server
```

Add your **OpenAI API key** or preferred LLM to `.env`.
Aletheia uses LightRAG to power **AI search & knowledge graph** features.

---

## 🌌 Data Sources

* [608 Space Biology Publications CSV](https://github.com/jgalazka/SB_publications)

---

## 🌠 Future Enhancements

* 🔬 **Deeper semantic search** with custom embeddings
* 🌍 **Real-time OSDR API integration**
* 🧑‍🚀 **Mission-planning dashboards** for human spaceflight
* 🌐 **Multi-language support**
* 🪐 **AR/VR learning experiences** for space bioscience

---

## 👩‍🚀 Team

**Odd One Bit** — 
*Built with ❤️ during the NASA Space Apps Challenge 2025.*

---

## 📄 License

MIT License — Open for educational and research use.

```

```
