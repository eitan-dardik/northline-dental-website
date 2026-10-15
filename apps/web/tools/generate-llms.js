#!/usr/bin/env node
import { pathToFileURL } from 'url';
import fs from 'fs';
import path from 'path';

const CLEAN_CONTENT_REGEX = {
	comments: /\/\*[\s\S]*?\*\/|\/\/.*$/gm,
	templateLiterals: /`[\s\S]*?`/g,
	strings: /'[^']*'|"[^"]*"/g,
	jsxExpressions: /\$?\{.*?\}/g,
	htmlEntities: {
		quot: /&quot;/g,
		amp: /&amp;/g,
		lt: /&lt;/g,
		gt: /&gt;/g,
		apos: /&apos;/g
	}
};

const EXTRACTION_REGEX = {
	// `element={<Page />}` puts a `>` inside the tag, so the attribute scan has
	// to step over brace groups instead of stopping at the first `>`.
	route: /<Route\s+(?:[^>{]|\{[^}]*\})*\/?>/g,
	path: /path=["']([^"']+)["']/,
	element: /element=\{([\s\S]*)\}/,
	elementComponent: /<(\w+)/g,
	helmet: /<Helmet[^>]*?>([\s\S]*?)<\/Helmet>/i,
	helmetTest: /<Helmet[\s\S]*?<\/Helmet>/i,
	title: /<title[^>]*?>\s*([\s\S]*?)\s*<\/title>/i,
	// Three forms: content={`template`}  |  content="string"  |  content={expression}
	description: /<meta\s+name=["']description["']\s+content=(?:\{`([\s\S]*?)`\}|["']([\s\S]*?)["']|\{([^}]*)\})/i
};

function cleanContent(content) {
	return content
		.replace(CLEAN_CONTENT_REGEX.comments, '')
		.replace(CLEAN_CONTENT_REGEX.templateLiterals, '""')
		.replace(CLEAN_CONTENT_REGEX.strings, '""');
}

function cleanText(text) {
	if (!text) return text;

	return text
		.replace(CLEAN_CONTENT_REGEX.jsxExpressions, '')
		.replace(CLEAN_CONTENT_REGEX.htmlEntities.quot, '"')
		.replace(CLEAN_CONTENT_REGEX.htmlEntities.amp, '&')
		.replace(CLEAN_CONTENT_REGEX.htmlEntities.lt, '<')
		.replace(CLEAN_CONTENT_REGEX.htmlEntities.gt, '>')
		.replace(CLEAN_CONTENT_REGEX.htmlEntities.apos, "'")
		.trim();
}

// Values the page expressions can reference — mirrors the variables the pages use.
// Filled in by main(). If a page starts using a new variable in its <Helmet>, add it here.
const scope = {};

function evaluate(code) {
	return new Function(...Object.keys(scope), `return (${code});`)(...Object.values(scope));
}

function tidy(text) {
	return text
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/\s+/g, ' ')
		.trim();
}

// Evaluates JSX text ({expr}) or template-literal text (${expr}).
// Falls back to the old strip-the-braces behavior if anything can't be resolved.
function resolveText(raw, { jsx }) {
	if (!raw) return raw;
	let body = raw.replace(/`/g, '\\`');
	if (jsx) body = body.replace(/\{([^}]*)\}/g, '${$1}');
	try {
		return tidy(evaluate(`\`${body}\``));
	} catch {
		return cleanText(raw);
	}
}

// Evaluates a plain JS expression, e.g. content={services.map(...).join(', ')}
function resolveExpression(raw) {
	try {
		return tidy(String(evaluate(raw)));
	} catch {
		return null;
	}
}

function extractRoutes(appJsxPath) {
	if (!fs.existsSync(appJsxPath)) return new Map();

	try {
		const content = fs.readFileSync(appJsxPath, 'utf8');
		const routes = new Map();
		const routeMatches = [...content.matchAll(EXTRACTION_REGEX.route)];

		for (const match of routeMatches) {
			const routeTag = match[0];
			const pathMatch = routeTag.match(EXTRACTION_REGEX.path);
			const elementMatch = routeTag.match(EXTRACTION_REGEX.element);
			const isIndex = routeTag.includes('index');

			if (elementMatch) {
				// A guarded route reads `element={<ProtectedRoute><SettingsPage /></ProtectedRoute>}`,
				// so the page is the innermost component rather than the first one.
				const componentNames = [...elementMatch[1].matchAll(EXTRACTION_REGEX.elementComponent)];
				const componentName = componentNames.at(-1)?.[1];

				if (!componentName) continue;

				let routePath;

				if (isIndex) {
					routePath = '/';
				} else if (pathMatch) {
					routePath = pathMatch[1].startsWith('/') ? pathMatch[1] : `/${pathMatch[1]}`;
				}

				routes.set(componentName, routePath);
			}
		}

		return routes;
	} catch (error) {
		return new Map();
	}
}

function findReactFiles(dir) {
	return fs.readdirSync(dir).map(item => path.join(dir, item));
}

function extractHelmetData(content, filePath, routes) {
	const cleanedContent = cleanContent(content);

	if (!EXTRACTION_REGEX.helmetTest.test(cleanedContent)) {
		return null;
	}

	const helmetMatch = content.match(EXTRACTION_REGEX.helmet);
	if (!helmetMatch) return null;

	const helmetContent = helmetMatch[1];
	const titleMatch = helmetContent.match(EXTRACTION_REGEX.title);
	const descMatch = helmetContent.match(EXTRACTION_REGEX.description);

	const title = resolveText(titleMatch?.[1], { jsx: true });
	const description = descMatch?.[3]
		? resolveExpression(descMatch[3])
		: resolveText(descMatch?.[1] ?? descMatch?.[2], { jsx: false });

	const fileName = path.basename(filePath, path.extname(filePath));
	const url = routes.size && routes.has(fileName)
		? routes.get(fileName)
		: generateFallbackUrl(fileName);

	return {
		url,
		title: title || 'Untitled Page',
		description: description || 'No description available'
	};
}

function generateFallbackUrl(fileName) {
	const cleanName = fileName.replace(/Page$/, '').toLowerCase();
	return cleanName === 'app' ? '/' : `/${cleanName}`;
}

function generateLlmsTxt(pages) {
	const sortedPages = pages.sort((a, b) => a.url.localeCompare(b.url));
	const pageEntries = sortedPages.map(page =>
		`- [${page.title}](${page.url}): ${page.description}`
	).join('\n');

	const c = scope.config?.customer;
	const header = c
		? `# ${c.name}\n\n> ${c.tagline}. Serving ${c.city}, ${c.state} since ${c.established}.\n\n`
		: '';

	return `${header}## Pages\n${pageEntries}\n`;
}

function ensureDirectoryExists(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}

function processPageFile(filePath, routes) {
	try {
		const content = fs.readFileSync(filePath, 'utf8');
		return extractHelmetData(content, filePath, routes);
	} catch (error) {
		console.error(`❌ Error processing ${filePath}:`, error.message);
		return null;
	}
}

async function main() {
	const src = path.join(process.cwd(), 'src');

	// Load the same data the pages use, so their <Helmet> expressions can be evaluated.
	try {
		const { config } = await import(pathToFileURL(path.join(src, 'lib', 'config', 'index.js')).href);
		scope.config = config;
		scope.services = config.services || []; // ServicesPage: const services = config.services || [];
	} catch (error) {
		console.warn(`⚠️  Could not load config (${error.message})`);
	}
	try {
		const { ACTIVE_LOCATIONS } = await import(pathToFileURL(path.join(src, 'lib', 'locations.js')).href);
		scope.locationCount = ACTIVE_LOCATIONS.length; // AboutPage: const locationCount = ACTIVE_LOCATIONS.length;
	} catch (error) {
		console.warn(`⚠️  Could not load locations (${error.message})`);
	}

	const pagesDir = path.join(src, 'pages');
	const appJsxPath = path.join(src, 'App.jsx');

	let pages = [];

	if (!fs.existsSync(pagesDir)) {
		pages.push(processPageFile(appJsxPath, new Map()));
		pages = pages.filter(Boolean);
	} else {
		const routes = extractRoutes(appJsxPath);
		const reactFiles = findReactFiles(pagesDir);

		pages = reactFiles
			.map(filePath => processPageFile(filePath, routes))
			.filter(Boolean);
	}

	if (pages.length === 0) {
		console.error('❌ No pages with Helmet components found!');
		process.exit(1);
	}

	const llmsTxtContent = generateLlmsTxt(pages);
	const outputPath = path.join(process.cwd(), 'public', 'llms.txt');

	ensureDirectoryExists(path.dirname(outputPath));
	fs.writeFileSync(outputPath, llmsTxtContent, 'utf8');
}

const isMainModule = import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
	main().catch(error => {
		console.error(error);
		process.exit(1);
	});
}