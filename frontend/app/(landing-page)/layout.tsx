import LandingAccessGate from "./components/LandingAccessGate"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import { Poppins } from 'next/font/google'
import { Suspense } from 'react'
import "./landing-layout.css"

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar scrolled={false} />
      <main className="landing-content">
        {children}
      </main>
      <Footer />
    </>
  );
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`landing-zone ${poppins.variable}`}>
      <LandingAccessGate>
        <Suspense fallback={
          <div className="landing-loading">
            <div className="loading-spinner"></div>
          </div>
        }>
          <LayoutContent>{children}</LayoutContent>
        </Suspense>
      </LandingAccessGate>
    </div>
  )
}
