import { useEffect, useRef, useState } from 'react';
import type { EditorView } from 'codemirror';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

/**
 * Сначала показываем обычное поле ввода, а CodeMirror догружаем отдельным файлом.
 * На медленном интернете код можно писать и запускать ещё до загрузки редактора.
 */
export function CodeEditor({ value, onChange, label }: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  const [ready, setReady] = useState(false);

  onChangeRef.current = onChange;
  valueRef.current = value;

  useEffect(() => {
    let cancelled = false;

    void Promise.all([
      import('codemirror'),
      import('@codemirror/lang-javascript'),
      import('@codemirror/theme-one-dark'),
    ])
      .then(([{ basicSetup, EditorView: View }, { javascript }, { oneDark }]) => {
        if (cancelled || !hostRef.current) return;
        viewRef.current = new View({
          doc: valueRef.current,
          parent: hostRef.current,
          extensions: [
            basicSetup,
            javascript(),
            oneDark,
            View.contentAttributes.of({ 'aria-label': label }),
            View.updateListener.of((update) => {
              if (update.docChanged) onChangeRef.current(update.state.doc.toString());
            }),
          ],
        });
        setReady(true);
      })
      .catch(() => {
        // Файл редактора не загрузился: поле ввода продолжает работать.
      });

    return () => {
      cancelled = true;
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, [label]);

  // Внешняя смена кода: сброс или выбор примера.
  useEffect(() => {
    const view = viewRef.current;
    if (view && view.state.doc.toString() !== value) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
    }
  }, [value]);

  return (
    <div className="editor">
      {!ready && (
        <textarea
          className="editor__fallback"
          aria-label={label}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      <div ref={hostRef} className="editor__host" hidden={!ready} />
    </div>
  );
}
