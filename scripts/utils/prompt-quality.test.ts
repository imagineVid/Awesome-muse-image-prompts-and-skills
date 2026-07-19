/**
 * [INPUT]: 依赖 prompt-quality 的评分与去重接口以及代表性 X 候选夹具
 * [OUTPUT]: 验证 Muse Image 模型证据、硬门槛、质量分层和重复检测行为
 * [POS]: scripts/utils 的采集质量回归套件，确保关键词命中不会绕过人工审核
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  findCandidateDuplicates,
  MIN_TWITTER_PROMPT_SCORE,
  rememberCandidate,
  scoreStoredTwitterPrompt,
  scoreTwitterCandidate,
  type CandidateDuplicateState,
} from "./prompt-quality.js";

test("accepts a source-backed reusable prompt even before it has engagement", () => {
  const result = scoreStoredTwitterPrompt({
    content:
      "Create a cinematic product photograph with controlled rim light, realistic materials, a clean layout, and readable typography.",
    sourceLink: "https://x.com/creator/status/1234567890",
    sourceMedia: ["https://pbs.twimg.com/media/example.jpg"],
    author: { name: "@creator", link: "https://x.com/creator" },
    sourceMeta: {
      prompt_source: "tweet_text_prompt",
      model_evidence: "muse-image",
      likeCount: 0,
      bookmarkCount: 0,
      viewCount: 20,
    },
    imageCategories: {
      workflows: [{ slug: "commercial-design-ui-posters" }],
    },
  });

  assert.ok(result.score >= MIN_TWITTER_PROMPT_SCORE);
  assert.equal(result.decision, "accept");
});

test("rejects a short promotional announcement without a reusable prompt", () => {
  const result = scoreTwitterCandidate({
    id: "123",
    text: "Muse Image is now available. Try it today!",
    extendedEntities: {
      media: [{ media_url_https: "https://pbs.twimg.com/media/example.jpg" }],
    },
    author: { userName: "vendor" },
    likeCount: 1,
    bookmarkCount: 0,
    viewCount: 100,
  });

  assert.equal(result.decision, "reject");
  assert.ok(result.reasons.some((reason) => reason.includes("promotional")));
});

test("ranks a detailed prompt share above a generic image test", () => {
  const detailed = scoreTwitterCandidate({
    id: "high",
    text:
      "Muse Image\nPrompt: Create a low-angle cinematic frame of a knight facing a stone giant, with volumetric fog, cold moonlight, realistic armor, and a 16:9 composition.",
    extendedEntities: {
      media: [{ media_url_https: "https://pbs.twimg.com/media/high.jpg" }],
    },
    author: { userName: "artist" },
    likeCount: 8,
    bookmarkCount: 3,
    viewCount: 900,
  });
  const generic = scoreTwitterCandidate({
    id: "low",
    text: "Testing Muse Image",
    extendedEntities: {
      media: [{ media_url_https: "https://pbs.twimg.com/media/low.jpg" }],
    },
    author: { userName: "tester" },
    likeCount: 0,
    bookmarkCount: 0,
    viewCount: 10,
  });

  assert.ok(detailed.score > generic.score);
  assert.equal(detailed.decision, "accept");
  assert.equal(generic.decision, "reject");
});

test("does not auto-accept a prompt for an unrelated image model", () => {
  const result = scoreTwitterCandidate({
    id: "midjourney",
    text:
      "Midjourney\nPrompt: Create a detailed cinematic city at night with neon signage, wet pavement, volumetric light, and realistic reflections.",
    extendedEntities: {
      media: [{ media_url_https: "https://pbs.twimg.com/media/midjourney.jpg" }],
    },
    author: { userName: "artist" },
    likeCount: 500,
    bookmarkCount: 100,
    viewCount: 100000,
  });

  assert.notEqual(result.decision, "accept");
  assert.ok(result.reasons.some((reason) => reason.includes("Muse Image")));
});

test("does not accept prompts that explicitly target another image model", () => {
  for (const modelName of [
    "Midjourney",
    "Ideogram",
    "GPT Image",
    "Seedream",
  ]) {
    const result = scoreTwitterCandidate({
      id: modelName,
      text: `${modelName}\nPrompt: Create a detailed cinematic poster with readable type and realistic lighting.`,
      extendedEntities: {
        media: [{ media_url_https: `https://pbs.twimg.com/media/${modelName}.jpg` }],
      },
      author: { userName: "creator" },
      likeCount: 500,
      bookmarkCount: 100,
      viewCount: 10000,
    });

    assert.notEqual(result.decision, "accept", modelName);
    assert.ok(result.reasons.some((reason) => reason.includes("Muse Image")));
  }
});

test("rejects stored prompts that miss attribution or category hard gates", () => {
  const result = scoreStoredTwitterPrompt({
    content:
      "Create a detailed cinematic landscape with realistic lighting, layered depth, precise composition, and polished material texture.".repeat(8),
    sourceLink: "https://x.com/creator/status/1234567890",
    sourceMedia: ["https://pbs.twimg.com/media/example.jpg"],
    sourceMeta: {
      prompt_source: "tweet_text_prompt",
      model_evidence: "muse-image",
      likeCount: 500,
    },
  });

  assert.equal(result.decision, "reject");
  assert.ok(result.reasons.some((reason) => reason.includes("author attribution")));
  assert.ok(result.reasons.some((reason) => reason.includes("primary workflow")));
});

test("detects duplicate prompt text and media inside the same search batch", () => {
  const state: CandidateDuplicateState = {
    tweetIds: new Set(),
    mediaUrls: new Set(),
    textFingerprints: new Set(),
  };
  const first = {
    id: "first",
    text: "Muse Image\nPrompt: Create a cinematic red sports car.",
    extendedEntities: {
      media: [{ media_url_https: "https://pbs.twimg.com/media/shared.jpg?name=large" }],
    },
  };
  const repost = {
    id: "repost",
    text: "Muse Image\nPrompt: Create a cinematic red sports car.",
    extendedEntities: {
      media: [{ media_url_https: "https://pbs.twimg.com/media/shared.jpg" }],
    },
  };

  rememberCandidate(first, state);
  const reasons = findCandidateDuplicates(repost, state);

  assert.ok(reasons.some((reason) => reason.includes("prompt text")));
  assert.ok(reasons.some((reason) => reason.includes("media URL")));
});
