/**
 * [INPUT]: 依赖 Muse Image 六类工作流 taxonomy 与 14 语人工译文
 * [OUTPUT]: 对外提供按分类 slug 与 locale 查询说明的 workflowDescription 函数
 * [POS]: scripts/utils 的分类文案边界，确保生成器与数据分类严格同构
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
const DESCRIPTIONS: Record<string, Record<string, string>> = {
  "agentic-research-factual-visuals": {
    en: "Research-led prompts where current facts, calculations, or code-generated structure become part of the image.",
    zh: "把实时事实、计算结果或代码生成结构转化为画面内容的检索型提示词。",
    "ja-JP": "最新情報、計算、コード生成の構造を画像に取り込むリサーチ型プロンプト。",
    "ko-KR": "최신 사실, 계산 또는 코드로 만든 구조를 이미지에 반영하는 리서치형 프롬프트입니다.",
    "es-ES": "Prompts de investigación que incorporan datos actuales, cálculos o estructuras generadas con código.",
    "de-DE": "Recherchebasierte Prompts, die aktuelle Fakten, Berechnungen oder codegenerierte Strukturen ins Bild bringen.",
    "fr-FR": "Prompts fondés sur la recherche, intégrant faits actuels, calculs ou structures produites par code.",
    "it-IT": "Prompt basati sulla ricerca che inseriscono nell'immagine dati attuali, calcoli o strutture generate via codice.",
    "pt-PT": "Prompts de pesquisa que integram factos atuais, cálculos ou estruturas geradas por código.",
    "tr-TR": "Güncel gerçekleri, hesaplamaları veya kodla üretilen yapıları görsele taşıyan araştırma odaklı promptlar.",
    "ar-SA": "مطالبات بحثية تدمج الحقائق الحالية أو الحسابات أو البنى المولدة بالبرمجة داخل الصورة.",
    "ru-RU": "Исследовательские промпты, в которых актуальные факты, расчёты или кодовая структура становятся частью изображения.",
    "nl-NL": "Onderzoeksgerichte prompts die actuele feiten, berekeningen of codegegenereerde structuren in het beeld verwerken.",
    "pl-PL": "Prompty badawcze, które włączają do obrazu aktualne fakty, obliczenia lub struktury wygenerowane kodem."
  },
  "precision-editing-scene-preservation": {
    en: "Localized edits that change the target while protecting composition, lighting, identity, and unaffected scene details.",
    zh: "只修改目标区域，同时保护构图、光线、身份与未受影响场景细节。",
    "ja-JP": "構図、照明、同一性、対象外の細部を守りながら指定箇所だけを変更する編集。",
    "ko-KR": "구도, 조명, 정체성, 주변 세부를 유지하면서 목표만 바꾸는 국소 편집입니다.",
    "es-ES": "Ediciones locales que cambian el objetivo y protegen composición, luz, identidad y detalles no afectados.",
    "de-DE": "Lokale Bearbeitungen, die das Ziel ändern und Komposition, Licht, Identität sowie übrige Details bewahren.",
    "fr-FR": "Retouches locales qui modifient la cible tout en préservant composition, lumière, identité et détails intacts.",
    "it-IT": "Modifiche locali che cambiano il soggetto preservando composizione, luce, identità e dettagli non coinvolti.",
    "pt-PT": "Edições locais que alteram o alvo e preservam composição, luz, identidade e pormenores não afetados.",
    "tr-TR": "Hedefi değiştirirken kompozisyonu, ışığı, kimliği ve etkilenmeyen ayrıntıları koruyan yerel düzenlemeler.",
    "ar-SA": "تعديلات موضعية تغيّر الهدف مع حماية التكوين والإضاءة والهوية وبقية تفاصيل المشهد.",
    "ru-RU": "Локальные правки цели с сохранением композиции, света, идентичности и остальных деталей сцены.",
    "nl-NL": "Lokale bewerkingen die het doel wijzigen en compositie, licht, identiteit en overige details behouden.",
    "pl-PL": "Lokalne edycje zmieniające cel przy zachowaniu kompozycji, światła, tożsamości i reszty sceny."
  },
  "multi-reference-composition-identity": {
    en: "Multi-reference compositions that preserve recognizable people, products, garments, or visual systems.",
    zh: "组合多个参考图，同时保持人物、产品、服装或视觉系统的可识别一致性。",
    "ja-JP": "複数の参照を合成しつつ、人物、製品、衣装、視覚システムの同一性を保つワークフロー。",
    "ko-KR": "여러 참조를 결합하면서 인물, 제품, 의상 또는 시각 체계의 일관성을 보존합니다.",
    "es-ES": "Composiciones multirreferencia que conservan personas, productos, prendas o sistemas visuales reconocibles.",
    "de-DE": "Kompositionen aus mehreren Referenzen, die Personen, Produkte, Kleidung oder visuelle Systeme erkennbar halten.",
    "fr-FR": "Compositions multiréférences qui préservent personnes, produits, vêtements ou systèmes visuels reconnaissables.",
    "it-IT": "Composizioni multi-riferimento che conservano persone, prodotti, abiti o sistemi visivi riconoscibili.",
    "pt-PT": "Composições com várias referências que preservam pessoas, produtos, vestuário ou sistemas visuais reconhecíveis.",
    "tr-TR": "İnsanları, ürünleri, kıyafetleri veya görsel sistemleri tanınabilir tutan çoklu referans kompozisyonları.",
    "ar-SA": "تركيبات متعددة المراجع تحافظ على قابلية تمييز الأشخاص أو المنتجات أو الملابس أو الأنظمة البصرية.",
    "ru-RU": "Композиции по нескольким референсам с сохранением узнаваемости людей, продуктов, одежды и визуальных систем.",
    "nl-NL": "Composities met meerdere referenties die personen, producten, kleding of visuele systemen herkenbaar houden.",
    "pl-PL": "Kompozycje wieloreferencyjne zachowujące rozpoznawalność osób, produktów, ubrań lub systemów wizualnych."
  },
  "typography-posters-structured-layouts": {
    en: "Designed visuals where readable type, hierarchy, spacing, and repeatable layout rules matter.",
    zh: "强调文字可读性、信息层级、间距与可复用版式规则的设计视觉。",
    "ja-JP": "読みやすい文字、階層、余白、再利用できるレイアウト規則が重要なデザイン。",
    "ko-KR": "읽기 쉬운 글자, 정보 위계, 간격, 반복 가능한 레이아웃 규칙이 중요한 디자인입니다.",
    "es-ES": "Visuales diseñados donde importan la tipografía legible, la jerarquía, el espaciado y las reglas de composición.",
    "de-DE": "Gestaltete Visuals, bei denen lesbare Schrift, Hierarchie, Abstände und wiederholbare Layoutregeln zählen.",
    "fr-FR": "Visuels conçus autour d'une typographie lisible, d'une hiérarchie, d'espacements et de règles de mise en page.",
    "it-IT": "Visual progettati in cui contano testo leggibile, gerarchia, spaziatura e regole di layout riutilizzabili.",
    "pt-PT": "Visuais de design em que contam texto legível, hierarquia, espaçamento e regras de composição reutilizáveis.",
    "tr-TR": "Okunabilir yazı, hiyerarşi, boşluk ve tekrarlanabilir yerleşim kurallarına dayanan tasarımlar.",
    "ar-SA": "مرئيات مصممة تركز على وضوح النص والتسلسل الهرمي والمسافات وقواعد التخطيط القابلة للتكرار.",
    "ru-RU": "Дизайнерские изображения, где важны читаемый текст, иерархия, интервалы и повторяемые правила макета.",
    "nl-NL": "Ontworpen beelden waarin leesbare tekst, hiërarchie, witruimte en herhaalbare lay-outregels centraal staan.",
    "pl-PL": "Projekty, w których liczą się czytelny tekst, hierarchia, odstępy i powtarzalne zasady układu."
  },
  "sequential-art-social-formats": {
    en: "Carousels, panels, story sequences, and social formats that must remain coherent from frame to frame.",
    zh: "需要跨画面保持连贯的轮播图、多格画面、故事序列与社交媒体格式。",
    "ja-JP": "フレーム間の連続性が必要なカルーセル、コマ、物語シーケンス、SNS形式。",
    "ko-KR": "프레임마다 일관성을 유지해야 하는 캐러셀, 패널, 이야기 시퀀스 및 소셜 형식입니다.",
    "es-ES": "Carruseles, viñetas, secuencias narrativas y formatos sociales coherentes de un cuadro a otro.",
    "de-DE": "Karussells, Panels, Bildfolgen und Social-Formate mit konsistenter Gestaltung über mehrere Frames.",
    "fr-FR": "Carrousels, cases, séquences narratives et formats sociaux cohérents d'une image à l'autre.",
    "it-IT": "Caroselli, pannelli, sequenze narrative e formati social coerenti da un fotogramma all'altro.",
    "pt-PT": "Carrosséis, painéis, sequências narrativas e formatos sociais coerentes entre imagens.",
    "tr-TR": "Kareler arasında tutarlı kalması gereken kaydırmalı gönderiler, paneller, hikâye dizileri ve sosyal formatlar.",
    "ar-SA": "دوارات ولوحات وتسلسلات قصصية وصيغ اجتماعية تحافظ على الاتساق من إطار إلى آخر.",
    "ru-RU": "Карусели, панели, сюжетные последовательности и социальные форматы с межкадровой согласованностью.",
    "nl-NL": "Carrousels, panelen, verhaalsequenties en sociale formats die van beeld tot beeld samenhangend blijven.",
    "pl-PL": "Karuzele, panele, sekwencje fabularne i formaty społecznościowe spójne między kadrami."
  },
  "portraits-texture-art-direction": {
    en: "Portrait and art-direction prompts where likeness, material texture, lighting, and a deliberate visual language lead.",
    zh: "以人物相似度、材质纹理、光线与明确视觉语言为核心的肖像和艺术指导提示词。",
    "ja-JP": "人物の同一性、素材感、照明、意図的な画面言語を重視する肖像・アートディレクション。",
    "ko-KR": "인물 유사성, 재질 질감, 조명과 의도적인 시각 언어를 중심으로 한 인물 및 아트 디렉션입니다.",
    "es-ES": "Prompts de retrato y dirección artística guiados por semejanza, textura, luz y lenguaje visual intencional.",
    "de-DE": "Porträt- und Art-Direction-Prompts mit Fokus auf Ähnlichkeit, Materialtextur, Licht und bewusster Bildsprache.",
    "fr-FR": "Prompts de portrait et direction artistique guidés par la ressemblance, la matière, la lumière et un langage visuel assumé.",
    "it-IT": "Prompt di ritratto e art direction guidati da somiglianza, texture, luce e linguaggio visivo intenzionale.",
    "pt-PT": "Prompts de retrato e direção artística guiados por semelhança, textura, luz e linguagem visual intencional.",
    "tr-TR": "Benzerlik, malzeme dokusu, ışık ve bilinçli görsel dilin öne çıktığı portre ve sanat yönetimi promptları.",
    "ar-SA": "مطالبات للصور الشخصية والتوجيه الفني تقودها الملامح والخامات والإضاءة واللغة البصرية المقصودة.",
    "ru-RU": "Портретные и арт-директорские промпты с акцентом на сходство, фактуру, свет и осознанный визуальный язык.",
    "nl-NL": "Portret- en artdirectionprompts waarin gelijkenis, materiaaltextuur, licht en een bewuste beeldtaal leidend zijn.",
    "pl-PL": "Prompty portretowe i artystyczne oparte na podobieństwie, fakturze, świetle i świadomym języku wizualnym."
  }
};

export function workflowDescription(slug: string, locale: string): string {
  return DESCRIPTIONS[slug]?.[locale] || DESCRIPTIONS[slug]?.en || "";
}
