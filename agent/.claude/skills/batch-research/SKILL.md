---
name: batch-research
description: 批量并发执行信息采集任务的技能。
---

# Batch Research 技能指南

此技能指导 Agent 如何高效、并发地多个数据源采集信息。

## 核心原则

1.  **并行优先**：利用 `Task` 工具的并发调用能力，同时处理多个源。
2.  **动态计算**：能够根据当前日期处理动态 URL（如 Hacker News）。
3.  **结果导向**：关注最终生成的草稿文件数量和质量。

## 使用步骤

### 1. 准备阶段：解析与生成 URL

首先遵循用户的需求。对于其中的动态 URL 规则，你需要进行计算。

**Hacker News 处理示例**：

- 规则：`https://news.ycombinator.com/front?day=YYYY-MM-DD`
- 逻辑：如果不指定特定日期，通常需要抓取过去 3-7 天的内容。
- 操作：你需要为每一天生成一个单独的 URL。
  - 例如，如果是 2025-11-15，且需要过去 3 天，你应该生成：
    - `https://news.ycombinator.com/front?day=2025-11-15`
    - `https://news.ycombinator.com/front?day=2025-11-14`
    - `https://news.ycombinator.com/front?day=2025-11-13`

### 2. 执行阶段：并发调度

不要使用循环逐个调用！请在**单次回复**中构造所有的 `Task` 工具调用。

**正确做法 (Parallel Tool Calls)**：

```text
I will use the Task tool to launch crawler agents for all identified sources.

[Tool Call: Task(subagent_type='crawler', input='Fetch content from https://news.ycombinator.com/front?day=2025-11-15 regarding AIGC...')]
[Tool Call: Task(subagent_type='crawler', input='Fetch content from https://www.anthropic.com/engineering regarding AIGC...')]
[Tool Call: Task(subagent_type='crawler', input='Fetch content from https://baoyu.io/ regarding AIGC...')]
...
```

### 3. 监控阶段：错误处理

- 某个 Agent 失败（返回错误或超时）不应影响其他 Agent。
- 在最终总结中，明确列出：
  - ✅ 成功抓取的源及对应文件。
  - ❌ 失败的源及原因。

## 最佳实践

- **时间参数**：向 `crawler` 传递明确的时间上下文（如 "只保留 2025-11-10 之后的文章"），避免抓取过时内容。
- **去重**：如果同一个链接出现在多个源中（例如 Hacker News 和 Twitter 都推了同一篇文章），`crawler` 可能会生成重复内容，最终整理时留意即可，采集阶段尽量全面。
