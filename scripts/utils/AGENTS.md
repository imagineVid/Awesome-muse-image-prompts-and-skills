# scripts/utils/
> L2 | 父级: ../AGENTS.md

成员清单
prompt-repository.ts: 本地 JSON 数据仓库，合并英文提示词真源、13 语标题说明覆盖层并提供 Prompt/Category/OfficialCase 契约。
i18n.ts: 14 语 README 文案查询门面，统一处理语言选择与英文兜底。
image-uploader.ts: 保持公开来源 URL 的无外部图库媒体归一化边界。
locales/: 按核心与扩展语言组拆分的人工审核 README 文案包。
markdown-generator.ts: GitHub README 的模型介绍、分类、案例、媒体表格与 CTA 渲染器。
markdown-generator.test.ts: README 生成行为与品牌链接回归测试。
prompt-quality.ts: X 候选质量评分、硬门槛和文本/媒体去重策略。
prompt-quality.test.ts: 社区候选筛选规则回归测试。
translation-types.ts: 约束所有语言包必须实现的完整文案字段契约。
workflow-copy.ts: 六类 Muse Image 工作流的 14 语说明文案。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
