````markdown
<div align="center">
  <img src="front_end/public/brand/logos/default.svg" alt="Explore Space Biology Logo" width="120" />
</div>

# 🚀 Explore Space Biology

**AI-powered dynamic dashboard to explore NASA’s space biology research**  
_Built for the [NASA Space Apps Challenge 2025](https://www.spaceappschallenge.org/)_

---

## 🌟 Overview

NASA has decades of **space biology experiments** — critical for planning safe human exploration of the Moon and Mars — but this knowledge is scattered and hard to navigate.

**Explore Space Biology** makes this information accessible and engaging using:

- **Artificial Intelligence & Knowledge Graphs** to organize 600+ NASA bioscience publications
- **Interactive Tools** to explore, learn, and generate insights
- **Public-friendly design** for scientists, mission planners, and learners

---

## ✨ Features

- 🔎 **Search with AI** — Ask questions in natural language and get answers from NASA’s bioscience papers  
- 🕐 **Timeline** — See breakthroughs in space biology over the years  
- 🔗 **Knowledge Graph** — Visualize connections between studies, topics, and missions  
- 🎙️ **Podcast Creator** — Turn any topic into short, engaging audio dialogues  
- 📚 **Comic Generator** — Convert scientific stories into simple educational comics  
- 🎴 **Flash Cards** — Learn space biology concepts interactively  
- 🧭 **Clean, NASA-inspired UI** — Accessible, responsive, and user-friendly

---

## 🛠️ Tech Stack

| Layer          | Tech                                                                 |
|----------------|---------------------------------------------------------------------|
| **Frontend**   | [Next.js 15](https://nextjs.org/) · TypeScript · TailwindCSS v4 · shadcn/ui |
| **Backend**    | [LightRAG](https://github.com/HKUDS/LightRAG) for Retrieval-Augmented Generation |
| **Data**       | 600+ NASA Space Biology open-access publications (CSV + PubMed links) |
| **Visualization** | Interactive Graphs, Timeline Charts, Dynamic UI Components |

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

Open [http://localhost:3000](http://localhost:3000).

### 3️⃣ Setup LightRAG Backend

```bash
git clone https://github.com/HKUDS/LightRAG.git
cd LightRAG
pip install -e ".[api]"
lightrag-server
```

Configure your **OpenAI API key** or preferred LLM in `.env`.
Our app connects to LightRAG to power **AI search & knowledge graph**.

---

## 🌌 Data Source

* [NASA Space Biology Publications CSV](https://osdr.nasa.gov/)
* NASA Open Science Data Repository (OSDR)
* NASA Space Life Sciences Library (NSLSL)
* NASA Task Book

We currently index 600+ open-access space biology studies to build the knowledge graph and power AI search.

---

## 🌠 Future Directions

* 🔬 Advanced semantic search with embeddings
* 🌍 Real-time OSDR API integration
* 🧑‍🚀 Personalized mission planning dashboards
* 🌐 Multi-language support
* 🪐 AR/VR space biology learning experiences

---

## 👩‍🚀 Team

**Odd One Bit*
*Built with ❤️ during the NASA Space Apps Challenge 2025.*

---

## 📄 License

MIT License — open for educational and research use.

```

---

Would you like me to make this **more technical** (add details about LightRAG setup & embedding models) or keep it **judge-friendly** like above?
```
