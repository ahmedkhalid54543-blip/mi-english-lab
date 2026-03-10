#!/usr/bin/env python3
"""
Mi English 音频批量生成脚本
使用 edge-tts (Microsoft Neural TTS) 为所有词汇/句式/场景/词根生成高质量 mp3。
生成后自动更新 js/audio-manifest.js。

用法:
  python3 scripts/generate-audio.py              # 只生成缺失的 mp3
  python3 scripts/generate-audio.py --force       # 全部重新生成
  python3 scripts/generate-audio.py --voice en-US-AriaNeural  # 换声音

新增场景后只需重跑此脚本，已有 mp3 会自动跳过，只生成新增的。
"""

import asyncio
import json
import os
import re
import sys
import time
from pathlib import Path

# ── 配置 ────────────────────────────────────────────
VOICE = "en-US-JennyNeural"
RATE = "-5%"           # 稍慢一点，适合学习
VOLUME = "+0%"
MAX_RETRIES = 2        # 失败自动重试次数
OUTPUT_BASE = Path(__file__).resolve().parent.parent / "assets" / "audio"
MANIFEST_PATH = Path(__file__).resolve().parent.parent / "js" / "audio-manifest.js"
JS_DIR = Path(__file__).resolve().parent.parent / "js"

# ── 从 JS 文件提取文本 ──────────────────────────────

def read_js(filename):
    path = JS_DIR / filename
    if not path.exists():
        print(f"  跳过 {filename}（文件不存在）")
        return ""
    return path.read_text(encoding="utf-8")


def is_english(text):
    """判断文本是否为英文（不含中文字符）"""
    return not re.search(r'[\u4e00-\u9fff]', text)


def normalize_key(text):
    """生成 manifest 的 key：小写 + 去多余空格"""
    return re.sub(r'\s+', ' ', text.strip().lower())


# ── data.js ──

def extract_vocab(js_text):
    """从 data.js 提取 vocab: id + en 文本"""
    items = []
    for line in js_text.split('\n'):
        id_m = re.search(r'id:\s*.([\w-]+).', line)
        en_m = re.search(r'en:\s*"([^"]+)"', line)
        if id_m and en_m and "-V" in id_m.group(1):
            items.append(("vocab", id_m.group(1), en_m.group(1)))
    return items


def extract_patterns(js_text):
    """从 data.js 提取 pattern: id + example 文本"""
    items = []
    for line in js_text.split('\n'):
        id_m = re.search(r'id:\s*.([\w-]+).', line)
        ex_m = re.search(r'example:\s*"([^"]+)"', line)
        if id_m and ex_m and "-P" in id_m.group(1):
            items.append(("patterns", id_m.group(1), ex_m.group(1)))
    return items


# ── scenarios.js（完整提取所有英文文本类型）──

def extract_scenarios_all(js_text):
    """从 scenarios.js 提取所有英文文本：vocab/upgrade/rescue/options/promptEn"""
    items = []
    idx_counter = {}  # 按子类型计数，确保 ID 唯一

    def next_id(prefix):
        idx_counter[prefix] = idx_counter.get(prefix, 0) + 1
        return f"{prefix}{idx_counter[prefix] - 1}"

    # 1. 场景 vocab（vocab 块内的 en 字段）
    for block in re.findall(r"vocab\s*:\s*\[(.*?)\]", js_text, re.DOTALL):
        for m in re.finditer(r"""en:\s*['"]([^'"]+)['"]""", block):
            items.append(("scenarios", next_id("SC-V"), m.group(1)))

    # 2. upgrade 升级表达（支持转义引号）
    for m in re.finditer(r"""upgrade:\s*'((?:[^'\\]|\\.)+)'""", js_text):
        text = m.group(1).replace("\\'", "'")
        items.append(("scenarios", next_id("SC-UP"), text))
    for m in re.finditer(r'''upgrade:\s*"((?:[^"\\]|\\.)+)"''', js_text):
        text = m.group(1).replace('\\"', '"')
        items.append(("scenarios", next_id("SC-UP"), text))

    # 3. rescue 万能救场句（per step）
    for m in re.finditer(r"""rescue:\s*'([^']{6,})'""", js_text):
        items.append(("scenarios", next_id("SC-RS"), m.group(1)))
    for m in re.finditer(r'''rescue:\s*"([^"]{6,})"''', js_text):
        items.append(("scenarios", next_id("SC-RS"), m.group(1)))

    # 3b. universalRescue 场景级万能句
    for m in re.finditer(r"""universalRescue:\s*'([^']{6,})'""", js_text):
        items.append(("scenarios", next_id("SC-UNI"), m.group(1)))
    for m in re.finditer(r'''universalRescue:\s*"([^"]{6,})"''', js_text):
        items.append(("scenarios", next_id("SC-UNI"), m.group(1)))

    # 4. UNIVERSAL_RESCUE_SENTENCE 全局万能句
    for m in re.finditer(r"""UNIVERSAL_RESCUE_SENTENCE\s*=\s*'([^']+)'""", js_text):
        items.append(("scenarios", next_id("SC-UNI"), m.group(1)))
    for m in re.finditer(r'''UNIVERSAL_RESCUE_SENTENCE\s*=\s*"([^"]+)"''', js_text):
        items.append(("scenarios", next_id("SC-UNI"), m.group(1)))

    # 5. quiz promptEn（题面英文）
    for m in re.finditer(r"""promptEn:\s*'([^']+)'""", js_text):
        if is_english(m.group(1)):
            items.append(("scenarios", next_id("SC-QP"), m.group(1)))
    for m in re.finditer(r'''promptEn:\s*"([^"]+)"''', js_text):
        if is_english(m.group(1)):
            items.append(("scenarios", next_id("SC-QP"), m.group(1)))

    # 6. quiz options en（选项英文，>=10 字符的长句）
    #    跳过 vocab 块里的短 en（已在上面提取）
    #    支持含转义引号的文本 (e.g., next week\'s)
    quiz_blocks = re.findall(r"quiz\s*:\s*\[(.*?)\n    \]", js_text, re.DOTALL)
    for block in quiz_blocks:
        for m in re.finditer(r"""en:\s*'((?:[^'\\]|\\.){10,})'""", block):
            text = m.group(1).replace("\\'", "'")
            if is_english(text):
                items.append(("scenarios", next_id("SC-OPT"), text))
        for m in re.finditer(r'''en:\s*"((?:[^"\\]|\\.){10,})"''', block):
            text = m.group(1).replace('\\"', '"')
            if is_english(text):
                items.append(("scenarios", next_id("SC-OPT"), text))

    # 7. upgrade 表达（也可能含转义引号）
    for m in re.finditer(r"""upgrade:\s*'((?:[^'\\]|\\.){6,})'""", js_text):
        text = m.group(1).replace("\\'", "'")
        items.append(("scenarios", next_id("SC-UP"), text))

    return items


# ── roots.js ──

def extract_roots(js_text):
    """从 roots.js 提取词根 word + example sentence"""
    items = []
    idx = 0
    for m in re.finditer(r"""root:\s*['"]([^'"]+)['"]""", js_text):
        items.append(("roots", f"RT-R{idx}", m.group(1)))
        idx += 1
    idx = 0
    for m in re.finditer(r"""word:\s*['"]([^'"]+)['"]""", js_text):
        items.append(("roots", f"RT-W{idx}", m.group(1)))
        idx += 1
    return items


# ── 汇总 ──

def collect_all_items():
    """收集所有需要生成音频的文本"""
    print("📖 扫描 JS 数据文件...")

    data_js = read_js("data.js")
    scenarios_js = read_js("scenarios.js")
    roots_js = read_js("roots.js")

    items = []
    items.extend(extract_vocab(data_js))
    items.extend(extract_patterns(data_js))
    items.extend(extract_scenarios_all(scenarios_js))
    items.extend(extract_roots(roots_js))

    # 去重（相同文本只生成一次，用第一个出现的 category/id）
    seen_text = set()
    unique = []
    for category, item_id, text in items:
        key = normalize_key(text)
        if key not in seen_text:
            seen_text.add(key)
            unique.append((category, item_id, text))

    counts = {}
    for c, _, _ in items:
        counts[c] = counts.get(c, 0) + 1
    for c in ["vocab", "patterns", "scenarios", "roots"]:
        print(f"  {c:12s} {counts.get(c, 0):4d} 条")
    print(f"  {'去重后':12s} {len(unique):4d} 条唯一文本")

    return unique


# ── 生成 mp3 ────────────────────────────────────────

async def generate_one(text, output_path, voice, rate, volume):
    """用 edge-tts 生成单个 mp3"""
    import edge_tts
    communicate = edge_tts.Communicate(text, voice, rate=rate, volume=volume)
    await communicate.save(str(output_path))


async def generate_all(items, voice, rate, volume, force=False):
    """批量生成所有 mp3，失败自动重试"""
    import edge_tts

    total = len(items)
    generated = 0
    skipped = 0
    failed = []

    print(f"\n🎙️  开始生成（voice: {voice}, rate: {rate}）...")

    for i, (category, item_id, text) in enumerate(items):
        out_dir = OUTPUT_BASE / category
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path = out_dir / f"{item_id}.mp3"

        if out_path.exists() and not force:
            skipped += 1
            continue

        success = False
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                await generate_one(text, out_path, voice, rate, volume)
                generated += 1
                success = True
                break
            except Exception as e:
                if attempt < MAX_RETRIES:
                    await asyncio.sleep(1)
                else:
                    failed.append((item_id, text, str(e)))
                    print(f"  ❌ {item_id}: {text[:40]}... → {e}")

        if (generated + len(failed)) % 50 == 0 and (generated + len(failed)) > 0:
            print(f"  进度: {i+1}/{total}（生成 {generated}，跳过 {skipped}，失败 {len(failed)}）")

    print(f"\n✅ 完成: 生成 {generated}, 跳过 {skipped}, 失败 {len(failed)}")
    if failed:
        print("失败列表:")
        for eid, etxt, emsg in failed[:20]:
            print(f"  {eid}: {etxt[:60]}... → {emsg}")
    return generated, skipped, failed


# ── Manifest ────────────────────────────────────────

def build_manifest(items):
    """扫描所有已有 mp3，构建完整 manifest"""
    entries = {}

    # 先从 items 列表构建（有明确的 text→path 映射）
    for category, item_id, text in items:
        mp3_path = OUTPUT_BASE / category / f"{item_id}.mp3"
        if mp3_path.exists():
            key = normalize_key(text)
            rel_path = f"assets/audio/{category}/{item_id}.mp3"
            entries[key] = rel_path

    # 再扫描 SC-EXT-*.mp3（之前手动补生成的），保留在 manifest 中
    ext_dir = OUTPUT_BASE / "scenarios"
    if ext_dir.exists():
        for mp3 in ext_dir.glob("SC-EXT-*.mp3"):
            # 这些已经在 manifest 里了，从旧 manifest 读取 key
            pass  # 会被下面 merge 逻辑保留

    return entries


def load_existing_manifest():
    """读取现有 manifest 中的 entries"""
    if not MANIFEST_PATH.exists():
        return {}
    text = MANIFEST_PATH.read_text(encoding="utf-8")
    m = re.search(r'entries:\s*(\{[\s\S]*\})\s*\n\s*\};', text)
    if m:
        try:
            return json.loads(m.group(1))
        except json.JSONDecodeError:
            pass
    return {}


def write_manifest(new_entries):
    """合并新旧 entries，写入 manifest"""
    # 旧的保留（SC-EXT 等手动条目），新的覆盖
    existing = load_existing_manifest()
    merged = {**existing, **new_entries}
    sorted_entries = dict(sorted(merged.items()))

    js_content = f"""(function initAudioManifest() {{
  var baseManifest = {{
    version: '{time.strftime("%Y-%m-%d")}',
    locale: 'en-US',
    voice: '{VOICE}',
    entries: {json.dumps(sorted_entries, ensure_ascii=False, indent=6)}
  }};

  var existing = window.MI_AUDIO_MANIFEST;
  if (!existing || typeof existing !== 'object') {{
    window.MI_AUDIO_MANIFEST = baseManifest;
    return;
  }}

  var mergedEntries = Object.assign({{}}, baseManifest.entries,
    existing.entries && typeof existing.entries === 'object' ? existing.entries : {{}});

  window.MI_AUDIO_MANIFEST = Object.assign({{}}, baseManifest, existing, {{ entries: mergedEntries }});
}})();
"""
    MANIFEST_PATH.write_text(js_content, encoding="utf-8")
    print(f"📝 manifest: {len(sorted_entries)} 条映射")


# ── 统计 ────────────────────────────────────────────

def report_size():
    if not OUTPUT_BASE.exists():
        return
    mp3s = list(OUTPUT_BASE.rglob("*.mp3"))
    total = sum(f.stat().st_size for f in mp3s)
    mb = total / (1024 * 1024)
    print(f"📊 音频: {len(mp3s)} 个 mp3, {mb:.1f} MB (avg {total/len(mp3s)/1024:.1f} KB)")


# ── 主流程 ──────────────────────────────────────────

async def main():
    voice = VOICE
    force = False

    for i, arg in enumerate(sys.argv[1:], 1):
        if arg == "--force":
            force = True
        elif arg == "--voice" and i < len(sys.argv) - 1:
            voice = sys.argv[i + 1]
        elif arg.startswith("--voice="):
            voice = arg.split("=", 1)[1]

    items = collect_all_items()
    if not items:
        print("没有找到需要生成的文本")
        return

    generated, skipped, failed = await generate_all(items, voice, RATE, VOLUME, force)

    entries = build_manifest(items)
    write_manifest(entries)
    report_size()

    if failed:
        print(f"\n⚠️  {len(failed)} 条失败，重跑脚本会自动重试（已有的不重复生成）")
        sys.exit(1)
    else:
        print("\n🎉 全部完成，无失败！")


if __name__ == "__main__":
    asyncio.run(main())
