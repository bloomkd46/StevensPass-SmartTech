import axios from 'axios';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { copyFileSync, existsSync, lstatSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';

const ci = !!process.env['CI'];
if (ci) {
  console.log('::group::Starting Build');
}
const log = {
  debug: (...message: unknown[]): void => console.debug(chalk.dim('>', ...message)),
  info: (...message: unknown[]): void => ci ? console.log(`::endgroup::\n::group::${message.shift()}\n`, ...message) : console.log(...message),
  warn: (...message: unknown[]): void => console.warn(`${ci ? '::warning::' : ''}${chalk.yellowBright(...message)}`),
  error: (...message: unknown[]): void => console.error(`${ci ? '::error::' : ''}${chalk.redBright(...message)}`),
  success: (...message: unknown[]): void => console.log(chalk.greenBright(...message)),
  notice: (...message: unknown[]): void => console.log(ci ? '::notice::' : '', chalk.cyanBright(...message)),
};


function build() {
  log.debug('Compiling Project');
  try {
    execSync('yarn build');
  } catch (error) {
    log.error('Failed to Compile Project:', error, (error as Record<string, string>)['stderr'].toString());
    process.exit(1);
  }
}
function format404() {
  log.debug('Moving 404 Page From 404 Dir To Base Dir');
  copyFileSync(join(__dirname, '../dist/stevens-pass-smart-tech/browser/404/index.html'), join(__dirname, '../dist/stevens-pass-smart-tech/browser/404.html'));
  log.debug('Removing 404 Dir');
  rmSync(join(__dirname, '../dist/stevens-pass-smart-tech/browser/404/'), { recursive: true });
}
async function sitemap() {
  const sitemap: string[] = [];
  const rootDir = join(__dirname, '../dist/stevens-pass-smart-tech/browser');

  function scanDirectory(directory: string) {
    const items = readdirSync(directory);
    items.forEach(item => {
      const fullPath = join(directory, item);
      if (lstatSync(fullPath).isDirectory()) {
        scanDirectory(fullPath);
      } else if (item === 'index.html') {
        const sitemapEntry = fullPath.replace(rootDir, '').replace('index.html', '');
        log.debug(`Adding Page '${sitemapEntry}'`);
        sitemap.push(sitemapEntry);
      }
    });
  }

  scanDirectory(rootDir);
  log.debug('Fetching Old Sitemap');
  let oldSitemap: Record<string, string> = {};
  try {
    const response = await axios.get('https://smart-tech.digigoat.app/sitemap.json');
    oldSitemap = response.data;
  } catch (error) {
    log.error('Failed to fetch old sitemap:', error);
    log.warn('↳ Generating New Sitemap');
  }
  log.debug('Writing sitemap.json');

  const newSitemap: Record<string, string> = {};
  const imageSitemap: Record<string, string[]> = {};
  const changedPages: string[] = [];
  for (const page of Object.keys(oldSitemap)) {
    if (!sitemap.includes(page)) {
      log.debug(`Page removed: ${page}`);
      changedPages.push(page);
    }
  }
  for (const page of sitemap) {
    const fullPageUrl = `https://smart-tech.digigoat.app${page}`;
    const newPagePath = join(rootDir, page, 'index.html');
    const prevPagePath = join(__dirname, '../previous-deploy/browser', page, 'index.html');

    let oldTitle: string | null = null;
    let oldMetaDescription: string | null = null;
    let usedArtifact = false;

    if (existsSync(prevPagePath)) {
      log.debug(`Reading previous deploy content from: ${prevPagePath}`);
      const prevPageContent = readFileSync(prevPagePath, 'utf-8');
      const oldTitleMatch = prevPageContent.match(/<title>(.*?)<\/title>/);
      const oldMetaDescriptionMatch = prevPageContent.match(/<meta name="description" content="(.*?)"/);
      oldTitle = oldTitleMatch ? oldTitleMatch[1] : null;
      oldMetaDescription = oldMetaDescriptionMatch ? oldMetaDescriptionMatch[1] : null;
      usedArtifact = true;
    } else {
      log.warn(`Previous deploy file not found for page: ${page}, falling back to HTTP fetch.`);
      try {
        log.debug(`Fetching page: ${fullPageUrl}`);
        const response = await axios.get(fullPageUrl);
        const oldTitleMatch = response.data.match(/<title>(.*?)<\/title>/);
        const oldMetaDescriptionMatch = response.data.match(/<meta name="description" content="(.*?)"/);
        oldTitle = oldTitleMatch ? oldTitleMatch[1] : null;
        oldMetaDescription = oldMetaDescriptionMatch ? oldMetaDescriptionMatch[1] : null;
      } catch (error) {
        log.error(`Failed to fetch or parse page ${fullPageUrl} With Error:`, error);
        log.warn('↳ Generating New Sitemap Entry');
        newSitemap[page] = new Date().toISOString();
        changedPages.push(page);
        continue;
      }
    }

    log.debug(`Reading new page content from: ${newPagePath}`);
    const newPageContent = readFileSync(newPagePath, 'utf-8');
    const newTitleMatch = newPageContent.match(/<title>(.*?)<\/title>/);
    const newMetaDescriptionMatch = newPageContent.match(/<meta name="description" content="(.*?)"/);
    const ogImageMatches = newPageContent.matchAll(/<meta property="og:image" content="(.+?)"/g);

    const newTitle = newTitleMatch ? newTitleMatch[1] : null;
    const newMetaDescription = newMetaDescriptionMatch ? newMetaDescriptionMatch[1] : null;
    const ogImages = Array.from(ogImageMatches).map(match => match[1]);
    imageSitemap[page] = ogImages;

    if (oldTitle === newTitle && oldMetaDescription === newMetaDescription) {
      log.debug(`No changes detected for page: ${page} (${usedArtifact ? 'artifact' : 'http'})`);
      newSitemap[page] = oldSitemap[page] || new Date().toISOString();
    } else {
      log.debug(`Changes detected for page: ${page} (${usedArtifact ? 'artifact' : 'http'})`);
      newSitemap[page] = new Date().toISOString();
      changedPages.push(page);
    }
  }
  writeFileSync(join(__dirname, '../dist/stevens-pass-smart-tech/browser/sitemap.json'), JSON.stringify(newSitemap, null, 2));
  log.debug('Writing sitemap.xml');
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${sitemap.map(page => `
  <url>
    <loc>https://smart-tech.digigoat.app${page}</loc>
    <lastmod>${newSitemap[page]}</lastmod>${imageSitemap[page]?.map(image => `
    <image:image>
      <image:loc>${image}</image:loc>
    </image:image>`).join('')}
  </url>`).join('')}
</urlset>`;
  writeFileSync(join(__dirname, '../dist/stevens-pass-smart-tech/browser/sitemap.xml'), sitemapXml);
  if (changedPages.length) {
    log.info('Notifying IndexNow of Changes', changedPages);
    await indexNow(changedPages);
    if (process.env['GITHUB_OUTPUT']) {
      log.notice('Changes detected during build');
      writeFileSync(process.env['GITHUB_OUTPUT'], 'changes=true\n', { flag: 'a' });
    }
  } else if (process.env['GITHUB_OUTPUT']) {
    log.notice('No changes detected during build');
    writeFileSync(process.env['GITHUB_OUTPUT'], 'changes=false\n', { flag: 'a' });
  }
}

async function indexNow(pages: string[]) {
  const apiUrl = 'https://api.indexnow.org/indexnow';

  const urls = pages.map(page => `https://smart-tech.digigoat.app${page}`);
  const key = '4a6b2e79f6d94d91b04e58bba889a414';
  const body = {
    host: 'https://smart-tech.digigoat.app',
    key: key,
    keyLocation: `https://smart-tech.digigoat.app/${key}.txt`,
    urlList: urls
  };

  try {
    log.debug('Submitting URLs to IndexNow');
    log.debug(JSON.stringify(body, null, 2));
    if (ci) {
      // Instead of executing, output the curl command for a later job
      if (process.env['GITHUB_OUTPUT']) {
        const curlCmd = [
          //'curl', - will be present in the job
          '-X', 'POST',
          '-H', '"Content-Type: application/json"',
          '-d', `'${JSON.stringify(body)}'`,
          `"${apiUrl}"`
        ].join(' ');
        writeFileSync(process.env['GITHUB_OUTPUT'], `indexnow_curl=${curlCmd}\n`, { flag: 'a' });
        log.debug('Wrote curl command for IndexNow to GITHUB_OUTPUT');
      } else {
        log.error('GITHUB_OUTPUT not set, cannot output curl command');
      }
    } else {
      log.warn('Skipping IndexNow Submission Due To Local Deployment');
    }
  } catch (error) {
    log.error('Error preparing IndexNow curl command:', error);
  }
}

function robots() {
  log.debug('Writing robots.txt');
  writeFileSync(join(__dirname, '../dist/stevens-pass-smart-tech/browser/robots.txt'),
    `# Allow all URLs (see https://www.robotstxt.org/robotstxt.html)
User-agent: *
Disallow: /setup
Sitemap: https://smart-tech.digigoat.app/sitemap.xml`);
}
(async () => {
  log.info('Building...');
  build();
  log.info('Formatting 404...');
  format404();
  log.info('Generating Sitemap...');
  if (ci) {
    await sitemap();
  } else {
    log.error('Skipping Sitemap Generation Due To Local Deployment');
  }
  log.info('Generating Robots.txt...');
  robots();
  if (ci) {
    console.log('::endgroup::');
  }
  log.success('Done.');
})();
