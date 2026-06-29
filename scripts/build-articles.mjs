// Reads Markdown articles from content/articles and writes dist/articles.json for the browser.
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { marked } from "marked";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const articlesDir = join(rootDir, "content", "articles");
const outputPath = join(rootDir, "dist", "articles.json");

const files = (await readdir(articlesDir)).filter((file) => file.endsWith(".md"));

const articles = await Promise.all(
	files.map(async (file) => {
		const source = await readFile(join(articlesDir, file), "utf8");
		const { data, content } = matter(source);

		return {
			title: data.title,
			slug: data.slug,
			order: data.order,
			html: marked.parse(content),
		};
	})
);

articles.sort((a, b) => a.order - b.order);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify(articles, null, "\t"));

console.log(`Built ${articles.length} articles → dist/articles.json`);
