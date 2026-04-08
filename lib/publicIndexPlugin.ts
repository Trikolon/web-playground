import { promises as fs } from 'fs';
import { Plugin } from 'vite';
import { glob } from 'glob';
import dedent from 'dedent';

function extractHTMLTitle(html: string): string {
  const match = html.match(/<title>(.*?)<\/title>/);
  return match?.[1].trim() || '';
}

function extractScriptTitle(script: string): string {
  const match = script.match(/^\/\/\s*title:(.*)/im);
  return match?.[1].trim() || '';
}

async function writeIfChanged(filePath: string | URL, content: string) {
  const current = await fs.readFile(filePath, 'utf8').catch(() => null);
  if (current !== content) await fs.writeFile(filePath, content);
}

async function getRepositoryUrl() {
  // Load repo URL from package.json
  const pkg = JSON.parse(await fs.readFile('./package.json', 'utf-8'));

  return pkg.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, '');
}

export function publicIndexPlugin(): Plugin {
  async function generateIndex() {
    const paths = [
      ...(await glob('public/*/index.html')),
      ...(await glob('src/routes/*/index.ts')),
    ];

    const entries = (
      await Promise.all(
        paths.map(async (path) => {
          const dirName =
            /^(public|src\/routes)\/([^/]*)\/index\.(html|ts)$/.exec(
              path,
            )?.[2]!;

          const fileContent = await fs.readFile(
            new URL('../' + path, import.meta.url),
            'utf8',
          );

          const title = path.endsWith('.html')
            ? extractHTMLTitle(fileContent)
            : extractScriptTitle(fileContent);

          return [dirName, title];
        }),
      )
    ).sort((a, b) => a[0].localeCompare(b[0]));

    const links = entries
      .map(
        ([dirName, title]) => dedent`
          <a href="/${dirName}/">
            <span class="name">${dirName}</span>
            ${title ? `<span class="desc">${title}</span>` : ''}
          </a>
        `,
      )
      .join('\n');

    let footer = '';
    let repoUrl = await getRepositoryUrl();
    // Only add a footer if we have the repository URL.
    if (repoUrl) {
      const shortUrl = new URL(repoUrl).host + new URL(repoUrl).pathname;
      footer = dedent`
        <footer>
          Source: <a href="${repoUrl}">${shortUrl}</a>
        </footer>
      `;
    }

    const html = dedent`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Web Playground</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #333;
            background: #fff;
          }
          main {
            max-width: 720px;
            margin: 0 auto;
            padding: 2rem 1.5rem;
          }
          h1 { font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem; }
          nav { display: flex; flex-direction: column; gap: 0.25rem; }
          nav a {
            display: block;
            padding: 0.6rem 0.75rem;
            border-radius: 6px;
            text-decoration: none;
            color: inherit;
            transition: background 0.15s;
          }
          nav a:hover { background: #f0f0f0; }
          nav a:focus-visible { outline: 2px solid #0969da; outline-offset: 2px; }
          nav .name { color: #0969da; font-weight: 500; }
          nav .desc { color: #666; margin-left: 0.25rem; }
          footer {
            max-width: 720px;
            margin: 1.5rem auto 0;
            padding: 1rem 1.5rem 2rem;
            border-top: 1px solid #e5e5e5;
            font-size: 0.85rem;
            color: #737373;
          }
          footer a { color: #737373; }
          @media (prefers-color-scheme: dark) {
            body { color: #e0e0e0; background: #1a1a1a; }
            nav a:hover { background: #2a2a2a; }
            nav a:focus-visible { outline-color: #58a6ff; }
            nav .name { color: #58a6ff; }
            nav .desc { color: #999; }
            footer { border-top-color: #333; color: #999; }
            footer a { color: #999; }
          }
        </style>
      </head>
      <body>
        <main>
          <h1>Web Playground</h1>
          <nav>
      ${links}
          </nav>
        </main>
        ${footer}
      </body>
      </html>
    `;

    const indexPath = new URL('../public/index.html', import.meta.url);

    await writeIfChanged(indexPath, html);
  }

  return {
    name: 'vite-plugin-public-index',
    async buildStart() {
      await generateIndex();
    },
    async handleHotUpdate() {
      await generateIndex();
    },
  };
}
