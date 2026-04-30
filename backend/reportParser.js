function grabField(block, label) {
  const re = new RegExp(`[-*]?\\s*${label}\\s*:\\s*([^\\n]+)`, 'i');
  const m = block.match(re);
  return m ? m[1].trim() : '';
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseTaskBlocks(md, options = {}) {
  const { stripPrefix } = options;
  let text = md;
  const section = md.match(/^##+\s+Предлагаемые задачи\s*$/mi);
  if (section) {
    const start = section.index + section[0].length;
    const rest = md.slice(start);
    const nextSection = rest.search(/^##\s/m);
    text = nextSection >= 0 ? rest.slice(0, nextSection) : rest;
  }

  const headerRe = /^###\s+(.+)$/gm;
  const headers = [...text.matchAll(headerRe)];
  const blocks = [];
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i];
    let title = h[1].trim();
    if (stripPrefix) {
      const re = new RegExp(`^${escapeRe(stripPrefix)}\\s*`, 'i');
      title = title.replace(re, '').trim();
    }
    const start = h.index + h[0].length;
    const end = headers[i + 1]?.index ?? text.length;
    blocks.push({ title, body: text.slice(start, end) });
  }
  return blocks;
}

function normalizeTitle(t, stripPrefix) {
  let s = (t || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (stripPrefix) {
    const p = stripPrefix.toLowerCase();
    if (s.startsWith(p)) s = s.slice(p.length).trim();
  }
  return s;
}

function computeDue(priority) {
  const p = (priority || '').toLowerCase();
  if (p.includes('критич')) return new Date(Date.now() + 7 * 86400000).toISOString();
  if (p.includes('высок')) return new Date(Date.now() + 14 * 86400000).toISOString();
  return null;
}

module.exports = { grabField, parseTaskBlocks, normalizeTitle, computeDue };
