/**
 * [INPUT]: 依赖 prompt-repository 的提示词数据契约、i18n 的 14 语界面文案与 workflow-copy 的分类说明
 * [OUTPUT]: 对外提供 README、媒体表格、模型介绍、分类分组和 CTA 的 Markdown 生成能力
 * [POS]: scripts/utils 的核心展示层，把 Muse Image 结构化数据渲染为 GitHub 原生页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { Prompt, FilterCategory, OfficialCaseGroup, OfficialCase } from "./prompt-repository.js";
import { t } from "./i18n.js";
import { workflowDescription } from "./workflow-copy.js";

interface SortedPrompts {
  all: Prompt[];
  featured: Prompt[];
  regular: Prompt[];
  stats: {
    total: number;
    featured: number;
  };
  categories?: FilterCategory[];
  officialCases?: OfficialCaseGroup[];
}

export interface WorkflowPromptGroup {
  category: FilterCategory;
  prompts: Prompt[];
}

export interface LanguageConfig {
  code: string;
  name: string;
  readmeFileName: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: "en", name: "English", readmeFileName: "README.md" },
  { code: "zh", name: "简体中文", readmeFileName: "README_zh.md" },
  { code: "ja-JP", name: "日本語", readmeFileName: "README_ja-JP.md" },
  { code: "ko-KR", name: "한국어", readmeFileName: "README_ko-KR.md" },
  { code: "es-ES", name: "Español", readmeFileName: "README_es-ES.md" },
  { code: "de-DE", name: "Deutsch", readmeFileName: "README_de-DE.md" },
  { code: "fr-FR", name: "Français", readmeFileName: "README_fr-FR.md" },
  { code: "it-IT", name: "Italiano", readmeFileName: "README_it-IT.md" },
  { code: "pt-PT", name: "Português", readmeFileName: "README_pt-PT.md" },
  { code: "tr-TR", name: "Türkçe", readmeFileName: "README_tr-TR.md" },
  { code: "ar-SA", name: "العربية", readmeFileName: "README_ar-SA.md" },
  { code: "ru-RU", name: "Русский", readmeFileName: "README_ru-RU.md" },
  { code: "nl-NL", name: "Nederlands", readmeFileName: "README_nl-NL.md" },
  { code: "pl-PL", name: "Polski", readmeFileName: "README_pl-PL.md" },
];

const MAX_REGULAR_PROMPTS_TO_DISPLAY = 120;
const REPO = "imagineVid/Awesome-muse-image-prompts-and-skills";
const REPO_URL = `https://github.com/${REPO}`;
const MUSE_IMAGE_PRODUCT_URL = "https://imaginevid.io/ai-image-generator";
const META_MUSE_RELEASE_URL = "https://ai.meta.com/blog/introducing-muse-image-muse-video-msl/";
const META_AI_URL = "https://about.fb.com/news/2026/07/introducing-muse-image-meta-ai/";
const IMAGINEVID_LOCALE_BY_README: Record<string, string> = {
  "ar-SA": "ar",
  "de-DE": "de",
  "es-ES": "es",
  "fr-FR": "fr",
  "it-IT": "it",
  "ja-JP": "ja",
  "ko-KR": "ko",
  "nl-NL": "nl",
  "pl-PL": "pl",
  "pt-PT": "pt",
  "ru-RU": "ru",
  "tr-TR": "tr",
  zh: "zh",
};

export function getMuseImageProductUrl(locale: string): string {
  const productLocale = IMAGINEVID_LOCALE_BY_README[locale];
  return productLocale
    ? `https://imaginevid.io/${productLocale}/ai-image-generator`
    : MUSE_IMAGE_PRODUCT_URL;
}

export function getPromptCtaLabel(locale: string): string {
  return locale === "en" ? "Use this prompt on ImagineVid" : `${t("tryItNow", locale)} · ImagineVid`;
}

function cleanPromptContent(content: string): string {
  if (!content) return content;
  return content
    .replace(/^```[\w-]*\s*\n?/im, "")
    .replace(/\n?```\s*$/im, "")
    .replace(/\n```[\w-]*\s*\n/g, "\n")
    .trim();
}

export function generateMarkdown(data: SortedPrompts, total: number, locale = "en"): string {
  const { featured, regular, stats, categories } = data;
  const displayedRegular = regular.slice(0, MAX_REGULAR_PROMPTS_TO_DISPLAY);
  const hiddenCount = total - displayedRegular.length - featured.length;
  const officialCases = data.officialCases || [];

  let md = generateHeader(locale);
  md += generateLanguageNavigation(locale);
  md += generateCollectionCTA(categories || [], locale);
  md += generateTOC(locale, {
    hasOfficialCases: officialCases.length > 0,
    hasFeatured: featured.length > 0,
    hasCommunityPrompts: featured.length + displayedRegular.length + hiddenCount > 0,
  });
  md += generateModelIntroduction(locale);
  md += generateOfficialCasesSection(officialCases, locale);
  md += generateStats(stats, locale);
  md += generateFeaturedSection(featured, locale);
  md += generateAllPromptsSection(
    [...featured, ...displayedRegular],
    Math.max(0, hiddenCount),
    categories || [],
    locale
  );
  md += generateContribute(locale);
  md += generateFooter(locale, data.all);

  return md;
}

function generateHeader(locale: string): string {
  const coverImage = "public/images/muse-image-prompt-skills-cover.png";

  return `<a href="${REPO_URL}">
  <img src="${coverImage}" alt="Muse Image Prompt Skills" width="100%" />
</a>

> ${t("relatedPromo", locale)}
# ${t("title", locale)}

[![Awesome](https://awesome.re/badge.svg)](https://github.com/sindresorhus/awesome)
[![GitHub stars](https://img.shields.io/github/stars/${REPO}?style=social)](${REPO_URL})
[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![Update README](https://github.com/${REPO}/actions/workflows/update-readme.yml/badge.svg)](https://github.com/${REPO}/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](docs/CONTRIBUTING.md)

> ${t("subtitle", locale)}

> ${t("copyright", locale)}

---

`;
}

function generateLanguageNavigation(currentLocale: string): string {
  const badges = SUPPORTED_LANGUAGES.map((lang) => {
    const isCurrent = lang.code === currentLocale;
    const color = isCurrent ? "brightgreen" : "lightgrey";
    const text = isCurrent ? "Current" : "Click%20to%20View";
    const safeName = encodeURIComponent(lang.name);
    return `[![${lang.name}](https://img.shields.io/badge/${safeName}-${text}-${color})](${lang.readmeFileName})`;
  });

  const rows: string[] = [];
  for (let i = 0; i < badges.length; i += 10) {
    rows.push(badges.slice(i, i + 10).join(" "));
  }

  return `${rows.join("\n")}\n\n---\n\n`;
}

function generateCollectionCTA(categories: FilterCategory[], locale: string): string {
  const sourceNote = sourceBackedNote(locale);
  let md = `## ${t("viewInGallery", locale)}

**[${t("browseGallery", locale)}](${getMuseImageProductUrl(locale)})**

${t("galleryFeatures", locale)}

${sourceNote}

| ${t("feature", locale)} | ${t("githubReadme", locale)} | ${t("collection", locale)} |
|---------|--------------|---------------------|
| ${t("visualLayout", locale)} | ${t("linearList", locale)} | ${t("masonryGrid", locale)} |
| ${t("search", locale)} | ${t("ctrlFOnly", locale)} | ${t("fullTextSearch", locale)} |
| ${t("aiGenerate", locale)} | - | ${t("aiOneClickGen", locale)} |
| ${t("mobile", locale)} | ${t("basic", locale)} | ${t("fullyResponsive", locale)} |
| ${t("categories", locale)} | - | ${t("categoryBrowsing", locale)} |

`;

  if (categories.length > 0) {
    md += generateCategoriesSection(categories, locale);
  }

  return `${md}---\n\n`;
}

function generateCategoriesSection(categories: FilterCategory[], locale: string): string {
  const workflowCategories = categories
    .filter((category) => category.parentSlug === "workflow-groups")
    .sort((left, right) => (left.sort || 0) - (right.sort || 0));
  let md = `\n### ${t("browseByCategory", locale)}\n\n`;

  for (const category of workflowCategories) {
    md += `- [**${category.title}**](#workflow-${category.slug}) - ${workflowDescription(category.slug, locale)}\n`;
  }

  return `${md}\n`;
}

export function groupPromptsByWorkflow(
  prompts: Prompt[],
  categories: FilterCategory[]
): WorkflowPromptGroup[] {
  return categories
    .filter((category) => category.parentSlug === "workflow-groups")
    .sort((left, right) => (left.sort || 0) - (right.sort || 0))
    .map((category) => ({
      category,
      prompts: prompts.filter((prompt) =>
        prompt.imageCategories?.workflows?.some((workflow) => workflow.slug === category.slug)
      ),
    }))
    .filter((group) => group.prompts.length > 0);
}

function generatePromptSection(
  prompt: Prompt,
  index: number,
  locale: string,
  headingLevel = 3
): string {
  const authorLink = prompt.author.link || "#";
  const publishedDate = new Date(prompt.sourcePublishedAt).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  const rawContent = prompt.translatedContent || prompt.content;
  const promptContent = cleanPromptContent(rawContent);
  const hasVariables = /\[[A-Z][A-Z0-9_ ]{1,40}\]/.test(promptContent);

  const heading = "#".repeat(headingLevel);
  const detailHeading = "#".repeat(headingLevel + 1);
  let md = `<a id="prompt-${prompt.id}"></a>\n\n${heading} No. ${index + 1}: ${prompt.title}\n\n`;
  md += `![Language-${prompt.language.toUpperCase()}](https://img.shields.io/badge/Language-${prompt.language.toUpperCase()}-blue)\n`;

  if (prompt.featured) {
    md += "![Featured](https://img.shields.io/badge/Featured-gold-gold)\n";
  }
  if (hasVariables) {
    md += "![Variables](https://img.shields.io/badge/Variables-Reusable-purple)\n";
  }
  if (prompt.needReferenceImages) {
    md += "![Reference](https://img.shields.io/badge/Reference-Image%20Needed-orange)\n";
  }

  md += `\n${detailHeading} ${t("description", locale)}\n\n${prompt.description}\n\n`;
  md += `${detailHeading} ${t("prompt", locale)}\n\n\`\`\`\n${promptContent}\n\`\`\`\n\n`;

  if (prompt.promptVariants?.length) {
    md += generatePromptVariants(prompt.promptVariants, locale);
  }

  if (prompt.sourceMedia && prompt.sourceMedia.length > 0) {
    if (prompt.video?.url) {
      md += generateAnimationPreview(
        prompt.animationPreview || prompt.video.thumbnail || "",
        prompt.title,
        prompt.video.url
      );
    } else {
      md += `${detailHeading} ${t("generatedImages", locale)}\n\n`;
      md += generateMediaTable(prompt.sourceMedia, prompt.title);
      if (prompt.animationPreview) {
        md += generateAnimationPreview(prompt.animationPreview, prompt.title);
      }
    }
  } else if (prompt.animationPreview) {
    md += generateAnimationPreview(prompt.animationPreview, prompt.title);
  }

  md += `${detailHeading} ${t("details", locale)}\n\n`;
  md += `- **${t("author", locale)}:** [${prompt.author.name}](${authorLink})\n`;
  if (prompt.sourceLink) {
    md += `- **${t("source", locale)}:** [${t("source", locale)}](${prompt.sourceLink})\n`;
  }
  md += `- **${t("published", locale)}:** ${publishedDate}\n`;
  md += `- **${t("languages", locale)}:** ${prompt.language}\n\n`;
  md += `**[${getPromptCtaLabel(locale)}](${getMuseImageProductUrl(locale)})**\n\n`;
  md += "---\n\n";

  return md;
}

function generateFeaturedSection(featured: Prompt[], locale: string): string {
  if (featured.length === 0) return "";
  let md = `<a id="community-featured-prompts"></a>\n\n`;
  md += `## ${communityFeaturedTitle(locale)}\n\n`;
  md += `> ${t("handPicked", locale)}\n\n`;
  featured.forEach((prompt, index) => {
    md += generatePromptSection(prompt, index, locale);
  });
  return md;
}

function generateAllPromptsSection(
  categorizedPrompts: Prompt[],
  hiddenCount: number,
  categories: FilterCategory[],
  locale: string
): string {
  if (categorizedPrompts.length === 0 && hiddenCount === 0) return "";
  let md = `<a id="community-prompt-cases"></a>\n\n`;
  md += `## ${communityCasesTitle(locale)}\n\n`;
  md += `> Twitter/X-sourced community prompt cases, ${t("sortedByDate", locale).toLowerCase()}.\n\n`;
  const groups = groupPromptsByWorkflow(categorizedPrompts, categories);
  let promptIndex = 0;

  for (const group of groups) {
    md += `<a id="workflow-${group.category.slug}"></a>\n\n`;
    md += `### ${group.category.title} (${group.prompts.length})\n\n`;
    md += `${workflowDescription(group.category.slug, locale)}\n\n`;
    const featuredPrompts = group.prompts.filter((prompt) => prompt.featured);
    if (featuredPrompts.length > 0) {
      md += `**${communityFeaturedTitle(locale)}**\n\n`;
      for (const prompt of featuredPrompts) {
        md += `- [${prompt.title}](#prompt-${prompt.id})\n`;
      }
      md += "\n";
    }
    for (const prompt of group.prompts.filter((item) => !item.featured)) {
      md += generatePromptSection(prompt, promptIndex, locale, 4);
      promptIndex += 1;
    }
  }

  if (hiddenCount > 0) {
    md += `---\n\n## ${t("morePrompts", locale)}\n\n`;
    md += `<div align="center">\n\n`;
    md += `### ${hiddenCount} ${t("morePromptsDesc", locale)}\n\n`;
    md += `Due to GitHub README length limits, only the first ${MAX_REGULAR_PROMPTS_TO_DISPLAY} regular prompts are displayed here.\n\n`;
    md += `**[${t("viewAll", locale)}](${REPO_URL})**\n\n`;
    md += `${t("galleryFeature1", locale)}\n\n${t("galleryFeature2", locale)}\n\n${t("galleryFeature3", locale)}\n\n${t("galleryFeature4", locale)}\n\n`;
    md += `</div>\n\n---\n\n`;
  }

  return md;
}

function communityFeaturedTitle(locale: string): string {
  return locale === "en"
    ? "Featured Community Prompts"
    : `Community · ${t("featuredPrompts", locale)}`;
}

function communityCasesTitle(locale: string): string {
  return locale === "en" ? "Community Prompt Cases" : `Community · ${t("allPrompts", locale)}`;
}

function generateStats(stats: { total: number; featured: number }, locale: string): string {
  const now = new Date().toLocaleString(locale, {
    timeZone: "UTC",
    dateStyle: "full",
    timeStyle: "long",
  });

  return `## ${t("stats", locale)}

<div align="center">

| ${t("metric", locale)} | ${t("count", locale)} |
|--------|-------|
| ${t("totalPrompts", locale)} | **${stats.total}** |
| ${t("featured", locale)} | **${stats.featured}** |
| ${t("lastUpdated", locale)} | **${now}** |

</div>

---

`;
}

function generateTOC(
  locale: string,
  options: {
    hasOfficialCases: boolean;
    hasFeatured: boolean;
    hasCommunityPrompts: boolean;
  }
): string {
  const items = [
    `- [${t("viewInGallery", locale)}](#${anchor(t("viewInGallery", locale))})`,
    `- [${t("whatIs", locale)}](#${anchor(t("whatIs", locale))})`,
  ];

  if (options.hasOfficialCases) {
    items.push(`- [${officialCaseCopy(locale).section}](#official-capability-cases)`);
  }
  items.push(`- [${t("stats", locale)}](#${anchor(t("stats", locale))})`);
  if (options.hasFeatured) {
    items.push(`- [${communityFeaturedTitle(locale)}](#community-featured-prompts)`);
  }
  if (options.hasCommunityPrompts) {
    items.push(`- [${communityCasesTitle(locale)}](#community-prompt-cases)`);
  }
  items.push(
    `- [${t("howToContribute", locale)}](#${anchor(t("howToContribute", locale))})`,
    `- [${t("license", locale)}](#${anchor(t("license", locale))})`,
    `- [${t("acknowledgements", locale)}](#${anchor(t("acknowledgements", locale))})`,
    `- [${t("starHistory", locale)}](#${anchor(t("starHistory", locale))})`
  );

  return `## ${t("toc", locale)}

${items.join("\n")}

---

`;
}

function officialCaseCopy(locale: string): { section: string; note: string; caseLabel: string; promptLabel: string } {
  const copy: Record<string, { section: string; note: string; caseLabel: string; promptLabel: string }> = {
    en: { section: "Official Capability Cases", note: "First-party launch examples. Editorial headings are localized; official source prompts remain in English for verification.", caseLabel: "Case", promptLabel: "Official source prompt (English)" },
    zh: { section: "官方能力案例", note: "Meta 第一方发布案例。编辑标题已本地化，官方来源提示词保留英文以便核验。", caseLabel: "案例", promptLabel: "官方来源提示词（英文）" },
    "ja-JP": { section: "公式機能事例", note: "Metaの一次公開事例です。編集見出しは翻訳し、公式プロンプトは検証用に英語のまま保持します。", caseLabel: "事例", promptLabel: "公式ソースプロンプト（英語）" },
    "ko-KR": { section: "공식 기능 사례", note: "Meta의 1차 공개 사례입니다. 편집 제목은 번역하고 공식 프롬프트는 검증을 위해 영어 원문을 유지합니다.", caseLabel: "사례", promptLabel: "공식 원문 프롬프트(영어)" },
    "es-ES": { section: "Casos oficiales de capacidad", note: "Ejemplos de lanzamiento de Meta. Los encabezados editoriales están localizados y los prompts oficiales se conservan en inglés para verificarlos.", caseLabel: "Caso", promptLabel: "Prompt oficial de origen (inglés)" },
    "de-DE": { section: "Offizielle Funktionsbeispiele", note: "Erstveröffentlichungen von Meta. Redaktionelle Überschriften sind lokalisiert; offizielle Quellprompts bleiben zur Prüfung auf Englisch.", caseLabel: "Fall", promptLabel: "Offizieller Quellprompt (Englisch)" },
    "fr-FR": { section: "Cas officiels de capacité", note: "Exemples de lancement publiés par Meta. Les titres éditoriaux sont localisés; les prompts officiels restent en anglais pour vérification.", caseLabel: "Cas", promptLabel: "Prompt officiel source (anglais)" },
    "it-IT": { section: "Casi ufficiali di capacità", note: "Esempi di lancio pubblicati da Meta. I titoli editoriali sono localizzati; i prompt ufficiali restano in inglese per la verifica.", caseLabel: "Caso", promptLabel: "Prompt ufficiale di origine (inglese)" },
    "pt-PT": { section: "Casos oficiais de capacidade", note: "Exemplos de lançamento da Meta. Os títulos editoriais são localizados; os prompts oficiais mantêm-se em inglês para verificação.", caseLabel: "Caso", promptLabel: "Prompt oficial de origem (inglês)" },
    "tr-TR": { section: "Resmî yetenek örnekleri", note: "Meta'nın birincil lansman örnekleri. Editoryal başlıklar çevrilir; resmî kaynak promptları doğrulama için İngilizce tutulur.", caseLabel: "Örnek", promptLabel: "Resmî kaynak promptu (İngilizce)" },
    "ar-SA": { section: "حالات القدرات الرسمية", note: "أمثلة إطلاق أولية من Meta. تُترجم العناوين التحريرية وتبقى المطالبات الرسمية بالإنجليزية للتحقق.", caseLabel: "الحالة", promptLabel: "المطالبة الرسمية الأصلية (بالإنجليزية)" },
    "ru-RU": { section: "Официальные примеры возможностей", note: "Первичные примеры запуска от Meta. Редакционные заголовки локализованы, официальные промпты сохранены на английском для проверки.", caseLabel: "Пример", promptLabel: "Официальный исходный промпт (английский)" },
    "nl-NL": { section: "Officiële functievoorbeelden", note: "Eerstelijns lanceringsvoorbeelden van Meta. Redactionele koppen zijn vertaald; officiële bronprompts blijven Engels voor verificatie.", caseLabel: "Case", promptLabel: "Officiële bronprompt (Engels)" },
    "pl-PL": { section: "Oficjalne przykłady możliwości", note: "Pierwotne przykłady premierowe Meta. Nagłówki redakcyjne są lokalizowane, a oficjalne prompty pozostają po angielsku do weryfikacji.", caseLabel: "Przypadek", promptLabel: "Oficjalny prompt źródłowy (angielski)" },
  };
  return copy[locale] || copy.en;
}

function generateOfficialCasesSection(groups: OfficialCaseGroup[], locale: string): string {
  if (groups.length === 0) return "";
  const copy = officialCaseCopy(locale);

  let md = `<a id="official-capability-cases"></a>\n\n`;
  md += `## ${copy.section}\n\n`;
  md += `> ${copy.note}\n\n`;
  for (const group of groups) {
    md += `<a id="official-${group.slug}"></a>\n\n`;
    md += `### ${group.title}\n\n`;
    md += `${group.description}\n\n`;

    for (const officialCase of group.cases) {
      md += generateOfficialCase(officialCase, copy);
    }
  }

  return md;
}

function generateOfficialCase(officialCase: OfficialCase, copy = officialCaseCopy("en")): string {
  let md = `<a id="official-case-${officialCase.id}"></a>\n\n`;
  md += `#### ${copy.caseLabel} ${officialCase.id}: ${officialCase.title}\n\n`;

  if (officialCase.media.length === 1) {
    const media = officialCase.media[0];
    md += `<img src="${escapeAttribute(media.url)}" height="${media.height || 420}" alt="${escapeAttribute(officialCase.title)}">\n\n`;
  } else {
    const cellWidth = `${Math.floor(100 / officialCase.media.length)}%`;
    const cells = officialCase.media
      .map((media) => {
        const label = media.label ? `\n\n**${media.label}:**\n\n` : "\n\n";
        return `<td width="${cellWidth}" valign="top">${label}<img src="${escapeAttribute(media.url)}" height="${media.height || 300}" alt="${escapeAttribute(`${officialCase.title} ${media.label || "media"}`)}">\n\n</td>`;
      })
      .join("\n");
    md += `<table>\n<tr>\n${cells}\n</tr>\n</table>\n\n`;
  }

  if (officialCase.prompt) {
    md += `**${copy.promptLabel}:**\n\n\`\`\`\n${officialCase.prompt}\n\`\`\`\n\n`;
  }

  return `${md}---\n\n`;
}

export function generateMediaTable(images: string[], title: string): string {
  const rows: string[] = [];

  for (let index = 0; index < images.length; index += 4) {
    const row = images.slice(index, index + 4);
    const cellWidth = `${Math.floor(100 / row.length)}%`;
    const cells = row
      .map((imageUrl, rowIndex) => {
        const imageNumber = index + rowIndex + 1;
        return `<td width="${cellWidth}" valign="top" align="center"><img src="${escapeAttribute(imageUrl)}" width="100%" alt="${escapeAttribute(title)} - Image ${imageNumber}"></td>`;
      })
      .join("\n");
    rows.push(`<tr>\n${cells}\n</tr>`);
  }

  return `<table>\n${rows.join("\n")}\n</table>\n\n`;
}

export function generateAnimationPreview(
  url: string,
  title: string,
  sourceUrl?: string
): string {
  const image = `<img src="${escapeAttribute(url)}" height="420" alt="${escapeAttribute(title)} - Motion preview">`;
  const content = sourceUrl ? `<a href="${escapeAttribute(sourceUrl)}">${image}</a>` : image;
  return `<div align="center">\n${content}\n</div>\n\n`;
}

function generatePromptVariants(
  variants: NonNullable<Prompt["promptVariants"]>,
  locale: string
): string {
  const copy = promptVariantCopy(locale);
  let md = `<details>\n<summary>${copy.summary} (${variants.length})</summary>\n\n`;

  for (const variant of variants) {
    if (variant.title) md += `**${variant.title}**\n\n`;
    md += `\`\`\`\n${cleanPromptContent(variant.content)}\n\`\`\`\n\n`;
    if (variant.author?.name) {
      md += `${copy.author}: ${variant.author.link ? `[${variant.author.name}](${variant.author.link})` : variant.author.name}\n\n`;
    }
    if (variant.sourceLink) {
      md += `${copy.source}: [${copy.source}](${variant.sourceLink})\n\n`;
    }
  }

  return `${md}</details>\n\n`;
}

function promptVariantCopy(locale: string): {
  summary: string;
  author: string;
  source: string;
} {
  if (locale === "zh") return { summary: "相关提示词变体", author: "作者", source: "来源" };
  if (locale === "zh-TW") return { summary: "相關提示詞變體", author: "作者", source: "來源" };
  if (locale === "ja-JP") {
    return { summary: "関連プロンプトのバリエーション", author: "作者", source: "出典" };
  }
  if (locale === "ko-KR") {
    return { summary: "관련 프롬프트 변형", author: "작성자", source: "출처" };
  }
  return { summary: "Related prompt variants", author: "Author", source: "Source" };
}

export function generateModelIntroduction(locale: string): string {
  const contentLocale = locale;

  return `## ${t("whatIs", locale)}

${t("whatIsIntro", contentLocale)}

- ${t("multimodalUnderstanding", contentLocale)}
- ${t("highQualityGeneration", contentLocale)}
- ${t("fastIteration", contentLocale)}
- ${t("diverseStyles", contentLocale)}
- ${t("preciseControl", contentLocale)}
- ${t("complexScenes", contentLocale)}

${t("learnMore", locale)} [Meta AI engineering overview](${META_MUSE_RELEASE_URL}) · [Meta product announcement](${META_AI_URL}) · [Create images on ImagineVid](${getMuseImageProductUrl(locale)})

### ${t("variableWorkflowTitle", locale)}

${t("variableWorkflowDescription", locale)}

**${t("example", locale)}**
\`\`\`
${t("variableWorkflowExample", locale)}
\`\`\`

${t("variableWorkflowUsage", locale)}

---

`;
}

function sourceBackedNote(locale: string): string {
  const notes: Record<string, string> = {
    en: "Every entry keeps its original source and creator attribution. Product actions open ImagineVid; capability claims cite Meta's first-party material.",
    zh: "每条案例均保留原始来源与作者署名；产品操作入口指向 ImagineVid，能力说明依据 Meta 第一方资料。",
    "ja-JP": "各事例は原典と作者表記を保持します。制作リンクは ImagineVid、機能説明は Meta の一次資料に基づきます。",
    "ko-KR": "모든 사례는 원문 출처와 제작자 표시를 유지합니다. 제작 링크는 ImagineVid로, 기능 설명은 Meta의 1차 자료로 연결됩니다.",
    "es-ES": "Cada caso conserva la fuente y la autoría originales. Los enlaces de creación llevan a ImagineVid y las capacidades se basan en material de primera mano de Meta.",
    "de-DE": "Jeder Fall behält Originalquelle und Urhebernennung. Produktionslinks führen zu ImagineVid; Funktionsangaben stützen sich auf Primärquellen von Meta.",
    "fr-FR": "Chaque cas conserve sa source et son attribution d'origine. Les liens de création mènent à ImagineVid et les capacités s'appuient sur les sources de première main de Meta.",
    "it-IT": "Ogni caso conserva fonte e attribuzione originali. I link di creazione portano a ImagineVid; le capacità si basano su fonti dirette di Meta.",
    "pt-PT": "Cada caso preserva a fonte e a autoria originais. Os links de criação abrem o ImagineVid e as capacidades baseiam-se em fontes primárias da Meta.",
    "tr-TR": "Her örnek özgün kaynağı ve üretici atfını korur. Üretim bağlantıları ImagineVid'e gider; yetenek açıklamaları Meta'nın birincil kaynaklarına dayanır.",
    "ar-SA": "تحتفظ كل حالة بالمصدر الأصلي ونسبة العمل إلى صاحبه. تفتح روابط الإنشاء ImagineVid، وتستند معلومات القدرات إلى مصادر Meta المباشرة.",
    "ru-RU": "Каждый пример сохраняет первоисточник и указание автора. Ссылки для создания ведут на ImagineVid, а описание возможностей опирается на первичные материалы Meta.",
    "nl-NL": "Elk voorbeeld behoudt de oorspronkelijke bron en maker. Creatielinks openen ImagineVid; functieclaims steunen op primaire bronnen van Meta.",
    "pl-PL": "Każdy przykład zachowuje oryginalne źródło i autora. Linki do tworzenia prowadzą do ImagineVid, a opisy możliwości opierają się na materiałach źródłowych Meta.",
  };
  return notes[locale] || notes.en;
}

function generateContribute(locale: string): string {
  return `## ${t("howToContribute", locale)}

${t("welcomeContributions", locale)}

### ${t("githubIssue", locale)}

1. [**${t("submitNewPrompt", locale)}**](https://github.com/${REPO}/issues/new?template=submit-prompt.yml)
2. ${t("fillForm", locale)}
3. ${t("submitWait", locale)}
4. ${t("approvedSync", locale)}
5. ${t("appearInReadme", locale)}

**${t("note", locale)}** ${t("noteContent", locale)}

${t("seeContributing", locale)}

---

`;
}

function generateFooter(locale: string, prompts: Prompt[]): string {
  const timestamp = new Date().toISOString();
  const creatorCredits = generateCreatorCredits(prompts, locale);

  return `## ${t("license", locale)}

${t("licensedUnder", locale)}

---

## ${t("acknowledgements", locale)}

${creatorCredits}

---

## ${t("starHistory", locale)}

[![GitHub stars](https://img.shields.io/github/stars/${REPO}?style=for-the-badge&logo=github&label=GitHub%20Stars)](${REPO_URL}/stargazers)

**[${t("starHistory", locale)}](https://star-history.com/#${REPO}&Date)**

---

<div align="center">

**[${t("viewInGallery", locale)}](${getMuseImageProductUrl(locale)})** •
**[${t("submitPrompt", locale)}](https://github.com/${REPO}/issues/new?template=submit-prompt.yml)** •
**[${t("starRepo", locale)}](${REPO_URL})**

<sub>${t("autoGenerated", locale)} ${timestamp}</sub>

</div>
`;
}

function generateCreatorCredits(prompts: Prompt[], locale: string): string {
  const summary = creatorSummary(locale);
  const attributedCreators = prompts.flatMap((prompt) => [
    prompt.author,
    ...(prompt.promptVariants || []).map((variant) => variant.author).filter(Boolean),
  ]);
  const creators = [
    ...new Map(
      attributedCreators
        .filter((author) => author?.name && author.link)
        .map((author) => [author!.link, author!])
    ).values(),
  ].sort((left, right) => left.name.localeCompare(right.name));
  const rows: string[] = [];

  for (let index = 0; index < creators.length; index += 8) {
    rows.push(
      creators
        .slice(index, index + 8)
        .map((creator) => `[${creator.name}](${creator.link})`)
        .join(" · ")
    );
  }

  return `<details>\n<summary>${summary} (${creators.length})</summary>\n\n${rows.join("<br>\n")}\n\n</details>`;
}

function creatorSummary(locale: string): string {
  const copies: Record<string, string> = {
    "en": "Community creators we thank",
    "zh": "查看并感谢社区作者",
    "ja-JP": "コミュニティ作者への謝辞",
    "ko-KR": "커뮤니티 제작자 감사 명단",
    "es-ES": "Autores de la comunidad",
    "de-DE": "Community-Autoren",
    "fr-FR": "Auteurs de la communauté",
    "it-IT": "Autori della community",
    "pt-PT": "Autores da comunidade",
    "tr-TR": "Topluluk üreticileri",
    "ar-SA": "مبدعو المجتمع الذين نشكرهم",
    "ru-RU": "Авторы сообщества",
    "nl-NL": "Makers uit de community",
    "pl-PL": "Twórcy społeczności",
  };
  return copies[locale] || copies.en;
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function anchor(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}
