# dsh-demo

A near-empty repository for trying dsh-superagent from Feishu.

Ask the bot for anything in plain language; it works in its own worktree,
verifies its change, opens a pull request and reports back in the chat.

https://github.com/yxx-z/dsh-demo

## 待办网页

A small, dependency-free todo page (`index.html`, `styles.css`, `app.js`) that
works offline and adapts to phones and desktops. Open `index.html` directly, or
serve the folder with any static file server:

```sh
python3 -m http.server 8000
```

Todos are stored in the browser's `localStorage`; there is no backend.

### 登录

打开页面会先显示登录页，账号和密码均为 `admin`。登录状态保存在浏览器的
`localStorage` 中，页脚的「退出登录」可以清除。

这是纯前端的演示用登录门禁：校验逻辑和凭据都在 `app.js` 里，只能挡住普通访问，
不能替代服务端鉴权；待办数据本身也没有隔离。

