# 100B+ Post-Training Recipes Atlas

2025–2026 公开的百亿和千亿模型后训练配方。每个模型一份 JSON，页面只负责渲染。行按公开时间从早到晚排列。

泳道卡片保持短摘要。点开阶段卡片后，右侧抽屉里的长文只写从来源核对过的内容；来源没写清的超参、配比和阶段取舍列在「来源里没有写清」。

## 数据

- `data/backbone.json`：看板自己的 6 个对比阶段，不是某一篇论文的阶段名
- `data/problems.json`：6 个工程痛点
- `data/recipes/<id>.json`：一个模型的阶段、来源和缺口

改完数据后运行：

```bash
python3 scripts/validate.py
python3 scripts/build.py
```

`build.py` 会先跑校验。校验失败时不改 `web/atlas.json`。校验通过后写出 `web/atlas.json`，并替换下面表格。

本地看页面：

```bash
cd web && python3 -m http.server 8765
```

然后打开 `http://127.0.0.1:8765/`。直接用 `file://` 打开时，浏览器不会加载 `atlas.json`。

## 模型一览

<!-- RECIPES:START -->
| 模型 | 机构与时间 | 参数规模 (总/激活) | 后训练核心范式 | 底层 RL Infra | 开源程度 | 来源 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Llama 3.1** | Meta (2024.07) | 405B / A405B | SFT, rejection sampling, and DPO | `Dense Transformer; no PPO` | Open weights under the Llama 3 Community License | [arXiv:2407.21783](https://arxiv.org/abs/2407.21783) |
| **DeepSeek-R1** | DeepSeek (2025.01) | V3-Base / AV3-Base | GRPO on V3-Base; R1 adds cold start and a second RL | `GRPO` | Open weights + Nature paper | [Nature 2025 / arXiv:2501.12948](https://arxiv.org/abs/2501.12948) |
| **Llama 4** | Meta (2025.04) | 109B / 400B / A17B | Light SFT, online RL, light DPO | `Online RL with continual prompt filtering` | Open weights for Scout and Maverick | [Meta release note, April 2025](https://ai.meta.com/blog/llama-4-multimodal-intelligence/) |
| **Qwen3** | Alibaba (2025.05) | 235B / A22B | Long-CoT cold start, reasoning GRPO, mode-fusion SFT, general RL | `GRPO` | Open weights + technical report | [arXiv:2505.09388](https://arxiv.org/abs/2505.09388) |
| **Kimi K2** | Moonshot (2025.07) | 1.04T / A32B | Agentic SFT then joint verifiable and self-critic RL | `MuonClip; Gym-like RL` | Open base and instruct weights, Modified MIT | [arXiv:2507.20534](https://arxiv.org/abs/2507.20534) |
| **INTELLECT-3.1** | Prime Intellect (2026.02 - 05) | 106B / A12B | SFT + Massively Parallel Multi-Env Async RLVR | `prime-rl + verifiers + Environments Hub (500+ Envs)` | Full Weights + 6.98M SFT & 70K RL Data + prime-rl + Environments Hub | [HF 模型卡：PrimeIntellect/INTELLECT-3.1](https://huggingface.co/PrimeIntellect/INTELLECT-3.1) |
| **GLM-5** | Z.ai (智谱) (2026.02 - 06) | 744B / A40B | Error-Masked SFT + Multi-Domain RL + Cross-Stage OPD | `slime + vime (PD-Disaggregated Rollout + Delta Weight Sync)` | Open Weights + Detailed Report + Open-source `slime` Framework | [arXiv:2602.15763 & slime Blog](https://arxiv.org/abs/2602.15763) |
| **MiniMax-M2** | MiniMax (2026.02 - 07) | 229.9B / A9.8B | 200K Automated Multilingual Docker Envs + Forge RL | `Forge RL + 200,000+ Multilingual SWE Sandboxes` | Open Weights (M2.5) + Tech Report + Deep Engineering Blogs | [arXiv:2605.26494](https://arxiv.org/abs/2605.26494) |
| **DeepSeek-V4** | DeepSeek (2026.04 - 08) | 284B / 1.6T / A13B / 49B | Divide-and-Conquer Specialists + Unified OPD | `MXFP4 Post-Training QAT + Token-level WAL Resumable Rollout` | Open Weights + Deep Infra & Algorithm Technical Report | [arXiv:2606.19348](https://arxiv.org/abs/2606.19348) |
| **Nemotron 3.5** | NVIDIA (2026.04 - 10) | 120B / 30B / A12B / 3B | Agentic Mid-Training + Async GRPO + Multi-Teacher OPD | `NeMo RL + NeMo Gym (NVFP4 Support + Native MTP)` | Full Weights + 153 Open Datasets + NeMo RL & NeMo Gym | [arXiv:2610.38095；mid-training 配方另见 arXiv:2610.22019](https://arxiv.org/abs/2610.38095) |
| **Rufus-Air** | Amazon (2026.09) | 106B / A12B | 8-Stage Anti-Hacking Serial Pipeline | `Slime + SGLang (Token-in/Token-out + R3 Routing Replay)` | Full Recipe + Open Data + Slime/SGLang Infra | [arXiv:2609.29421](https://arxiv.org/abs/2609.29421) |
| **MiMo-V2.6** | Xiaomi (小米) (2026.10) | 310B / 1.02T / A15B / 42B | Ultra-Large Batch Async RL + Groupwise Agentic Grading | `2.7B-3.7B Tokens/Step Async RL + MoE Router Freezing` | Open Weights + Full Open-Source RL Dev Suite (Envs + Harnesses) | [arXiv:2610.11959](https://arxiv.org/abs/2610.11959) |
<!-- RECIPES:END -->

加一个模型的步骤见 [CONTRIBUTING.md](CONTRIBUTING.md)。
