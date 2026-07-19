# scripts/
> L2 | 父级: ../AGENTS.md

成员清单
generate-readme.ts: README 发布编排器，读取本地数据并生成 14 个 ImagineVid 已支持语言版本。
score-twitter-candidates.ts: twitterapi.io 候选评分入口，输出人工审核前的 accept/review/reject 报告。
sync-approved-to-data.ts: GitHub approved Issue 同步器，将投稿归一化为 Muse Image Prompt 数据。
validate-data.ts: 发布质量闸门，校验来源、13 语元数据覆盖、分类、重复文本与重复媒体。
utils/: 数据访问、翻译、Markdown 渲染、媒体归一化和质量规则实现。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
