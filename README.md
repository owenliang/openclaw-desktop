# OpenClaw Desktop

AgentScope OpenClaw 桌面客户端 - 一款支持 AI 对话和任务自动化的现代化桌面应用。

> 本项目为 OpenClaw 的桌面端应用，后端服务请参考 [openclaw](https://github.com/owenliang/openclaw) 项目。

## 界面截图

### 主聊天界面
![主聊天界面](images/desktop.png)

### 认证界面
![认证界面](images/auth.png)

### 定时任务管理
![定时任务](images/cron.png)

## 架构图

```mermaid
graph TB
    subgraph "主进程"
        MP[Electron 主进程]
        CM[右键菜单]
        FD[文件对话框]
        MN[应用菜单]
        NT[通知系统]
        TR[系统托盘]
    end

    subgraph "预加载脚本"
        PL[Preload 脚本]
    end

    subgraph "渲染进程"
        subgraph "组件层"
            CHAT[聊天组件]
            CRON[定时任务组件]
            LAYOUT[布局组件]
        end
        subgraph "服务层"
            API[API 服务]
            CS[聊天服务]
            CRS[定时任务服务]
            SS[技能服务]
        end
        subgraph "状态管理"
            CHS[聊天状态]
            CRS_S[定时任务状态]
            SES[会话状态]
            UIS[UI 状态]
        end
    end

    MP <-->|IPC 通信| PL
    PL <-->|安全桥接| CHAT
    PL <-->|安全桥接| CRON
    CHAT --> CS
    CRON --> CRS
    CS --> API
    CRS --> API
    SS --> API
    CS --> CHS
    CRS --> CRS_S
    CHAT --> SES
    CHAT --> UIS
```

## 技术栈

| 类别 | 技术 |
|------|------|
| **框架** | Electron 28 |
| **UI 库** | React 18 |
| **语言** | TypeScript 5.3 |
| **构建工具** | Vite 5 |
| **状态管理** | Zustand |
| **打包工具** | Electron Forge |
| **样式方案** | CSS / Tailwind-ready |

## 项目结构

```
├── src/
│   ├── main/           # Electron 主进程
│   ├── preload.ts      # 预加载脚本（安全 IPC）
│   └── renderer/       # React 渲染进程
│       ├── components/ # UI 组件
│       ├── services/   # API 服务
│       ├── stores/     # Zustand 状态管理
│       └── utils/      # 工具函数
├── images/             # 截图
└── assets/             # 图标和静态资源
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发模式
npm run start

# 打包应用
npm run package

# 构建分发包
npm run make
```
