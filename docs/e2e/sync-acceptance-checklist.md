# Mi English Lab Sync E2E 验收清单

> 适用版本：`mi-english-lab`  
> 更新时间：2026-03-11  
> 目标：验证 Supabase 登录与跨设备同步是否真实可用

---

## 1. 验收前置条件

在开始前，必须先满足这 4 条：

1. `index.html` / `login.html` / `trainer.html` 已填入真实 Supabase URL 和 anon key
2. `supabase/schema.sql` 已在 Supabase SQL Editor 执行
3. 至少准备两个浏览器环境
   - 例如 Chrome 正常窗口
   - Chrome 无痕窗口
4. 两端都能访问同一个 GitHub Pages lab 站点

如果这 4 条不满足，就不能把“同步可用”判定为通过。

---

## 2. 本轮同步规则

当前版本的同步判断规则如下：

1. `vocabStatus`
   - 以 `vocab_progress.updated_at` 为主
   - 本地 sidecar timestamp 用于和 snapshot 合并
2. `patternStatus`
   - 只走 snapshot
   - 合并时按 sidecar timestamp 决定新旧
3. `selectedRole`
   - 优先参考 `user_roles.updated_at`
   - 若该表无数据，则回退 snapshot + sidecar
4. `scenarioProgress`
   - 以 `scenario_attempts` 聚合结果为主
   - 与本地 `scenario-progress` 按 `updatedAt` 合并
5. `lesson_progress`
   - 不是唯一真相源
   - 只作为辅助展示数据

---

## 3. 必测场景

## 场景 A：登录成功

### 步骤

1. 打开 `login.html`
2. 用测试账号登录
3. 观察提示状态

### 通过标准

1. 登录成功后出现“正在同步进度”
2. 最终出现成功提示
3. 自动跳回首页

---

## 场景 B：词汇状态跨设备同步

### 设备 A

1. 登录同一账号
2. 打开 `learn.html`
3. 标记 3 个词汇：
   - 1 个 `mastered`
   - 1 个 `shaky`
   - 1 个 `unknown`

### 设备 B

1. 登录同一账号
2. 进入首页，等待同步完成
3. 打开 `learn.html`

### 通过标准

1. 设备 B 能看到这 3 个词的对应状态
2. 首页的已掌握数会随之变化
3. 本地 `mi-english-sync-meta-v1` 中有对应 vocab 元信息

---

## 场景 C：句式状态通过 snapshot 跨设备同步

### 设备 A

1. 打开 `learn.html`
2. 切换到“句式”
3. 标记 2 个句式状态

### 设备 B

1. 登录同一账号
2. 打开 `learn.html`
3. 切换到“句式”

### 通过标准

1. 设备 B 能看到对应句式状态
2. 即使没有独立 `pattern_progress` 表，也能通过 snapshot 合并带过去
3. `mi-english-sync-meta-v1` 中有 pattern 元信息

---

## 场景 D：角色路径跨设备同步

### 设备 A

1. 首页选择角色 `retail_store`
2. 等待同步完成
3. 切换到 `gtm_pitch`

### 设备 B

1. 登录同一账号
2. 进入首页

### 通过标准

1. 设备 B 最终显示最近一次保存的角色
2. 推荐路径跟着角色变化
3. 若 `user_roles` 有数据，应与本地 `selectedRole` 一致

---

## 场景 E：场景进度跨设备同步

### 设备 A

1. 进入一个场景
2. 完成一轮答题
3. 确认 `scenario_attempts` 已写入

### 设备 B

1. 登录同一账号
2. 打开 `scenarios.html`

### 通过标准

1. 场景卡片显示已尝试/已通过状态
2. 本地 `mi-english-scenario-progress-v1` 与远端聚合结果一致
3. 如果本地和远端同时存在记录，按 `updatedAt` 取新

---

## 场景 F：离线后恢复同步

### 设备 A

1. 登录账号
2. 断网
3. 在 `learn.html` 标记多个词
4. 在 `scenarios.html` 完成一轮
5. 恢复网络

### 通过标准

1. 本地出现“离线缓存中”状态
2. 恢复网络后自动 flush queue
3. 设备 B 之后能看到这些变更

---

## 场景 G：冲突测试

### 步骤

1. 设备 A 和设备 B 同时登录
2. 选择同一个词
3. 设备 A 先改为 `shaky`
4. 设备 B 稍后改为 `mastered`
5. 两边都刷新或重新进入首页

### 通过标准

1. 最终以较新的 `updatedAt` 结果为准
2. 不出现随机回滚
3. `mi-english-sync-meta-v1` 中能解释为什么某一边胜出

---

## 4. 快速诊断方法

如果同步异常，先检查本地这几项：

1. `localStorage["mi-sync-last-status-v1"]`
2. `localStorage["mi-sync-queue-v1"]`
3. `localStorage["mi-english-sync-meta-v1"]`
4. `localStorage["mi-english-scenario-progress-v1"]`

如果页面已加载 `js/sync-diagnostics.js`，也可以在控制台查看：

```js
window.MiSyncDiagnostics.collect()
```

重点看：

1. `queueSummary.pendingCount`
2. `syncMetaSummary.vocabCount`
3. `syncMetaSummary.patternCount`
4. `lastStatus`

---

## 5. 当前已完成与未完成

### 已完成

1. 本地 sidecar timestamp 结构已落地
2. snapshot merge 已按时间戳合并 vocab / pattern / selectedRole
3. scenarioProgress 已按 `updatedAt` 合并
4. 已有 `sync-meta` 单测

### 仍需真实环境验证

1. 真正的 Supabase 登录
2. 真正的双设备同步
3. 真正的离线恢复
4. 真正的 GitHub Pages 在线页面回归

---

## 6. 判定标准

只有在以下全部满足时，才能说：

**“Mi English Lab 的 Supabase 同步已验证可用。”**

1. 场景 A 到 G 全部通过
2. 无随机覆盖和明显数据回退
3. learner 首页、learn 页、scenarios 页都能稳定读到同步结果
4. 至少完成 1 轮双设备真实测试，不是只做单浏览器自测
