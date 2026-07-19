/**
 * [INPUT]: 依赖 core 与 extended 语言包和 Translation 字段契约
 * [OUTPUT]: 对外提供 Translation 类型与按 locale 查询 README 文案的 t 函数
 * [POS]: scripts/utils 的本地化门面，集中处理受支持语言选择与英文兜底
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { CORE_TRANSLATIONS } from "./locales/core.js";
import { EXTENDED_TRANSLATIONS } from "./locales/extended.js";
import type { Translation } from "./translation-types.js";

export type { Translation } from "./translation-types.js";

const translations: Record<string, Translation> = {
  ...CORE_TRANSLATIONS,
  ...EXTENDED_TRANSLATIONS,
};

export function t(key: keyof Translation, locale = "en"): string {
  return (translations[locale] || translations.en)[key] || translations.en[key];
}
