const CODE_BLOCK = /```(\w*)\n([\s\S]*?)```/g;
const INLINE_CODE = /`([^`]+)`/g;
const BOLD = /\*\*(.+?)\*\*/g;
const LIST = /^- (.+)/gm;
const PARAGRAPH = /\n\s*\n/g;

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, c => map[c]);
}

function inlineFormat(line) {
  const parts = [];
  let last = 0, match;

  const tokens = [];
  const re = /(\*\*(.+?)\*\*|`([^`]+)`)/g;
  while ((match = re.exec(line)) !== null) {
    if (match.index > last) tokens.push({ t: 'text', v: line.slice(last, match.index) });
    if (match[1].startsWith('**')) tokens.push({ t: 'bold', v: match[2] });
    else tokens.push({ t: 'code', v: match[3] });
    last = re.lastIndex;
  }
  if (last < line.length) tokens.push({ t: 'text', v: line.slice(last) });

  return tokens.map(tok => {
    switch (tok.t) {
      case 'bold': return `<strong>${escapeHtml(tok.v)}</strong>`;
      case 'code': return `<code style="background:rgba(255,255,255,.06);padding:1px 6px;border-radius:4px;font-family:var(--mono);font-size:.92em">${escapeHtml(tok.v)}</code>`;
      default: return escapeHtml(tok.v);
    }
  }).join('');
}

function renderBlocks(text) {
  const blocks = [];
  let last = 0, match;

  const re = /```(\w*)\n([\s\S]*?)```/g;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) blocks.push({ t: 'markdown', v: text.slice(last, match.index) });
    blocks.push({ t: 'code', lang: match[1] || '', v: match[2] });
    last = re.lastIndex;
  }
  if (last < text.length) blocks.push({ t: 'markdown', v: text.slice(last) });

  return blocks;
}

export default function MarkdownRenderer({ children, className = '' }) {
  const text = typeof children === 'string' ? children : '';
  if (!text) return null;

  const blocks = renderBlocks(text);

  return (
    <div className={className} style={{ lineHeight: 1.75 }}>
      {blocks.map((block, bi) => {
        if (block.t === 'code') {
          return (
            <pre key={bi} style={{
              background: 'var(--layer)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '16px 20px', overflowX: 'auto',
              fontSize: 13, fontFamily: 'var(--mono)', lineHeight: 1.6, margin: '12px 0',
            }}>
              <code>{escapeHtml(block.v)}</code>
            </pre>
          );
        }

        const paragraphs = block.v.split(PARAGRAPH).filter(Boolean);
        return paragraphs.map((para, pi) => {
          const listItems = [];
          let listMatch;
          const listRe = /^- (.+)/gm;
          while ((listMatch = listRe.exec(para)) !== null) listItems.push(listMatch[1]);

          if (listItems.length > 0) {
            const lines = para.split('\n');
            const items = lines.filter(l => l.match(/^- /)).map(l => l.replace(/^- /, ''));
            return (
              <ul key={`${bi}-${pi}`} style={{ margin: '8px 0', paddingLeft: 24, listStyle: 'none' }}>
                {items.map((item, ii) => (
                  <li key={ii} style={{ marginBottom: 4, position: 'relative', paddingLeft: 8 }}>
                    <span style={{ position: 'absolute', left: -16, color: 'var(--blue2)' }}>•</span>
                    <span dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
                  </li>
                ))}
              </ul>
            );
          }

          return (
            <p key={`${bi}-${pi}`} style={{ margin: '8px 0' }}>
              {para.split('\n').map((line, li) => (
                <span key={li}>
                  {li > 0 && <br />}
                  <span dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />
                </span>
              ))}
            </p>
          );
        });
      })}
    </div>
  );
}
