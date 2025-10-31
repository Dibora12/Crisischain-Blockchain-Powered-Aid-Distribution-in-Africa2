
# 🌍 CrisisChain – Hedera Powered Aid Distribution For Africa

**CrisisChain** is a decentralized web app platform designed to bring **transparency, fairness, and efficiency** to humanitarian aid distribution across Africa. Built on the **Hedera Hashgraph network**, it enables NGOs, donors, governments, and communities to collaborate in a **trustless, verifiable ecosystem** where aid flows directly to verified recipients with **low cost, high speed, and eco-friendly transactions**.

---

## ✨ Purpose

Aid often fails to reach those who need it most. CrisisChain on **Hedera** solves this by:
- Securely verifying identities
- Tracking every step of aid distribution
- Issuing tamper-proof digital aid tokens (via Hedera Token Service)
- Providing real-time dashboards for transparency (via Hedera Consensus Service)

---

## 🚀 Features

- 🔗 **Hedera Token Service (HTS)** for aid token creation & distribution
- 🎟️ **Token-based claiming** via verified identity
- 📊 **Hedera Consensus Service (HCS)** for immutable transaction logs
- 📍 **Map-based tracking** of aid distribution centers
- 👛 **Wallet integrations** (HashPack / Blade Wallet)
- 🛡️ **Tamper-proof, fraud-resistant system**
- 🌱 **Eco-friendly ledger** with low energy usage

---

## 🛠️ Tech Stack

| Layer            | Technology                          |
|------------------|------------------------------------|
| Frontend         | React.js / TypeScript / Tailwind CSS |
| Backend          | Supabase (Database + Auth)         |
| Blockchain       | Hedera Hashgraph (HTS + HCS)       |
| Database         | PostgreSQL (via Supabase)          |
| Authentication   | Supabase Auth with JWT             |
| Wallet           | HashPack / Blade Wallet            |
| Map Integration  | Leaflet.js / Mapbox                |

---

## 📦 Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/Dibora12/CrisisChain-Hedera-Aid-Distribution
cd CrisisChain-Hedera-Aid-Distribution
npm install

VITE_SUPABASE_URL=your_supabase_url  
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key  
VITE_HEDERA_ACCOUNT_ID=your_account_id  
VITE_HEDERA_PRIVATE_KEY=your_private_key


npm run dev
