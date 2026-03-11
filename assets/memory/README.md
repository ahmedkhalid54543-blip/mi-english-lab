# assets/memory

这一路径只放词卡记忆层图片素材。

## 目录约束

1. 一张图对应一个 `assetBaseName`
2. 文件统一为 `.png`
3. 文件名必须和 [`docs/content/memory-card-batch-001.json`](/Users/ericlu/Desktop/AI项目/Mini Max 2.6/tools/mi-english-lab/docs/content/memory-card-batch-001.json) 里的 `assetBaseName` 完全一致
4. 不保留 Lovart 默认随机名

## 当前状态

1. D1 已完成：batch-001 清单已冻结
2. D2 待完成：OpenClaw 按 batch-001 出图并上传到本目录
3. D3 已就绪：学习页会自动尝试读取 `assets/memory/{assetBaseName}.png`

## 提交要求

1. 素材变更只提交本目录下的新增或替换图片
2. 不混放草稿、重复版本、截图残片
3. 推荐提交信息：

`feat(memory-assets): add batch-001 Lovart images`
