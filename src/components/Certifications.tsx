import { certifications, sectionTitles } from '../data/portfolio'
import { ArrowIcon } from './icons'
import { MetaRow, Section } from './Section'

export function Certifications() {
  return (
    <Section id="certifications" title={sectionTitles.certifications}>
      <div className="grid gap-4 md:grid-cols-2">
        {certifications.map((cert) => (
          <a
            key={cert.url}
            href={cert.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col rounded-xl border border-line bg-surface p-5 transition duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-xl hover:shadow-brand/10"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-medium leading-snug text-ink transition-colors group-hover:text-accent">{cert.name}</h3>
              <ArrowIcon className="mt-1 size-4 shrink-0 text-muted transition-colors group-hover:text-accent" />
            </div>
            <MetaRow left={cert.issuer} right={cert.date} />
            {cert.credentialId && (
              <p className="mt-auto pt-3 text-xs break-all text-muted">
                Credential ID <span className="font-mono">{cert.credentialId}</span>
              </p>
            )}
          </a>
        ))}
      </div>
    </Section>
  )
}
