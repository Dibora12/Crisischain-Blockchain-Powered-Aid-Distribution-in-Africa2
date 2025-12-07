
# 🌍 CrisisChain: Blockchain-Powered Aid Distribution for Africa  

**Track:** 💸 1. Onchain Finance & Real-World Assets (RWA) 
**Hackathon:** Hedera Africa Hackathon 2025  

--- 

## 🧩 Project Overview 

**CrisisChain** is a **Hedera-powered aid distribution platform** built to ensure that every donation and humanitarian resource in Africa is **transparent, traceable, and tamper-proof**.  

By leveraging **Hedera Hashgraph’s Token Service (HTS)**, **Consensus Service (HCS)**, and **Scheduled Transactions**, CrisisChain brings **real-time transparency** to donors, NGOs, and communities.  

CrisisChain’s mission is simple but powerful:  
> *Ensure that every act of giving truly reaches its destination — with fairness, security, and trust.*

🌐 **Live Demo:** (https://crisischain-blockchain-powered-aid.vercel.app/)

📺 **Video Demo:** (https://youtu.be/KMIH9g2GQ-I?si=B8i3DvxUZ6DZprya)

📃Pitch deck:** (https://eu.docs.wps.com/module/common/loadPlatform/?sa=601.1037&sid=sIBzR1Li7AYXFhsMG&v=v2)

📝Hedera Certificate link:** (https://drive.google.com/file/d/1w3cUbRK8vW58oIo8cQwQoIi3gXdD743C/view?usp=sharing)

---

## 💡 Problem

Humanitarian aid distribution in Africa often faces:
- Lack of transparency and traceability  
- Fraud, duplication, and administrative inefficiency  
- Delays due to manual recordkeeping and middlemen  
- Donor distrust caused by opaque fund management  

---

## 🌍 Vision

CrisisChain redefines aid distribution through **decentralized governance and gamified transparency**, allowing every stakeholder — from donors to local NGOs — to track aid impact in real time.

---

## ⚙️ Hedera Integration Summary

### 1️⃣ **Hedera Token Service (HTS) – Tokenized Aid Credits**
**Purpose:** Represent aid as digital tokens (e.g., *AID Tokens*) distributed to verified beneficiaries.  
**Transactions Used:**
- `TokenCreateTransaction` → Creates AID tokens  
- `TokenAssociateTransaction` → Links tokens to verified accounts  
- `TransferTransaction` → Distributes tokens for redemption  

**Economic Justification:**  
HTS’s fixed $0.0001 fee per transaction enables **micro-aid transfers** and **low-cost token minting** for small communities — crucial for low-income regions where gas fees can be prohibitive.

---

### 2️⃣ **Hedera Consensus Service (HCS-2) – Transparent Aid Logs**
**Purpose:** Record all aid-related events (distribution, redemption, approvals) immutably.  
**Transactions Used:**
- `TopicCreateTransaction` → Create registry topics  
- `TopicMessageSubmitTransaction` → Log aid activity and audit data  

**Economic Justification:**  
With $0.0001 per HCS message, CrisisChain can log **thousands of records for less than $1/month**, offering unmatched transparency at minimal cost.

---

### 3️⃣ **Scheduled Transactions – Multi-Stakeholder Verification**
**Purpose:** Enable **multi-sig approvals** for fund releases between donors and NGOs.  
**Transactions Used:**
- `ScheduleCreateTransaction` → Create pending aid release  
- `ScheduleSignTransaction` → Collect signatures from NGOs/validators  

**Economic Justification:**  
Scheduled transactions cost <$0.10 total, making **multi-party governance affordable** compared to smart-contract multisigs that cost $50–$500 elsewhere.

---

### 4️⃣ **Threshold Keys – Proof of Decentralized Governance**
**Purpose:** Secure aid funds under **M-of-N approval keys**, ensuring no single entity controls disbursement.  
**Transactions Used:**
- `AccountCreateTransaction` → Create threshold-based accounts  
- `AccountUpdateTransaction` → Adjust signer composition  

**Economic Justification:**  
Creating a threshold account costs ~$1, allowing small NGOs to adopt **enterprise-grade decentralization** cheaply and verifiably.

---

## 🧠 Architecture Diagram

<img width="1536" height="1024" alt="e741140b-5f54-4472-9937-3ec4cf13e5ad" src="https://github.com/user-attachments/assets/acef8c3c-1ea0-4959-a46c-b54d7baa4388" />




┌──────────────────────────────────────────────────────────────┐
│ CrisisChain Architecture │
└──────────────────────────────────────────────────────────────┘

┌──────────────┐ ┌────────────────────────────┐
│ Donor │───────► │ Hedera Token Service │
│ (Funds → AID)│ │ • Token creation │
│ │ │ • Token transfer │
└─────┬────────┘ └─────────────┬──────────────┘
│ │
▼ ▼
┌──────────────┐ ┌────────────────────────────┐
│ NGO/Admin │───────► │ Hedera Consensus Service │
│ (Approvals) │ │ • Logs aid events │
│ │ │ • Immutable audit records │
└─────┬────────┘ └─────────────┬──────────────┘
│ │
▼ ▼
┌──────────────┐ ┌────────────────────────────┐
│ Beneficiary │◄─────── │ Scheduled Transactions │
│ (Redeems) │ │ • Multi-sig approvals │
└──────────────┘ └─────────────┬──────────────┘
│
▼
┌──────────────────┐
│ Threshold Keys │
│ • M-of-N security │
│ • Verified access │
└──────────────────┘


---

## 🧰 Technology Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React.js + TailwindCSS |
| Backend | Node.js + Express |
| Database | Supabase |
| Blockchain | Hedera Hashgraph SDK (HTS, HCS, Scheduled Tx) |
| Storage | IPFS (for aid receipts) |
| AI Module | Python (for need scoring) |
| Deployment | Vercel / Render / Docker |

---

## 🚀 Setup Instructions

### **Prerequisites**
- Node.js v20+  
- npm v10+  
- Hedera Testnet account ([portal.hedera.com](https://portal.hedera.com))  
- MongoDB or PostgreSQL connection URI  

### **Clone and Install**
```bash
git clone https://github.com/Dibora12/Crisischain-Blockchain-Powered-Aid-Distribution-in-Africa2.git
cd crisischain
npm install
Run
npm run dev

         📊 Current Status

✅ Testnet Deployed (Demo live on Hedera Testnet)
🚧 Mainnet Ready — pending finalization
🧍‍♀️ Solo Developer: Dibora Shibeshi
📦 Modules Completed:

      * Tokenized Aid Distribution

       *Beneficiary Verification (DID)

       *Transparent Audit Dashboard

       *Multi-sig Scheduled Transaction Flow

       *AI-powered Need Scoring (Prototype)-undergoing

                 🧾 License

MIT License © 2025 Dibora Shibeshi

            🤝 Acknowledgments

Built for the Hedera Africa Hackathon 2025 with support from:

   * Hedera Hashgraph

   *HashPack Wallet

   *Blade Wallet

    *Supabase

African Blockchain Community 🌍💚

“CrisisChain — Because transparency should be as unstoppable as hope.”
