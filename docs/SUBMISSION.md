# ProofMesh submission packet

Target form: [AI³ Growth 黑客松作品提交](https://hackathonweekly.feishu.cn/share/base/form/shrcnaF4yF8HmLhA42AH7DWlrPc)

## Ready-to-paste fields

### 1. 项目名

ProofMesh — 多智能体可审计事实验证

### 2. 队伍成员姓名（队长写第一个）

待填写：队长及队员真实姓名

### 3. 手机号

待填写：可联系手机号

### 4. 邮箱

待填写：常用邮箱

### 5. 赛道

Gonka: AI for Society

### 6. GitHub 链接（需公开项目）

https://github.com/hnaymyh123-henry/ProofMesh

### 7. 作品体验网址/名称

ProofMesh Web App  
https://proofmesh-audit.ym2752columbia.chatgpt.site

Sites 访问模式已设为 `public`，并已使用未登录请求验证。

### 8. 作品介绍/技术说明

ProofMesh 是一个面向公共信息环境的多智能体事实验证 Web App。用户输入一条文章、帖子或事实主张后，系统会先拆解可验证的原子命题，再由 Kimi K2.6 Investigator 检索和整理独立证据，由 MiniMax M2.7 Challenger 主动寻找反例、证据缺口和过度推断，最后由 Consensus Agent 综合双方结论，给出 0–100 Truth Score、判定范围、不确定性以及“什么新证据会改变当前结论”。

产品通过 GonkaRouter 调用不同模型，并在结果中保留模型名称、请求 ID、证据来源、时间线和完整审计记录。与只返回一个答案的事实核查工具不同，ProofMesh 把每次验证变成一个可检查、可复盘、可更新、可导出的 case file，让用户能够理解结论是如何形成的，也能清楚看到不同 Agent 的分歧。

技术栈：TypeScript、React / vinext、GonkaRouter OpenAI-compatible API、Kimi K2.6、MiniMax M2.7、Google News RSS、Wikipedia Action API、OpenAI Sites。API Key 只保存在服务端 Secret 中，不会暴露给浏览器。

核心流程：Claim Mapping → Evidence Retrieval → Adversarial Challenge → Consensus Calibration → Auditable Case File。

### 9. 产品演示视频链接

https://github.com/hnaymyh123-henry/ProofMesh/releases/download/v0.1.0-demo/ProofMesh-Demo-EN.mp4

视频时长 1 分 35 秒，使用真实 GonkaRouter 模型调用，完整展示输入、Agent 协作、最终判定、证据、模型分歧、审计记录和 Proof Card 导出。

### 10. 授权确认

需要参赛者本人确认并选择“好，我已知晓并同意”。该项授权赛事方将提交材料用于评审、展示、宣传和活动复盘，但不转让项目知识产权。

## Final submission checklist

- [x] 产品核心流程可用
- [x] 英文提示版 Demo 视频已生成
- [x] README 包含功能、安装、运行和技术接入说明
- [ ] 参赛者姓名、手机号、邮箱已确认
- [x] GitHub 仓库已创建并设为 public
- [x] Sites Demo 已改为 public，并用无登录环境验证
- [x] 视频公开链接可下载
- [ ] 参赛者本人确认授权条款
- [ ] 在飞书表单点击最终“提交”
