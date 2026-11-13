export interface LegalSection { h: string; p: string[]; list?: string[] }
export interface LegalDoc { title: string; intro: string; sections: LegalSection[] }

export const risk: LegalDoc = {
  title: "Risk Disclosure",
  intro: "Investing in cryptocurrency and other digital assets is high-risk. Please read this disclosure carefully before deciding whether any investment is appropriate for you.",
  sections: [
    { h: "You may lose everything", p: ["The value of digital assets can fall rapidly and by a large amount. You may lose some or all of the money you invest. Only invest money you can afford to lose."] },
    { h: "No guaranteed returns", p: ["KVESTY does not guarantee any return, profit or capital preservation. Any target, estimate or past result is not a reliable indicator of future performance. Be cautious of anyone — including anyone claiming to represent KVESTY — who promises fixed, guaranteed or unusually high returns."] },
    { h: "Market and volatility risk", p: ["Digital asset prices are highly volatile and can be affected by sentiment, news, regulation, liquidity, technology changes and market manipulation."] },
    { h: "Regulatory and legal risk", p: ["Laws governing digital assets are changing quickly and differ between countries. New rules may restrict, delay or end the availability of products or services, and may affect the value or transferability of assets."] },
    { h: "Custody, technology and security risk", p: ["Digital assets can be lost or stolen through hacking, fraud, software defects, human error or the failure of a custodian, exchange or other third party. Transactions on many blockchains are irreversible."] },
    { h: "Liquidity risk", p: ["You may be unable to sell or withdraw an investment when you want, or at the price you expect."] },
    { h: "No deposit insurance or compensation", p: ["Unless a product's published terms expressly state otherwise, funds are not protected by any deposit-insurance or investor-compensation scheme, and KVESTY does not represent investments as insured or guaranteed."] },
    { h: "Not advice", p: ["Information on this website is general and is not personal investment, legal or tax advice. Consider seeking independent professional advice."] },
  ],
};

export const privacy: LegalDoc = {
  title: "Privacy Policy",
  intro: "This policy explains what personal data KVESTY collects, why, and your rights. It is a working draft that must be reviewed by a qualified data-protection lawyer before launch.",
  sections: [
    { h: "Data we collect", p: ["Depending on how you use the website and platform:"], list: ["Contact details you submit (name, email, phone, message).", "Account data (email, hashed password, security settings).", "Identity-verification data where required by law (legal name, date of birth, country, identity-document details, verification outcome).", "Transaction and portfolio records, once those services exist.", "Technical data (IP address, device and browser information, security logs)."] },
    { h: "Why we use it", p: ["To respond to enquiries, operate and secure your account, meet legal and regulatory obligations (including identity-verification and anti-money-laundering requirements), prevent fraud and improve our service."] },
    { h: "What we never collect", p: ["We never ask for your cryptocurrency private keys or seed phrases, and we do not store card or bank credentials ourselves; payments are expected to be handled by licensed third-party providers."] },
    { h: "Sharing", p: ["We share data only with service providers acting for us (for example hosting, identity verification and payment providers), professional advisers, and regulators or authorities where required by law. We do not sell personal data."] },
    { h: "International transfers and retention", p: ["Data may be processed in other countries with appropriate safeguards. We keep data only as long as necessary for the purposes above and for legal retention periods applicable to financial businesses."] },
    { h: "Your rights", p: ["Depending on your location (for example under the Nigeria Data Protection Act 2023, the UK/EU GDPR or other laws) you may have the right to access, correct, delete, restrict or object to processing of your data, to data portability, and to complain to your data-protection regulator."] },
    { h: "Security", p: ["We use encryption in transit, hashed passwords, optional two-factor authentication, access controls and audit logging. No system is perfectly secure."] },
    { h: "Contact", p: ["Use the Contact page. A named data-protection contact will be published here once appointed."] },
  ],
};

export const terms: LegalDoc = {
  title: "Terms and Conditions",
  intro: "These terms govern use of the KVESTY website and any account you create. They are a working draft that must be reviewed by a qualified lawyer in each operating jurisdiction before launch.",
  sections: [
    { h: "About these terms", p: ["By using this website or creating an account you agree to these terms, our Privacy Policy and our Risk Disclosure. If you do not agree, do not use the service."] },
    { h: "Current status of services", p: ["Account creation is available. Investment products, deposits, trades and withdrawals are not yet operational and will be offered only after the required regulatory, custody and payment arrangements are in place. Nothing on this website is an offer or solicitation where it would be unlawful."] },
    { h: "Eligibility", p: ["You must be an adult with legal capacity, and not resident in or subject to a jurisdiction where our services are not permitted. We may require identity verification before offering any service."] },
    { h: "Your account", p: ["Keep your credentials secure and enable two-factor authentication. You are responsible for activity under your account. Tell us promptly if you suspect unauthorised access."] },
    { h: "Investment products", p: ["Each product will have its own terms, fees, risk disclosures and eligibility requirements, published before you can invest. Those product terms form part of your agreement with us."] },
    { h: "No guarantees; no advice", p: ["We do not guarantee returns or the safety of capital. Website content is general information, not personal advice."] },
    { h: "Prohibited use", p: ["You must not use the service for unlawful activity, money laundering, fraud, attempts to disrupt or gain unauthorised access to systems, or to misrepresent your identity."] },
    { h: "Limitation of liability and governing law", p: ["To be completed by qualified legal counsel, including the governing law, dispute-resolution forum and the extent to which liability may lawfully be limited."] },
  ],
};
