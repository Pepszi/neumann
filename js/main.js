// Loads built articles and renders an animated accordion with slug-based URL routing.

const accordionEl = document.getElementById("articles-accordion");

const ACCORDION_DURATION = 0.45;
const ACCORDION_EASE = "power2.out";

let articles = [];
let activeIndex = -1;
let isAnimating = false;

function prefersReducedMotion() {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

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

function getArticleItem(index) {
	return accordionEl.querySelector(`.article-item[data-index="${index}"]`);
}

function getPanel(item) {
	return item.querySelector(".article-panel");
}

function getTrigger(item) {
	return item.querySelector(".article-collapsed");
}

function getPanelInner(item) {
	return getPanel(item).querySelector(".article-panel-inner");
}

function measureInnerHeight(inner) {
	gsap.set(inner, {
		height: "auto",
		position: "absolute",
		visibility: "hidden",
		width: "100%",
		left: 0,
		right: 0,
		pointerEvents: "none",
	});
	const height = inner.offsetHeight;
	gsap.set(inner, {
		height: 0,
		clearProps: "position,visibility,width,left,right,pointerEvents",
	});
	return height;
}

function setCollapsedState(item) {
	const panel = getPanel(item);
	const inner = getPanelInner(item);
	const trigger = getTrigger(item);

	item.classList.remove("is-open");
	trigger.setAttribute("aria-expanded", "false");
	trigger.hidden = false;
	panel.hidden = true;
	gsap.set(panel, { clearProps: "overflow" });
	gsap.set(inner, { clearProps: "height,overflow" });
}

function setExpandedState(item) {
	const panel = getPanel(item);
	const inner = getPanelInner(item);
	const trigger = getTrigger(item);

	item.classList.add("is-open");
	trigger.setAttribute("aria-expanded", "true");
	trigger.hidden = true;
	panel.hidden = false;
	gsap.set(panel, { clearProps: "overflow" });
	gsap.set(inner, { height: "auto", clearProps: "overflow" });
}

function buildAccordion() {
	accordionEl.innerHTML = articles
		.map(
			(article, index) => `
			<div class="article-item" data-index="${index}" data-slug="${article.slug}">
				<button
					type="button"
					id="article-header-${article.slug}"
					class="article-collapsed w-full cursor-pointer border-t border-r border-black pt-5 pr-5 text-left"
					aria-expanded="false"
					aria-controls="article-panel-${article.slug}"
					data-index="${index}"
				>
					<span class="article-chapter">Chapter ${article.order}</span>
					<div class="article-collapsed-copy">
						<span class="article-title">${article.title}</span>
						${article.subtitle ? `<p class="article-subtitle">${article.subtitle}</p>` : ""}
					</div>
				</button>
				<div
					id="article-panel-${article.slug}"
					class="article-panel"
					role="region"
					aria-labelledby="article-header-${article.slug}"
					hidden
				>
					<div class="article-panel-inner">
						<div class="article-expanded flex">
							<div class="chapter-label-col shrink-0 self-start border-t border-l border-black">
								<div class="chapter-label-inner">
									<span class="article-chapter chapter-label-vertical">Chapter ${article.order}</span>
									<span class="chapter-label-spacer" aria-hidden="true"></span>
								</div>
							</div>
							<article
								id="article-${article.slug}"
								class="article-content min-w-0 flex-1 space-y-5 border-t border-r border-black pt-5 pr-5 pb-5"
							>
								${article.html}
							</article>
						</div>
					</div>
				</div>
			</div>
		`
		)
		.join("");
}

function collapsePanel(item, duration = ACCORDION_DURATION) {
	const panel = getPanel(item);
	const inner = getPanelInner(item);
	const startHeight = inner.offsetHeight;

	return gsap
		.timeline()
		.set(panel, { overflow: "hidden" })
		.set(inner, { height: startHeight, overflow: "hidden" })
		.to(inner, { height: 0, duration, ease: ACCORDION_EASE })
		.add(() => setCollapsedState(item));
}

function expandPanel(item, duration = ACCORDION_DURATION) {
	const panel = getPanel(item);
	const inner = getPanelInner(item);
	const trigger = getTrigger(item);

	item.classList.add("is-open");
	trigger.setAttribute("aria-expanded", "true");

	if (trigger === document.activeElement) {
		trigger.blur();
	}

	trigger.hidden = true;
	panel.hidden = false;

	gsap.set(panel, { overflow: "hidden" });
	gsap.set(inner, { height: 0, overflow: "hidden" });

	const targetHeight = measureInnerHeight(inner);

	return gsap.to(inner, {
		height: targetHeight,
		duration,
		ease: ACCORDION_EASE,
		onComplete: () => {
			gsap.set(inner, { height: "auto", clearProps: "overflow" });
			gsap.set(panel, { clearProps: "overflow" });
		},
	});
}

function getScrollAnchorItem(targetIndex) {
	if (targetIndex <= 0) return null;
	return getArticleItem(targetIndex - 1);
}

function scrollToPreviousArticle(targetIndex) {
	const anchorItem = getScrollAnchorItem(targetIndex);
	if (!anchorItem) return;

	anchorItem.scrollIntoView({ block: "start", behavior: "auto" });
}

function compensateLayoutShift(targetElement, previousTop) {
	const delta = targetElement.getBoundingClientRect().top - previousTop;

	if (Math.abs(delta) > 0.5) {
		window.scrollTo(0, window.scrollY + delta);
	}
}

function animateAccordion(fromIndex, toIndex) {
	const fromItem = getArticleItem(fromIndex);
	const toItem = getArticleItem(toIndex);
	const scrollAnchor = getScrollAnchorItem(toIndex) ?? toItem;
	const anchorTop = scrollAnchor.getBoundingClientRect().top;
	const timeline = gsap.timeline({
		onComplete: () => {
			isAnimating = false;
		},
	});

	isAnimating = true;
	timeline.add(collapsePanel(fromItem));
	timeline.add(() => compensateLayoutShift(scrollAnchor, anchorTop));
	timeline.add(expandPanel(toItem));
}

function setActiveArticle(
	index,
	{ updateHistory = true, replaceHistory = false, animate = true, scrollToPrevious = true } = {}
) {
	if (index === activeIndex) return;

	const previousIndex = activeIndex;
	activeIndex = index;

	if (updateHistory) {
		updateUrl(articles[index].slug, replaceHistory);
	}

	if (scrollToPrevious) {
		scrollToPreviousArticle(index);
	}

	const shouldAnimate =
		animate && !prefersReducedMotion() && typeof gsap !== "undefined" && previousIndex !== index;

	if (shouldAnimate && getArticleItem(previousIndex)?.classList.contains("is-open")) {
		animateAccordion(previousIndex, index);
		return;
	}

	articles.forEach((_, itemIndex) => {
		const item = getArticleItem(itemIndex);
		if (!item) return;

		if (itemIndex === index) {
			setExpandedState(item);
		} else {
			setCollapsedState(item);
		}
	});
}

function collapseAllArticles() {
	activeIndex = -1;

	articles.forEach((_, itemIndex) => {
		const item = getArticleItem(itemIndex);
		if (!item) return;
		setCollapsedState(item);
	});
}

function activateFromUrl({ updateHistory = false, replaceHistory = false, animate = false } = {}) {
	const slug = getSlugFromUrl();

	if (!slug) {
		collapseAllArticles();
		return;
	}

	const index = findIndexBySlug(slug);

	if (index < 0) {
		collapseAllArticles();

		if (replaceHistory) {
			history.replaceState({}, "", `${window.location.pathname}${window.location.search}`);
		}

		return;
	}

	activeIndex = index;

	articles.forEach((_, itemIndex) => {
		const item = getArticleItem(itemIndex);
		if (!item) return;

		if (itemIndex === index) {
			setExpandedState(item);
		} else {
			setCollapsedState(item);
		}
	});

	if (updateHistory) {
		updateUrl(articles[index].slug, replaceHistory);
	}
}

function handleAccordionClick(event) {
	if (isAnimating) return;

	const collapsedButton = event.target.closest(".article-collapsed");
	if (!collapsedButton) return;

	collapsedButton.blur();
	setActiveArticle(Number(collapsedButton.dataset.index));
}

function handlePopState() {
	if (isAnimating) return;

	const slug = history.state?.slug ?? getSlugFromUrl();

	if (!slug) {
		collapseAllArticles();
		return;
	}

	const index = findIndexBySlug(slug);

	if (index >= 0 && index !== activeIndex) {
		setActiveArticle(index, {
			updateHistory: false,
			animate: !prefersReducedMotion(),
			scrollToPrevious: false,
		});
	}
}

async function init() {
	const response = await fetch("./dist/articles.json");

	if (!response.ok) {
		accordionEl.innerHTML = "<p>Unable to load articles.</p>";
		return;
	}

	articles = await response.json();

	if (!articles.length) {
		accordionEl.innerHTML = "<p>No articles found.</p>";
		return;
	}

	buildAccordion();
	activateFromUrl({ replaceHistory: true });

	accordionEl.addEventListener("click", handleAccordionClick);
	window.addEventListener("popstate", handlePopState);
}

init();
