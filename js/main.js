// Loads built articles and renders accessible tabbed article content with slug-based URL routing.
const tabsEl = document.getElementById("article-tabs");
const panelEl = document.getElementById("article-panel");

let articles = [];
let activeIndex = 0;

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
					aria-controls="panel-${article.slug}"
					tabindex="${isActive ? "0" : "-1"}"
					data-index="${index}"
				>
					${article.title}
				</button>
			`;
		})
		.join("");
}

function renderPanel() {
	const article = articles[activeIndex];

	panelEl.id = `panel-${article.slug}`;
	panelEl.setAttribute("aria-labelledby", `tab-${article.slug}`);
	panelEl.innerHTML = article.html;
}

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

function handleTabClick(event) {
	const button = event.target.closest("[role='tab']");
	if (!button) return;

	setActiveTab(Number(button.dataset.index));
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
	window.addEventListener("popstate", handlePopState);
}

init();
