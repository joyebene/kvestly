import Link from "next/link";
export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div><p className="eyebrow justify-center">404</p><h1 className="mt-4 text-4xl font-semibold">Page not found</h1>
        <p className="mt-3 text-silver-400">The page you are looking for doesn&apos;t exist or has moved.</p>
        <Link href="/" className="mt-8 inline-block rounded-xl bg-blue-sheen px-6 py-3 text-sm font-semibold text-white">Back to home</Link></div>
    </main>
  );
}
