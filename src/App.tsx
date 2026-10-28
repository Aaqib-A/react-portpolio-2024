import { useEffect } from 'react'
import { Contact } from './components/Contact'
import { ContactBand } from './components/ContactBand'
import { Education } from './components/Education'
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
    <>
      <Nav />
      <main>
        <Hero />
        <ContactBand />
        <Skills />
        <Experience />
        <Projects />
        <Research />
        <Education />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
