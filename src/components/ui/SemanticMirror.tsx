import React from 'react';
import { portfolioData, getSkillById } from '../../data';

export const SemanticMirror: React.FC = () => {
  const { owner, stations, skills, howBuilt, guide } = portfolioData;

  return (
    <article
      aria-label="Accessible Semantic Profile Mirror"
      className="sr-only"
    >
      <header>
        <h1>{owner.name}</h1>
        <p>{owner.title}</p>
        <p>{owner.bioSummary}</p>
        <address>
          <span>Location: {owner.location}</span>
          <a href={`mailto:${owner.email}`}>Email: {owner.email}</a>
          <span>Phone: {owner.phone}</span>
          <a href={owner.linkedin}>LinkedIn: {owner.linkedin}</a>
          <a href={owner.github}>GitHub: {owner.github}</a>
          <a href={owner.portfolioUrl}>Portfolio: {owner.portfolioUrl}</a>
        </address>
      </header>

      <section aria-labelledby="semantic-skills">
        <h2 id="semantic-skills">Technical Skills & Competencies</h2>
        <ul>
          {skills.map((skill) => (
            <li key={skill.id}>
              {skill.name} ({skill.category} - {skill.level})
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="semantic-milestones">
        <h2 id="semantic-milestones">Engineering & Academic Milestones</h2>
        {stations.map((stn) => (
          <article key={stn.id} id={stn.id}>
            <h3>
              {stn.title} — {stn.organization}
            </h3>
            <p>
              Type: {stn.type} | Period: {stn.period} | Location: {stn.location}
            </p>
            <p>{stn.summary}</p>
            <h4>Key Accomplishments</h4>
            <ul>
              {stn.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
            <h4>Metrics & Impact</h4>
            <ul>
              {stn.metrics.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
            <h4>Technologies</h4>
            <p>
              {stn.skillIds
                .map((id) => getSkillById(id)?.name || id)
                .join(', ')}
            </p>
            {stn.links.length > 0 && (
              <h4>Verification Links</h4>
            )}
            <ul>
              {stn.links.map((link, i) => (
                <li key={i}>
                  <a href={link.url}>{link.label}</a>
                </li>
              ))}
            </ul>
            <h4>Interactive Q&A</h4>
            <dl>
              {stn.qa.map((qaItem, i) => (
                <React.Fragment key={i}>
                  <dt>{qaItem.question}</dt>
                  <dd>{qaItem.answer}</dd>
                </React.Fragment>
              ))}
            </dl>
          </article>
        ))}
      </section>

      <section aria-labelledby="semantic-guide">
        <h2 id="semantic-guide">Conductor Guide Details</h2>
        <p>Name: {guide.name}</p>
        <p>Role: {guide.role}</p>
        <p>Description: {guide.appearanceDescription}</p>
      </section>

      <section aria-labelledby="semantic-how-built">
        <h2 id="semantic-how-built">Technical Implementation Notes</h2>
        <p>{howBuilt.stackSummary}</p>
        <p>{howBuilt.architectureNotes}</p>
      </section>
    </article>
  );
};

