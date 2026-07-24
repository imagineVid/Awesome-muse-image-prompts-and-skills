# awesome-muse-image-prompts-and-skills
ImagineVid 品牌的 Muse Image 来源可核验提示词与工作流资料仓库。

<directory>
data/ - 9 条社区提示词、10 条官方能力案例、六类工作流与 13 语本地化覆盖层。
docs/ - 模型边界、分类规则、贡献规范、本地开发与 X 来源审核政策。
public/images/ - ImagineVid 自有仓库封面。
scripts/ - 数据校验、候选评分、Issue 同步与 14 语 README 生成。
.github/ - Issue 模板、标签与 GitHub Actions。
</directory>

<config>
package.json - Node 24 与 pnpm 的验证、测试和生成命令。
</config>

## 产品边界
- 目标远程为 `imagineVid/Awesome-muse-image-prompts-and-skills`。
- Muse Image 指 Meta 于 2026 年 7 月公布的智能体式图像生成与编辑模型，不与其他图像模型或同名工具混写。
- 官方能力事实只使用 Meta 第一方资料；产品 CTA 指向 `https://imaginevid.io/ai-image-generator` 及已支持的语言路由。
- 官方案例与 X 社区案例分开存储。社区案例必须保留作者、规范来源、结果媒体、模型证据和提示词来源说明。

## 内容规则
- 英文是数据真源，13 个非英语 README 使用人工审核的界面、分类、标题和说明译文；来源提示词正文保持可追溯。
- X 搜索只用于发现，原始响应与凭据不得进入 Git；关键词命中必须经过来源核验、质量评分与媒体感知去重。
- 不声称存在公开 Muse Image 开发者 API，不把逐步开放的消费产品能力写成全球普遍可用。
- 封面与品牌资产必须为 ImagineVid 自有内容，不复用模板仓库图片。

## 发布闸门
- 运行 `pnpm run generate`、`pnpm test`、`pnpm run typecheck`；需要媒体级重复审计时运行 `pnpm run audit:duplicates`。
- GitHub README 中的 Meta lookaside 官方案例图必须显式请求 `transcode_extension=webp`，避免远端返回 `application/octet-stream` 导致前后对比破图。
- README 是结构化数据的生成产物，数据、生成器与全部语言 README 必须同一次提交。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
