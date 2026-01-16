# CLI 工具详细设计文档

## 1. 设计目标与定位

CLI 工具是 **ui 层源码交付模式的核心支撑设施**，用于在不引入黑盒依赖的前提下，将标准化的业务 UI 资产安全、可控地引入到 seed 项目中。

CLI 的目标不是“生成项目”，而是：

> **管理业务 UI 资产的引入、更新与约束，确保架构边界在真实工程中不被破坏。**

它是连接：

- core（npm 包，稳定）
- ui（模板资产，可定制）
- seed（真实项目，持续演进）

的**工程粘合层**。

---

## 2. CLI 在整体架构中的角色

```
core (npm)
   ▲
   │  API 契约
   │
ui templates (repo)
   ▲
   │  CLI 管理
   │
seed project
```

CLI：

- 不参与业务运行时
- 不打包进最终产物
- 只在「开发阶段」发挥作用

---

## 3. 设计原则

### 3.1 源码所有权明确

- CLI 生成的代码 **完全归 seed 项目所有**
- CLI 不对生成代码进行运行时控制

### 3.2 最小侵入原则

- 不修改 seed 现有工程结构
- 不注入隐藏运行逻辑

### 3.3 可回溯原则

- 所有生成的资产必须可追踪来源
- 支持后续升级与 diff

---

## 4. CLI 的核心职责

CLI 工具主要负责以下四类能力：

1. **业务 UI 资产初始化**
2. **组件级别的按需引入**
3. **资产版本与元信息管理**
4. **升级辅助（非强制）**

CLI 不负责：

- 项目构建
- 依赖安装（仅提示）
- 业务逻辑生成

---

## 5. CLI 命令设计

### 5.1 基础命令结构

```
terence <command> [options]
```

### 5.2 核心命令

#### 5.2.1 init

初始化 ui 资产管理环境。

```
terence init
```

行为：

- 检测 seed 项目类型（React）
- 创建 ui 资产目录（如 src/ui）
- 生成 ui.config.json

---

#### 5.2.2 add

添加指定业务组件源码。

```
terence add OrderForm
```

行为：

- 从 ui 模板中拷贝组件目录
- 写入组件元信息
- 检查 core 依赖版本

---

#### 5.2.3 list

查看已引入的 ui 组件。

```
terence list
```

---

#### 5.2.4 upgrade（辅助）

辅助升级 ui 组件模板。

```
terence upgrade OrderForm
```

行为：

- 对比模板版本
- 提示差异
- 由开发者手动决策

---

## 6. 组件资产描述模型

每个 ui 组件必须包含元信息文件：

```
OrderForm/
├── meta.json
├── OrderForm.view.jsx
├── OrderForm.adapter.js
└── index.js
```

### meta.json 示例

```json
{
  "name": "OrderForm",
  "version": "1.0.0",
  "core": {
    "engine": "order",
    "minVersion": "^1.2.0"
  }
}
```

---

## 7. ui.config.json 设计

seed 项目根目录维护 ui.config.json：

```json
{
  "uiDir": "src/ui",
  "components": {
    "OrderForm": {
      "version": "1.0.0",
      "source": "@ui/order-form"
    }
  }
}
```

该文件用于：

- 追踪已引入组件
- 支持升级与审计

---

## 8. 升级与 Diff 策略

### 8.1 升级哲学

- CLI **不自动覆盖代码**
- 升级是辅助行为，而非强制

### 8.2 升级流程

1. 比较 meta.json 版本
2. 生成 diff 报告
3. 开发者手动合并

---

## 9. CLI 与 core / ui 的解耦

- CLI 不解析 core 代码
- CLI 不理解业务含义
- CLI 只基于文件与元信息工作

这保证了 CLI 的长期稳定性。

---

## 10. 错误与安全策略

- 非法目录结构 → 直接失败
- core 版本不满足 → 明确警告
- 禁止 silent fallback

---

## 11. 扩展能力预留

未来 CLI 可扩展：

- 模板来源切换（本地 / git / registry）
- 批量升级
- 资产校验

---

## 12. 设计总结

CLI 工具的本质不是“脚手架”，而是：

> **业务 UI 资产的生命周期管理器。**

它通过源码交付、元信息约束与非侵入式升级，确保：

- ui 层可自由定制
- core 行为不被破坏
- seed 项目可持续演进

在整个体系中，CLI 是保证“架构理想”落地为“工程现实”的关键一环。
