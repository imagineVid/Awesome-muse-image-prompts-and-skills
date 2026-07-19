/**
 * [INPUT]: 依赖 data/ 的分类、提示词与官方案例，依赖 utils 的读取、排序、翻译和 Markdown 生成能力
 * [OUTPUT]: 对外提供批量生成受支持语言 README 的命令行入口
 * [POS]: scripts 的发布编排器，将结构化英文真源和本地化文案折叠为仓库展示面
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import fs from "fs";
import {
  fetchAllPrompts,
  sortPrompts,
  fetchPromptCategories,
  fetchOfficialCases,
} from "./utils/prompt-repository.js";
import {
  generateMarkdown,
  SUPPORTED_LANGUAGES,
} from "./utils/markdown-generator.js";

async function main() {
  try {
    // Loop through all supported languages
    for (const lang of SUPPORTED_LANGUAGES) {
      console.log(`\n🌐 Processing language: ${lang.name} (${lang.code})...`);

      console.log("  📥 Loading categories from local data...");
      const { allCategories } = await fetchPromptCategories(lang.code);
      console.log(`  ✅ Fetched ${allCategories.length} categories`);

      const officialCases = await fetchOfficialCases();

      console.log(`  📥 Loading prompts from local data (locale: ${lang.code})...`);
      const { docs: prompts, total } = await fetchAllPrompts(
        lang.code,
        allCategories
      );

      console.log(`  ✅ Fetched ${prompts.length} prompts (total: ${total})`);

      console.log("  🔃 Sorting prompts...");
      const sorted = sortPrompts(prompts, total);

      console.log("  📝 Generating README...");
      const markdown = generateMarkdown(
        { ...sorted, categories: allCategories, officialCases },
        total,
        lang.code
      );

      console.log(`  💾 Writing ${lang.readmeFileName}...`);
      fs.writeFileSync(lang.readmeFileName, markdown, "utf-8");

      console.log(`  ✅ ${lang.readmeFileName} updated successfully!`);
      console.log(
        `  📊 Stats: ${sorted.stats.total} total, ${sorted.featured.length} featured`
      );
    }

    console.log("\n✨ All languages processed successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
