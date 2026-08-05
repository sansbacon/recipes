const fs = require('fs');
const path = require('path');

const recipesDir = path.join(__dirname, '..', 'recipes');
const outputFile = path.join(__dirname, '..', 'search-index.json');

function slugToUrl(slug) {
  const baseName = slug.replace(/\.md$/i, '');
  return `recipe.html#${baseName}`;
}

function extractTitle(markdown, filename) {
  const titleLine = markdown.split('\n').find(line => line.trim().startsWith('# '));
  if (titleLine) {
    return titleLine.replace(/^# /, '').trim();
  }
  return filename.replace(/\.md$/i, '').replace(/-/g, ' ');
}

function stripMarkdown(markdown) {
  return markdown
    .replace(/\r/g, ' ')
    .replace(/\n+/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/!\[[^\]]*\]\([^\)]+\)/g, ' ')
    .replace(/\[[^\]]*\]\([^\)]+\)/g, ' $1 ')
    .replace(/>\s?/g, ' ')
    .replace(/[#*\-~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildIndex() {
  const files = fs.readdirSync(recipesDir, { withFileTypes: true })
    .filter(dirent => dirent.isFile())
    .map(dirent => dirent.name)
    .filter(name => !name.startsWith('_'))
    .sort();

  const docs = files.map(filename => {
    const fullPath = path.join(recipesDir, filename);
    const content = fs.readFileSync(fullPath, 'utf8');
    return {
      title: extractTitle(content, filename),
      url: slugToUrl(filename),
      content: stripMarkdown(content),
    };
  });

  fs.writeFileSync(outputFile, JSON.stringify(docs, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${docs.length} documents to ${outputFile}`);
}

buildIndex();
