// Loads built articles and renders accessible tabbed article content with slug-based URL routing.

// DOM references and application state
const tabsEl = document.getElementById("article-tabs");
const panelEl = document.getElementById("article-panel");
const chapterLabelEl = document.getElementById("chapter-label");
const chaptersToggleEl = document.getElementById("chapters-toggle");
const chaptersPanelEl = document.getElementById("chapters-panel");

let articles = [];
let activeIndex = 0;

// URL routing and browser history
function getSlugFromUrl() {
	return window.location.hash.slice(1) || null;
}

function findIndexBySlug(slug) {
	return articles.findIndex((article) => article.slug === slug);
}

function updateUrl(slug, replace = false) {
	const url = `${window.location.pathname}${window.location.search}#${slug}`;

	if (replace) {
		history.replaceState({ slug }, "", url);
	} else {
		history.pushState({ slug }, "", url);
	}
}

// Tab navigation rendering
function renderTabs() {
	tabsEl.innerHTML = articles
		.map((article, index) => {
			const isActive = index === activeIndex;

			return `
				<button
					type="button"
					role="tab"
					id="tab-${article.slug}"
					aria-selected="${isActive}"
					aria-controls="article-panel"
					tabindex="${isActive ? "0" : "-1"}"
					data-index="${index}"
				>
					${article.title}
				</button>
			`;
		})
		.join("");
}

// Article panel rendering
function renderPanel() {
	const article = articles[activeIndex];
	const nextArticle = articles[activeIndex + 1];

	panelEl.setAttribute("aria-labelledby", `tab-${article.slug}`);
	chapterLabelEl.textContent = `Chapter ${article.order}`;

	const nextChapterLink = nextArticle
		? `<a class="next-chapter" href="#${nextArticle.slug}" data-next-index="${activeIndex + 1}">Next chapter</a>`
		: "";

	panelEl.innerHTML = article.html + nextChapterLink;
}

// Active tab state management
function setActiveTab(index, { updateHistory = true, replaceHistory = false } = {}) {
	activeIndex = index;
	renderTabs();
	renderPanel();

	if (updateHistory) {
		updateUrl(articles[index].slug, replaceHistory);
	}
}

function activateFromUrl({ updateHistory = false, replaceHistory = false } = {}) {
	const slug = getSlugFromUrl();
	const index = slug ? findIndexBySlug(slug) : 0;
	const validIndex = index >= 0 ? index : 0;

	setActiveTab(validIndex, {
		updateHistory: updateHistory || !slug || index < 0,
		replaceHistory: replaceHistory || !slug || index < 0,
	});
}

// Mobile "Chapters" dropdown (reuses the desktop navigation, repositioned via CSS)
function isChaptersOpen() {
	return chaptersToggleEl.getAttribute("aria-expanded") === "true";
}

function setChaptersOpen(open) {
	chaptersToggleEl.setAttribute("aria-expanded", String(open));
	chaptersPanelEl.classList.toggle("max-lg:hidden", !open);
	chaptersPanelEl.classList.toggle("max-lg:flex", open);
}

function handleChaptersToggle() {
	setChaptersOpen(!isChaptersOpen());
}

function handleOutsideClick(event) {
	if (!isChaptersOpen()) return;
	if (chaptersPanelEl.contains(event.target) || chaptersToggleEl.contains(event.target)) return;

	setChaptersOpen(false);
}

function handleEscapeKey(event) {
	if (event.key !== "Escape" || !isChaptersOpen()) return;

	setChaptersOpen(false);
	chaptersToggleEl.focus();
}

// Event handlers
function handleTabClick(event) {
	const button = event.target.closest("[role='tab']");
	if (!button) return;

	setActiveTab(Number(button.dataset.index));
	setChaptersOpen(false);
}

function scrollToArticleSection() {
	const section = panelEl.closest("section");
	(section ?? panelEl).scrollIntoView({ block: "start" });
}

function handleNextChapterClick(event) {
	const link = event.target.closest(".next-chapter");
	if (!link) return;

	event.preventDefault();
	setActiveTab(Number(link.dataset.nextIndex));
	scrollToArticleSection();
}

function handleTabKeydown(event) {
	const tabs = [...tabsEl.querySelectorAll("[role='tab']")];
	const currentIndex = tabs.indexOf(document.activeElement);
	if (currentIndex === -1) return;

	let nextIndex = currentIndex;

	if (event.key === "ArrowDown") {
		nextIndex = (currentIndex + 1) % tabs.length;
	} else if (event.key === "ArrowUp") {
		nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
	} else if (event.key === "Home") {
		nextIndex = 0;
	} else if (event.key === "End") {
		nextIndex = tabs.length - 1;
	} else {
		return;
	}

	event.preventDefault();
	setActiveTab(nextIndex);
	tabsEl.querySelector(`[data-index="${nextIndex}"]`).focus();
}

function handlePopState() {
	const slug = history.state?.slug ?? getSlugFromUrl();
	const index = findIndexBySlug(slug);

	if (index >= 0) {
		setActiveTab(index, { updateHistory: false });
	}
}

// Initialization
async function init() {
	const response = await fetch("./dist/articles.json");

	if (!response.ok) {
		panelEl.innerHTML = "<p>Unable to load articles.</p>";
		return;
	}

	articles = await response.json();

	if (!articles.length) {
		panelEl.innerHTML = "<p>No articles found.</p>";
		return;
	}

	activateFromUrl({ replaceHistory: true });

	tabsEl.addEventListener("click", handleTabClick);
	tabsEl.addEventListener("keydown", handleTabKeydown);
	panelEl.addEventListener("click", handleNextChapterClick);
	chaptersToggleEl.addEventListener("click", handleChaptersToggle);
	document.addEventListener("click", handleOutsideClick);
	document.addEventListener("keydown", handleEscapeKey);
	window.addEventListener("popstate", handlePopState);
}

init();
