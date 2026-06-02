export default function parseJSON(text) {
  const attempts = [
    // 1. direct parse
    () => JSON.parse(text),

    // 2. strip markdown code fences
    () => JSON.parse(text.replace(/^[\s\S]*?```(?:json)?\s*([\s\S]*?)\s*```[\s\S]*$/m, '$1')),

    // 3. extract first balanced {…} or […] block, sanitizing strings on the fly
    () => {
      const start = text.indexOf('{');
      const startArr = text.indexOf('[');
      const pos = start < 0 ? startArr : startArr < 0 ? start : Math.min(start, startArr);
      if (pos < 0) throw new Error('no JSON structure found');
      const open = text[pos], close = open === '{' ? '}' : ']';
      let depth = 0, inStr = false, esc = false;
      const out = [];
      for (let i = pos; i < text.length; i++) {
        const ch = text[i];
        if (esc) { out.push(ch); esc = false; continue; }
        if (ch === '\\' && inStr) { out.push(ch); esc = true; continue; }
        if (ch === '"') {
          if (inStr) {
            let next = '';
            for (let j = i + 1; j < text.length; j++) {
              if (!' \t\n\r'.includes(text[j])) { next = text[j]; break; }
            }
            if (':,}]'.includes(next)) {
              inStr = false;
              out.push(ch);
            } else {
              out.push('\\"');
            }
          } else {
            inStr = true;
            out.push(ch);
          }
          continue;
        }
        if (inStr) {
          if (ch === '\n' || ch === '\r') { out.push('\\n'); continue; }
          if (ch === '\t') { out.push('\\t'); continue; }
          out.push(ch);
          continue;
        }
        if (ch === open) depth++;
        else if (ch === close) { depth--; if (depth === 0) { out.push(ch); return JSON.parse(out.join('')); } }
        out.push(ch);
      }
      if (depth > 0 && close) { out.push(close); return JSON.parse(out.join('')); }
      throw new Error('unclosed JSON structure');
    },

    // 4. sanitize: escape unescaped control chars inside strings, fix unquoted keys
    () => {
      let s = '';
      let inStr = false, esc = false;
      for (const ch of text) {
        if (esc) { s += ch; esc = false; continue; }
        if (ch === '\\' && inStr) { s += ch; esc = true; continue; }
        if (ch === '"') { inStr = !inStr; s += ch; continue; }
        if (inStr && (ch === '\n' || ch === '\r')) { s += '\\n'; continue; }
        if (inStr && ch === '\t') { s += '\\t'; continue; }
        s += ch;
      }
      return JSON.parse(s);
    },

    // 5. last resort: sanitize + fix unquoted keys + close unclosed brackets
    () => {
      let s = '';
      let inStr = false, esc = false;
      for (const ch of text) {
        if (esc) { s += ch; esc = false; continue; }
        if (ch === '\\' && inStr) { s += ch; esc = true; continue; }
        if (ch === '"') { inStr = !inStr; s += ch; continue; }
        if (inStr && (ch === '\n' || ch === '\r')) { s += '\\n'; continue; }
        if (inStr && ch === '\t') { s += '\\t'; continue; }
        s += ch;
      }
      let r = s.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3');
      const opens = (r.match(/\{/g) || []).length;
      const closes = (r.match(/\}/g) || []).length;
      if (opens > closes) r += '}'.repeat(opens - closes);
      const opensB = (r.match(/\[/g) || []).length;
      const closesB = (r.match(/\]/g) || []).length;
      if (opensB > closesB) r += ']'.repeat(opensB - closesB);
      return JSON.parse(r);
    },
  ];

  for (const fn of attempts) {
    try { return fn(); } catch {}
  }
  throw new Error('Failed to parse JSON: ' + text.slice(0, 200));
}
