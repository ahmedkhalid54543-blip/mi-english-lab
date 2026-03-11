# Mi English 词卡记忆层编写指南

## 1. 目标

这套记忆层只服务 `learn.html` 的词汇卡背。

目标不是重写主词库，而是给高频词补一层更好记的内容：

1. 词根 / 构词拆解
2. 联想记忆钩子
3. 使用提示
4. Lovart 图像位

主词库仍然以 [`js/data.js`](/Users/ericlu/Desktop/AI项目/Mini Max 2.6/tools/mi-english-lab/js/data.js) 为准。
记忆层一律走 sidecar：

1. 结构化清单：[`docs/content/memory-card-batch-001.json`](/Users/ericlu/Desktop/AI项目/Mini Max 2.6/tools/mi-english-lab/docs/content/memory-card-batch-001.json)
2. 运行时数据：[`js/memory-data.js`](/Users/ericlu/Desktop/AI项目/Mini Max 2.6/tools/mi-english-lab/js/memory-data.js)

## 2. 字段规范

每个词卡条目至少包含：

```json
{
  "lessonId": "L01",
  "vocabId": "L01-V10",
  "en": "tailor-made",
  "zh": "量身定制的 / 度身定做的",
  "assetBaseName": "tailor-made",
  "imageTitle": "tailor-made",
  "breakdownType": "compound",
  "breakdown": [
    { "part": "tailor", "gloss": "裁缝" },
    { "part": "made", "gloss": "做出来的" }
  ],
  "literal": "像裁缝按你的尺寸一针一线做出来。",
  "hook": "想象培训经理拿着通用课表想糊弄你，结果一位裁缝冲出来拿卷尺量你。",
  "usageTip": "用于表达定制课程、方案或服务。",
  "visualPrompt": "Bright clean business-learning illustration for tailor-made..."
}
```

可选字段：

1. `rootConnection`
2. `scene`
3. 后续批次的 `batchId` 扩展字段

## 3. 内容边界

必须遵守：

1. `breakdown` 只写真实的词根、构词或短语拆分，不伪造词源。
2. `hook` 可以幽默，但不能把联想说成真实来源。
3. `usageTip` 只负责商务使用语境，不再重复中文释义。
4. 一张卡只保留一个主钩子，不堆三四个记法。

不适合优先做联想卡的词：

1. 完整句子模板
2. 纯数据标签，例如 `YoY`、`MoM` 这类需要公式理解的缩写
3. 占位符太多的表达
4. 视觉锚点极弱、拆分也不稳定的抽象功能词

## 4. 命名规则

图片文件名和 `assetBaseName` 必须完全一致。

规则：

1. 全部小写
2. 空格转 `-`
3. 原本的 `-` 保留
4. 去掉括号、斜杠等不安全字符
5. 输出统一为 `.png`

示例：

1. `tailor-made` -> `tailor-made.png`
2. `work-life balance` -> `work-life-balance.png`
3. `click-through rate (CTR)` -> `click-through-rate-ctr.png`

## 5. D1 / D2 / D3 串联

### D1

Codex / Claude Code 负责：

1. 选词
2. 写拆解
3. 写 hook
4. 写 `visualPrompt`
5. 定 `assetBaseName`

### D2

OpenClaw 只负责：

1. 读取 batch JSON
2. 按 `visualPrompt` 出图
3. 重命名为 `assetBaseName.png`
4. 上传到 `assets/memory/`

### D3

Codex / Claude Code 负责：

1. 把图片路径和词卡数据对上
2. 渲染到学习页
3. 做无图和无数据降级

## 6. Prompt 写法

统一风格：

1. 明亮干净
2. 轻微幽默
3. 商务学习感
4. 单一核心隐喻
5. 不要文字、水印、复杂背景

推荐句式：

```text
Bright clean business-learning illustration for {word}: {single clear scene}. Light humor, warm orange accents, simple background, no text, no watermark.
```

## 7. 当前 batch-001 覆盖

当前首批覆盖 30 词，优先选择：

1. 商务高频词
2. 可拆分、可视化的短语
3. 能和词根页形成弱联动的词，例如 `visibility`、`visual merchandising`、`rapid promotion`

后续新增批次时，不要直接改旧条目语义；新建：

1. `memory-card-batch-002.json`
2. 对应更新 `js/memory-data.js`
