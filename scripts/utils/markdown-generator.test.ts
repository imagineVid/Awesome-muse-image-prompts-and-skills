/**
 * [INPUT]: 依赖 markdown-generator、prompt-repository 的公开接口与本地提示词本地化数据
 * [OUTPUT]: 验证模型事实、14 语元数据、变量标记、产品链接、媒体布局与案例边界
 * [POS]: scripts/utils 的 README 行为回归套件，防止样板品牌与错误模型信息重新出现
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import assert from "node:assert/strict";
import test from "node:test";
import { fetchAllPrompts, type Prompt, type FilterCategory } from "./prompt-repository.js";
import {
  generateMarkdown,
  generateMediaTable,
  generateAnimationPreview,
  generateModelIntroduction,
  getPromptCtaLabel,
  getMuseImageProductUrl,
  groupPromptsByWorkflow,
  SUPPORTED_LANGUAGES,
} from "./markdown-generator.js";

test("renders official cases separately from community prompt cases", () => {
  const markdown = generateMarkdown(
    {
      all: [],
      featured: [],
      regular: [
        {
          id: 101,
          title: "Community test prompt",
          description: "A community sourced prompt.",
          content: "Create a clean product image.",
          sourcePublishedAt: "2026-07-08T00:00:00Z",
          sourceMedia: ["https://pbs.twimg.com/media/example.jpg"],
          author: { name: "@creator", link: "https://x.com/creator" },
          language: "en",
          imageCategories: {
            workflows: [
              {
                id: 61,
                title: "Directed Editing & Input Control",
                slug: "directed-editing-input-control",
              },
            ],
          },
        } as Prompt,
      ],
      stats: { total: 1, featured: 0 },
      categories: [
        {
          id: 61,
          title: "Directed Editing & Input Control",
          slug: "directed-editing-input-control",
          parentSlug: "workflow-groups",
          sort: 61,
        },
      ],
      officialCases: [
        {
          slug: "interaction-control",
          title: "Interaction Control",
          description: "Precise control cases.",
          cases: [
            {
              id: 1,
              title: "Box selection",
              media: [{ url: "public/official-cases/case-01.gif", height: 420 }],
              prompt: "Use the red box as the edit target.",
            },
          ],
        },
      ],
    },
    0,
    "en"
  );

  assert.match(markdown, /## Official Capability Cases/);
  assert.match(markdown, /#### Case 1: Box selection/);
  assert.match(markdown, /## Community Prompt Cases/);
  assert.ok(markdown.indexOf("Official Capability Cases") < markdown.indexOf("Community Prompt Cases"));
});

test("renders multiple prompt images in a single parallel table row", () => {
  const markdown = generateMediaTable(
    ["https://example.com/one.jpg", "https://example.com/two.jpg"],
    "Example prompt"
  );

  assert.match(markdown, /<table>/);
  assert.match(markdown, /<td width="50%"/);
  assert.equal((markdown.match(/<td /g) || []).length, 2);
  assert.ok(markdown.indexOf("one.jpg") < markdown.indexOf("two.jpg"));
});

test("wraps five images into two table rows without dropping media", () => {
  const images = Array.from({ length: 5 }, (_, index) =>
    `https://example.com/${index + 1}.jpg`
  );
  const markdown = generateMediaTable(images, "Five images");

  assert.equal((markdown.match(/<tr>/g) || []).length, 2);
  for (const image of images) assert.match(markdown, new RegExp(image));
});

test("renders a GitHub-compatible animated preview linked to its X source", () => {
  const markdown = generateAnimationPreview(
    "public/animations/example-motion.gif",
    "Example prompt",
    "https://video.twimg.com/example.mp4"
  );

  assert.doesNotMatch(markdown, /<video/);
  assert.match(markdown, /height="420"/);
  assert.match(markdown, /https:\/\/video\.twimg\.com\/example\.mp4/);
  assert.match(markdown, /public\/animations\/example-motion\.gif/);
});

test("model introduction explains the model and the collection's evidence standard", () => {
  const markdown = generateModelIntroduction("en");

  assert.match(markdown, /Muse Image/);
  assert.match(markdown, /agentic image-generation/);
  assert.match(markdown, /search and code tools/);
  assert.match(markdown, /self-refinement/);
  assert.match(markdown, /public developer API/);
  assert.match(markdown, /imaginevid\.io\/ai-image-generator/);
});

test("every README locale uses the verified model introduction", () => {
  for (const { code } of SUPPORTED_LANGUAGES) {
    const markdown = generateModelIntroduction(code);
    assert.doesNotMatch(markdown, /Multi-Image Fusion/i, code);
    assert.doesNotMatch(markdown, /third-party model provider/i, code);
    assert.doesNotMatch(markdown, /Raycast/i, code);
    assert.ok(markdown.includes(getMuseImageProductUrl(code)), code);
  }
});

test("every non-English README locale has localized prompt titles and descriptions", async () => {
  const english = (await fetchAllPrompts("en")).docs;

  for (const { code } of SUPPORTED_LANGUAGES.filter(({ code }) => code !== "en")) {
    const localized = (await fetchAllPrompts(code)).docs;
    assert.equal(localized.length, english.length, code);
    for (let index = 0; index < english.length; index += 1) {
      assert.notEqual(localized[index].title, english[index].title, `${code}: title ${english[index].id}`);
      assert.notEqual(
        localized[index].description,
        english[index].description,
        `${code}: description ${english[index].id}`
      );
      assert.equal(localized[index].content, english[index].content, `${code}: source prompt ${english[index].id}`);
    }
  }
});

test("marks real square-bracket variables without advertising legacy integrations", () => {
  const prompt = {
    id: 201,
    title: "Variable prompt",
    description: "A reusable sourced prompt.",
    content: "Render [OBJECT] for [BRAND] with soft studio light.",
    sourcePublishedAt: "2025-09-01T00:00:00Z",
    sourceMedia: ["https://pbs.twimg.com/media/variables.jpg"],
    author: { name: "Creator", link: "https://x.com/creator" },
    language: "en",
    imageCategories: {
      workflows: [{ id: 62, title: "Commercial Design", slug: "commercial-design-ui-posters" }],
    },
  } as Prompt;
  const markdown = generateMarkdown(
    {
      all: [prompt],
      featured: [],
      regular: [prompt],
      stats: { total: 1, featured: 0 },
      categories: [
        {
          id: 62,
          title: "Commercial Design",
          slug: "commercial-design-ui-posters",
          parentSlug: "workflow-groups",
          sort: 62,
        },
      ],
      officialCases: [],
    },
    1,
    "en"
  );

  assert.match(markdown, /Variables-Reusable/);
  assert.doesNotMatch(markdown, /Raycast/i);
});

test("non-Latin README locales keep usable table-of-contents anchors", () => {
  const markdown = generateMarkdown(
    {
      all: [],
      featured: [],
      regular: [],
      stats: { total: 0, featured: 0 },
      categories: [],
      officialCases: [],
    },
    0,
    "ru-RU"
  );

  assert.doesNotMatch(markdown, /\]\(#\)/);
  assert.match(markdown, /\(#что-такое-muse-image\)/);
});

test("maps README locales to verified ImagineVid product URLs", () => {
  assert.equal(
    getMuseImageProductUrl("en"),
    "https://imaginevid.io/ai-image-generator"
  );
  for (const { code } of SUPPORTED_LANGUAGES) {
    assert.match(getMuseImageProductUrl(code), /^https:\/\/imaginevid\.io\/(?:[a-z]{2}\/)?ai-image-generator$/);
  }
});

test("prompt CTA names ImagineVid explicitly", () => {
  assert.equal(getPromptCtaLabel("en"), "Use this prompt on ImagineVid");
  assert.match(getPromptCtaLabel("zh"), /ImagineVid/);
});

test("groups prompts by one primary workflow category in taxonomy order", () => {
  const categories = [
    { id: 61, title: "Editing & Input Control", slug: "editing-input-control", parentId: 4, parentSlug: "workflow-groups", sort: 61 },
    { id: 64, title: "Cinematic, Character & Style", slug: "cinematic-character-style", parentId: 4, parentSlug: "workflow-groups", sort: 64 },
  ] as FilterCategory[];
  const prompts = [
    { id: 2, imageCategories: { workflows: [categories[1]] } },
    { id: 1, imageCategories: { workflows: [categories[0]] } },
  ] as Prompt[];

  const groups = groupPromptsByWorkflow(prompts, categories);

  assert.deepEqual(groups.map((group) => group.category.slug), [
    "editing-input-control",
    "cinematic-character-style",
  ]);
  assert.deepEqual(groups.map((group) => group.prompts.map((prompt) => prompt.id)), [[1], [2]]);
});
