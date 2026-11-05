import { useState } from 'react';
import { CodeRunner } from '../components/CodeRunner';
import { t } from '../i18n';
import { decodeCode, encodeCode } from '../sandbox/shareLink';

export function PlaygroundPage() {
  const [exampleIndex, setExampleIndex] = useState(0);
  const [sharedCode] = useState(() => decodeCode(window.location.hash));
  const [usingShared, setUsingShared] = useState(sharedCode !== null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const example = t.playground.examples[exampleIndex] ?? t.playground.examples[0];

  const share = (code: string) => {
    const url = `${window.location.origin}${window.location.pathname}${encodeCode(code)}`;
    setShareUrl(url);
    void navigator.clipboard?.writeText(url).catch(() => {
      // Буфер обмена недоступен: ссылка всё равно показана в поле ниже.
    });
  };

  return (
    <div className="container section">
      <h1>{t.playground.title}</h1>
      <p className="lead">{t.playground.lead}</p>
      {usingShared && <p className="shared-note">{t.playground.sharedNote}</p>}
      <label className="field">
        {t.playground.examplesLabel}
        <select
          value={exampleIndex}
          onChange={(event) => {
            setUsingShared(false);
            setShareUrl(null);
            setExampleIndex(Number(event.target.value));
          }}
        >
          {t.playground.examples.map((item, index) => (
            <option key={item.name} value={index}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <CodeRunner
        key={usingShared ? 'shared' : exampleIndex}
        initialCode={usingShared && sharedCode !== null ? sharedCode : example.code}
        renderActions={(code) => (
          <button type="button" className="button" onClick={() => share(code)}>
            {t.playground.share}
          </button>
        )}
      />
      {shareUrl && (
        <label className="share-link">
          {t.playground.shareLabel}
          <input type="text" readOnly value={shareUrl} onFocus={(event) => event.target.select()} />
        </label>
      )}
    </div>
  );
}
