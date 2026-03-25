---
name: gh-pr-code-review
description: GitHub PR Code Review。当用户使用 /review 命令或要求 review PR 时触发。分析代码变更，检查命名规范、设计合理性、边界条件等，并将评审意见发布到 GitHub PR。首次使用时通过交互式 setup 定制项目评审规则。
user-invocable: true
---

# Code Review

GitHub PR 自动化代码评审工具，支持项目级定制。

## 前置条件

- 已安装并认证 GitHub CLI (`gh`)
- 当前目录是一个 Git 仓库

## 模式判断

1. 用户明确要求 "setup" / "configure" / "配置" → 执行 **Setup Flow**
2. 项目根目录不存在 `.code-review.json` → 执行 **Setup Flow**
3. 否则 → 执行 **Review Flow**

---

## Setup Flow

通过 AskUserQuestion 交互式收集项目信息，生成 `.code-review.json` 配置文件。

### 步骤 1: 语言与框架

**Q1** (AskUserQuestion):
```
这个项目主要使用什么编程语言？（多个用逗号分隔）
例如：TypeScript, Python, Go, Java, C#, Rust
```

**Q2** (AskUserQuestion):
```
使用了哪些框架或主要依赖库？（多个用逗号分隔，没有则回车跳过）
例如：React, Next.js, FastAPI, Spring Boot, Unity, Rails
```

### 步骤 2: 文件过滤

**Q3** (AskUserQuestion):
```
哪些文件需要 Review？请提供 glob 模式，逗号分隔。
例如：**/*.ts, **/*.tsx 或 **/*.py
直接回车则根据语言自动推断。
```

如果用户回车跳过，根据步骤 1 的语言自动生成 include 模式：
- TypeScript → `**/*.ts, **/*.tsx`
- JavaScript → `**/*.js, **/*.jsx`
- Python → `**/*.py`
- Go → `**/*.go`
- Java → `**/*.java`
- C# → `**/*.cs`
- Rust → `**/*.rs`
- Ruby → `**/*.rb`
- 其他语言类推

**Q4** (AskUserQuestion):
```
哪些文件/目录应该跳过？逗号分隔。
例如：**/node_modules/**, **/*.test.*, **/dist/**, **/vendor/**
直接回车使用默认排除规则。
```

如果用户回车跳过，生成合理的默认排除：
- 通用：`**/vendor/**, **/third_party/**, **/*.generated.*, **/*.min.*, **/dist/**, **/build/**`
- 按语言追加：Node→`**/node_modules/**`，Python→`**/__pycache__/**`，Go→`**/go.sum`，等

### 步骤 3: 命名规范

**Q5** (AskUserQuestion):
```
项目遵循什么命名规范？可以选择预设或自定义描述：
1. JavaScript/TypeScript 风格 — 变量/函数 camelCase, 类/组件 PascalCase, 常量 UPPER_SNAKE_CASE
2. Python 风格 — 变量/函数 snake_case, 类 PascalCase, 常量 UPPER_SNAKE_CASE
3. Go 风格 — exported PascalCase, unexported camelCase
4. Java/C# 风格 — 变量 camelCase, 方法 camelCase/PascalCase, 类 PascalCase
5. 自定义（请直接描述）
输入数字选择，或直接描述，或回车根据语言自动选择。
```

### 步骤 4: 自定义规则

**Q6** (AskUserQuestion):
```
有没有项目特有的 Review 规则或特别关注点？（每行一条）
例如：
- API 接口必须做入参校验
- 禁止在生产代码中使用 console.log
- 异步函数必须处理错误
- 数据库查询必须使用参数化查询
输入 'none' 或直接回车跳过。
```

### 步骤 5: 测试范围映射（可选）

**Q7** (AskUserQuestion):
```
是否需要在 Review 后自动生成测试范围建议？
如需要，请提供目录到功能模块的映射（每行一条）：
  目录路径 → 模块名 | 测试重点
例如：
  src/auth/ → 认证模块 | 登录、登出、Token 刷新
  src/api/ → API 层 | 请求响应、错误处理
输入 'skip' 或直接回车跳过。
```

### 步骤 6: 生成框架规则

根据步骤 1 中用户提到的框架，利用内置知识自动补充框架特有的 Review 规则。例如：

- **React**: 组件是否正确处理 re-render、hooks 依赖数组是否完整、key 是否稳定
- **Next.js**: 服务端/客户端组件边界是否正确、数据获取模式是否合理
- **Unity**: UnityEngine.Object 不能用 `?.` 运算符、GetComponent 调用是否被缓存
- **FastAPI/Django**: 路由是否有认证装饰器、ORM 查询是否有 N+1 问题
- **Spring Boot**: Bean 注入是否正确、事务边界是否合理
- 等等

将这些规则放入 `frameworkRules` 字段。

### 步骤 7: 保存配置

将收集的信息保存为项目根目录的 `.code-review.json`：

```json
{
  "version": 1,
  "languages": ["typescript"],
  "frameworks": ["react", "next.js"],
  "filePatterns": {
    "include": ["**/*.ts", "**/*.tsx"],
    "exclude": ["**/*.test.*", "**/*.spec.*", "**/node_modules/**", "**/dist/**"]
  },
  "namingConventions": "JavaScript/TypeScript 社区惯例: 变量/函数 camelCase, 类/组件 PascalCase, 常量 UPPER_SNAKE_CASE",
  "customRules": [
    "API 接口必须做入参校验"
  ],
  "frameworkRules": [
    "React hooks 依赖数组必须完整，避免 stale closure",
    "避免在 render 中创建新的引用类型（对象/数组），应使用 useMemo"
  ],
  "testScopeMapping": {
    "src/auth/": {"module": "认证模块", "testFocus": "登录、登出、Token 刷新"}
  },
  "maxBatchSize": 102400,
  "concurrency": 5
}
```

告知用户：配置已保存到 `.code-review.json`，可以随时直接编辑该文件微调规则。建议将此文件提交到版本控制，以便团队共享 Review 标准。

---

## Review Flow

### 步骤 1: 确定 PR

按优先级确定要 review 的 PR：

1. 用户提供了 PR 编号或 URL → 提取编号使用
2. 尝试自动检测当前分支的 PR：
   ```bash
   gh pr view --json number,title,body,baseRefName,headRefName 2>/dev/null
   ```
3. 如果都没有 → 使用 AskUserQuestion 询问 PR 编号

### 步骤 2: 加载配置

读取项目根目录的 `.code-review.json`。如果不存在，先执行 Setup Flow。

### 步骤 3: 获取 PR 信息并切换到源分支

```bash
# 获取 PR 元信息（提取 baseRefName 作为 target_branch，headRefName 作为 source_branch）
gh pr view <number> --json number,title,body,baseRefName,headRefName,changedFiles
```

**记录当前分支**：
```bash
ORIGINAL_BRANCH=$(git branch --show-current)
```

**安全检查**：
```bash
git status --porcelain
```

- 如果有未提交的修改 → 使用 AskUserQuestion 提示用户：
  ```
  当前工作目录有未提交的修改，切换到 PR 分支会影响这些修改。
  请选择：
  1. 自动 stash（Review 完成后恢复）
  2. 中止 Review，我先手动处理
  ```
  - 用户选 1 → 执行 `git stash push -m "code-review: auto stash before PR #{number}"`
  - 用户选 2 → 终止流程

**切换到源分支并同步远端**：
```bash
git fetch origin -q
gh pr checkout <number>
git reset --hard origin/<headRefName> -q
```

> `git reset --hard` 确保本地代码与远端 PR 分支完全一致，避免本地残留修改干扰 Review 结果。此时用户自己的修改已通过 stash 保护。

### 步骤 4: 拆分 Diff 批次

脚本直接通过本地 `git diff origin/{baseRefName}...HEAD` 获取变更文件和 diff，按大小拆分批次：

```bash
python3 .claude/skills/gh-pr-code-review/scripts/split_diff.py \
  --target-branch <baseRefName> \
  --include "<config.filePatterns.include, 逗号分隔>" \
  --exclude "<config.filePatterns.exclude, 逗号分隔>" \
  --max-batch-size <config.maxBatchSize, 默认 102400> \
  --concurrency <config.concurrency, 默认 5> \
  --output-dir .claude
```

脚本输出 JSON 格式的批次信息。

**小 PR 优化**：如果 `total_batches` 为 1 且 `total_files` ≤ 3，跳过 Sub Agent，直接在主 Agent 中完成 Review。按照 `references/default-guidelines.md` 和配置中的规则检查代码，然后跳到步骤 7。

### 步骤 5: 分组启动 Sub Agent

主 Agent 按 `concurrency` 值将批次分组，每组内并行启动 Sub Agent。

**分组逻辑**：
- 按 concurrency 值分组（默认 5）
- 每组内使用**并行 Agent 工具调用**（一条消息中多个 Agent 调用）
- 等待当前组全部完成后再启动下一组
- Sub Agent 使用 `model: "sonnet"` 以提高效率

**Sub Agent Prompt 模板**：

```
你是 Code Review Sub Agent，负责处理批次 {batch_number}/{total_batches}。

## PR 信息
- PR: #{pr_number} - {pr_title}
- 批次 diff 文件: .claude/review-batch-{batch_number}.diff

## 项目 Review 配置
- 语言: {languages}
- 框架: {frameworks}
- 命名规范: {namingConventions}
- 自定义规则: {customRules + frameworkRules, 每条一行}

## 需要检查的文件
{file_list}

请先读取以下文件获取详细执行指令和检查清单：
1. .claude/skills/gh-pr-code-review/references/sub-agent-instructions.md
2. .claude/skills/gh-pr-code-review/references/default-guidelines.md

然后按照指令执行 Review。注意：当前已在 PR 分支上，可以直接用 Read 工具读取完整源文件来理解上下文。
```

### 步骤 6: 收集结果并失败重试

收集所有 Sub Agent 返回的结果。

**重试逻辑**：
- 如果有 Sub Agent 返回错误或异常状态，重新启动这些批次
- 最多重试 **2 次**
- 仍失败的批次在最终评论中标注

### 步骤 7: 发布 Review 评论

汇总所有 findings，通过 `gh` 发布到 PR：

```bash
gh pr comment <number> --body "<评论内容>"
```

**有问题时的评论格式**：

```markdown
## 🔍 AI Code Review

**Review 范围**: X 个文件（全部检查）| PR #{number}

[汇总所有 Sub Agent 的 findings，按优先级排序]

---
*此评论由 AI Code Review 自动生成 | 配置: .code-review.json*
```

**无问题时的评论格式**：

```markdown
## ✅ AI Code Review

**Review 范围**: X 个文件（全部检查）| PR #{number}

未发现明显问题，代码质量良好！

---
*此评论由 AI Code Review 自动生成 | 配置: .code-review.json*
```

### 步骤 8: 测试范围建议

如果 `.code-review.json` 中 `testScopeMapping` 非空：

1. 将变更文件路径与 testScopeMapping 的目录前缀匹配
2. 根据匹配结果生成测试范围建议（按优先级分 高/中/低）
3. 作为**单独的 PR 评论**发布：

```bash
gh pr comment <number> --body "<测试范围建议>"
```

如果 `testScopeMapping` 为空或未配置，跳过此步骤。

### 步骤 9: 恢复现场并清理

**切回原分支**：
```bash
git checkout <ORIGINAL_BRANCH>
```

**恢复 stash**（如果步骤 3 执行过 stash）：
```bash
git stash pop
```

**清理临时文件**：
```bash
rm -f .claude/review-batch-*.diff
```

---

## 注意事项

1. **只报告实质性问题**，不要吹毛求疵或纠结纯风格偏好
2. **评论必须具体、有建设性**，指出问题并给出改进建议
3. **必须阅读完整文件上下文**，不要仅凭 diff 就下结论
4. **没有问题就说没有问题**，不要强行找问题
5. 完成评论中必须标明已检查的文件总数
6. 所有评论使用**中文**
