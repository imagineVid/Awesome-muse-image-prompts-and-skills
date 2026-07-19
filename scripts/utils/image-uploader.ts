/**
 * [INPUT]: 依赖社区投稿或公开来源提供的图片 URL
 * [OUTPUT]: 对外提供保持原始公开 URL 的本地图片引用归一化能力
 * [POS]: scripts/utils 的媒体边界，当前不接 CMS、图库或上传服务
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
export interface LocalImageReference {
  url: string;
}

export async function normalizeImageReference(url: string): Promise<LocalImageReference> {
  return { url };
}
