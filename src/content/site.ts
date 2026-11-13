import { Bitcoin, Coins, Globe2, LineChart, Compass, Eye, ShieldCheck, Scale, Handshake, MessageSquareText, UserPlus, BadgeCheck, Search, FileText, MousePointerClick, Activity, Layers, Lock, Users, type LucideIcon } from "lucide-react";

export interface Service { icon: LucideIcon; title: string; text: string }

export const services: Service[] = [
  { icon: Coins, title: "Cryptocurrency Investment", text: "We focus on the cryptocurrency market, exploring opportunities within established digital assets and emerging blockchain-based financial ecosystems. Our approach emphasizes market research, strategic evaluation and an understanding of the opportunities and risks associated with digital currencies." },
  { icon: Bitcoin, title: "Bitcoin and Digital Assets", text: "Bitcoin represents a major part of the evolving digital finance landscape. We maintain a strong focus on Bitcoin and other relevant digital assets, following market developments and exploring opportunities within this rapidly changing sector." },
  { icon: Globe2, title: "Digital Asset Market Opportunities", text: "We follow developments across the wider digital asset industry, including blockchain innovation, emerging crypto projects and evolving decentralized financial ecosystems." },
  { icon: Layers, title: "General Investment Opportunities", text: "Beyond cryptocurrency, we recognize the importance of diversification and broader financial markets. We explore investment opportunities across other relevant asset classes, subject to our business scope and applicable regulatory requirements." },
  { icon: LineChart, title: "Investment Guidance and Market Insights", text: "We believe informed investment decisions begin with knowledge. We place importance on understanding market movements, evaluating opportunities and providing clear information that helps clients make informed financial decisions." },
];

export const focusAreas = [
  { icon: Coins, title: "Cryptocurrency", text: "Established and emerging digital currencies, evaluated with research and risk in view." },
  { icon: Bitcoin, title: "Bitcoin", text: "A sustained focus on the asset at the centre of digital finance." },
  { icon: Globe2, title: "Digital asset ecosystem", text: "Blockchain innovation, emerging projects and decentralized finance." },
  { icon: Layers, title: "Diversified markets", text: "Other asset classes, subject to our scope and regulation." },
];

export const whyChoose = [
  { icon: Eye, title: "Transparency first", text: "Clear information about services, terms and risks — before you decide, not after." },
  { icon: ShieldCheck, title: "Risk-aware by design", text: "We state risks plainly and never present an opportunity without acknowledging them." },
  { icon: Lock, title: "Compliance-led rollout", text: "Each product opens only once its terms, fees, risks and eligibility have been reviewed and approved." },
  { icon: Users, title: "Client-focused support", text: "Professional, respectful communication and support for every client's decisions." },
];

export const commitments = [
  { icon: MessageSquareText, title: "Clear Communication", text: "We aim to provide understandable and accurate information about our services, investment opportunities, processes and applicable terms." },
  { icon: BadgeCheck, title: "Honest Representation", text: "We do not believe in misleading claims, unrealistic financial promises or presenting investment opportunities without acknowledging their associated risks." },
  { icon: Activity, title: "Risk Awareness", text: "We recognize that financial markets, particularly cryptocurrency markets, are volatile. We encourage informed decisions and responsible approaches to investing." },
  { icon: Scale, title: "Accountability", text: "We value responsibility in our business relationships and are committed to maintaining professional standards in our dealings." },
  { icon: Handshake, title: "Client Confidence", text: "We believe lasting relationships are built through consistent communication, integrity and respect for every client's financial decisions." },
];

export const steps = [
  { icon: UserPlus, title: "Create an Account", text: "Register with your email and secure your account with a strong password and two-factor authentication." },
  { icon: BadgeCheck, title: "Complete Identity Verification", text: "Where required by law, verify your identity so we can meet our know-your-customer and anti-money-laundering obligations." },
  { icon: Search, title: "Review Available Investment Opportunities", text: "Browse approved opportunities, each published with its terms, fees, risks and eligibility." },
  { icon: FileText, title: "Review Risks and Applicable Terms", text: "Read the risk disclosure and the product terms carefully. Ask us anything that is unclear." },
  { icon: MousePointerClick, title: "Make an Investment Decision", text: "The decision is yours. Only invest money you can afford to lose." },
  { icon: Compass, title: "Monitor Your Investment", text: "Track verified portfolio data, transactions and notifications from your dashboard." },
];

export const faqs = [
  { q: "What does KVESTY do?", a: "KVESTY is an investment-focused company founded in 2019. Our primary focus is cryptocurrency and digital assets, alongside broader investment opportunities, approached with market research, strategy and transparency." },
  { q: "Is KVESTY regulated?", a: "Our registration and licensing status is published on the Regulatory Information page. We only state approvals that we can evidence — where a detail is not shown there, it has not been published." },
  { q: "Can I invest or deposit funds today?", a: "Not yet. You can create an account, but investment products, deposits and withdrawals will open only after the required regulatory, custody and payment arrangements are in place and verified." },
  { q: "Are returns guaranteed?", a: "No. Digital asset markets are volatile and you may lose some or all of the money you invest. We do not guarantee returns, and nothing on this website should be read as a promise of profit." },
  { q: "What is the minimum investment?", a: "A minimum of $1,000 has been proposed. It is not final: the minimum for each product will be stated in that product's approved terms." },
  { q: "Why do you ask for identity verification?", a: "Financial businesses are generally required by law to verify clients and prevent money laundering and fraud. We will only ask for what is required." },
  { q: "How is my account protected?", a: "Passwords are stored as salted hashes, two-factor authentication is available to every client, sessions can be revoked, and sensitive actions are logged. We will never ask for your private keys or seed phrases." },
  { q: "How can I contact KVESTY?", a: "Use the contact form and our team will respond. Official contact details will be published as soon as they are verified." },
];
