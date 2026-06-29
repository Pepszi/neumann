// Loads built articles and renders accessible tabbed article content.
const tabsEl = document.getElementById("article-tabs");
const panelEl = document.getElementById("article-panel");

let articles = [];
let activeIndex = 0;

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

function setActiveTab(index) {
	activeIndex = index;
	renderTabs();
	renderPanel();
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

	renderTabs();
	renderPanel();

	tabsEl.addEventListener("click", handleTabClick);
	tabsEl.addEventListener("keydown", handleTabKeydown);
}

init();
