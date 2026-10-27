import { useEffect } from 'react'
import { Contact } from './components/Contact'
import { CrossLine } from './components/CrossLine'
import { Education, Highlights } from './components/Education'
import { Experience } from './components/Experience'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Nav } from './components/Nav'
import { Projects } from './components/Projects'
import { Research } from './components/Research'
import { Skills } from './components/Skills'
import { useRevealOnScroll } from './hooks/useRevealOnScroll'

export default function App() {
  useRevealOnScroll()

  // The page renders client-side, so honour a #hash in the URL once it exists.
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1))
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [])

  return (
    <div className="pt-6 pb-6">
      <Nav />

      <main className="max-w-4xl mx-auto border-x border-neutral-200 dark:border-neutral-800 min-h-screen relative">
        <div className="hidden lg:block absolute top-0 left-0 right-0">
          <CrossLine />
        </div>

        <div className="px-5 md:px-10 pt-20 md:pt-24 pb-16 md:pb-20 space-y-16 md:space-y-24">
          <Hero />
          <Skills />
          <Experience />
          <Projects />
          <Research />
          <Education />
          <Highlights />
          <Contact />
        </div>

        <div className="hidden lg:block absolute bottom-0 left-0 right-0">
          <CrossLine />
        </div>
        <div className="lg:hidden h-px bg-neutral-200 dark:bg-neutral-800" />
      </main>

      <Footer />
    </div>
  )
}
