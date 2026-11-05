import { useState } from 'react';
import { CodeRunner } from '../components/CodeRunner';
import { t } from '../i18n';

export function PlaygroundPage() {
  const [exampleIndex, setExampleIndex] = useState(0);
  const example = t.playground.examples[exampleIndex] ?? t.playground.examples[0];

  return (
    <div className="container section">
      <h1>{t.playground.title}</h1>
      <p className="lead">{t.playground.lead}</p>
      <label className="field">
        {t.playground.examplesLabel}
        <select
          value={exampleIndex}
          onChange={(event) => setExampleIndex(Number(event.target.value))}
        >
          {t.playground.examples.map((item, index) => (
            <option key={item.name} value={index}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <CodeRunner initialCode={example.code} />
    </div>
  );
}
