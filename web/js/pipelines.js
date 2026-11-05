function renderVendorPipelineDiagram(recipeId, compactMode = false) {
      const r = ATLAS_DATA.recipes.find(item => item.id === recipeId);
      if (!r) return '';

      // 1. AMAZON RUFUS-AIR: 8-Stage Anti-Hack Serial Chain + Slime/SGLang Bus
      if (recipeId === 'rufus-air-106b') {
        const steps = [
          { num: 'Stage 1', title: 'Broad SFT', sub: '9.01M 公开样本，损失只计助手轮', stageRef: 'stage_1', badge: 'Cold Start', color: 'border-indigo-300 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200' },
          { num: 'Stage 2', title: 'Reasoning RL', sub: 'Math/Logic · GSPO + R3', stageRef: 'stage_2', badge: 'Hard Verifier', color: 'border-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200' },
          { num: 'Stage 3', title: 'Coding RL', sub: '代码沙盒单元测试验证', stageRef: 'stage_2', badge: 'Hard Verifier', color: 'border-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200' },
          { num: 'Stage 4', title: 'IF RL (Rubric)', sub: '仅保留必要 Rubric (防长度膨胀)', stageRef: 'stage_3', badge: 'Anti-Length Hack', color: 'border-sky-300 bg-sky-50/80 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200' },
          { num: 'Stage 5', title: 'Agent RL - I', sub: '单轮工具调用与格式强化', stageRef: 'stage_3', badge: 'Tool Format', color: 'border-amber-300 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200' },
          { num: 'Stage 6', title: 'Agent RL - II', sub: '多轮环境交互与状态追踪', stageRef: 'stage_3', badge: 'Multi-Turn', color: 'border-amber-300 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200' },
          { num: 'Stage 7', title: 'Agent RL - III', sub: '长程多跳 Deep Research 检索', stageRef: 'stage_3', badge: 'Long-Horizon', color: 'border-amber-300 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200' },
          { num: 'Stage 8', title: 'General RLHF', sub: '末置开放域偏好对齐 (防刷分)', stageRef: 'stage_5', badge: 'Soft RM Last', color: 'border-rose-300 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200' }
        ];

        return `
          <div class="p-4 sm:p-5 rounded-2xl border border-indigo-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 bg-dot-grid space-y-3 shadow-xs">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-indigo-600 text-white">Amazon Rufus-Air (106B/A12B)</span>
                <span class="text-xs font-bold text-slate-800 dark:text-slate-100">8 阶段“抗 Reward Hacking 优先级”单链条串行演进拓扑</span>
              </div>
              <span class="text-[11px] text-slate-500 dark:text-slate-400">💡 点击任意阶段节点可打开右侧详细超参与防坑解析</span>
            </div>

            <!-- 8-Stage Horizontal Serial Chain -->
            <div class="flex items-stretch gap-1.5 overflow-x-auto pb-2 pt-1">
              <!-- Base Node -->
              <div class="px-3 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex flex-col justify-center shrink-0 min-w-[125px]">
                <span class="text-[10px] font-mono uppercase text-slate-500 font-bold">Base Checkpoint</span>
                <div class="font-bold text-xs text-slate-900 dark:text-white mt-0.5">GLM-4.5-Air-Base</div>
                <span class="text-[10px] font-mono text-slate-500">106B Total / 12B Act</span>
              </div>

              ${steps.map(st => `
                <div class="flex items-center shrink-0">
                  <i class="ph-bold ph-arrow-right text-slate-400 mx-1 text-sm"></i>
                  <div onclick="openStageDrawer('rufus-air-106b', '${st.stageRef}')" class="pipeline-node cursor-pointer p-2.5 rounded-xl border ${st.color} min-w-[148px] max-w-[165px] flex flex-col justify-between">
                    <div>
                      <div class="flex items-center justify-between gap-1">
                        <span class="text-[10px] font-mono font-bold uppercase opacity-75">${st.num}</span>
                        <span class="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-white/80 dark:bg-slate-900/80 border border-current/20">${st.badge}</span>
                      </div>
                      <div class="font-bold text-xs mt-1">${st.title}</div>
                      <div class="text-[11px] opacity-85 mt-0.5 leading-snug">${st.sub}</div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Bottom Shared Infra Bus -->
            <div onclick="openStageDrawer('rufus-air-106b', 'stage_2')" class="cursor-pointer p-2.5 rounded-xl bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50 dark:from-slate-800 dark:via-slate-850 dark:to-slate-800 border border-indigo-200/80 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div class="flex items-center gap-2 font-semibold text-indigo-900 dark:text-indigo-200">
                <i class="ph-bold ph-cpu text-indigo-600 text-base"></i>
                <span>全程共享底层 RL Infra 总线 (Stage 2 ~ Stage 8):</span>
              </div>
              <div class="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                <span class="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-700 text-indigo-700 dark:text-indigo-300">Slime + SGLang</span>
                <span class="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-700 text-sky-700 dark:text-sky-300">Token-in / Token-out Rollout</span>
                <span class="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-emerald-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-300">R3 (MoE Routing Replay)</span>
                <span class="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-700 text-amber-700 dark:text-amber-300">动态难度过滤: 0 &lt; PassRate &le; 0.8</span>
              </div>
            </div>
          </div>
        `;
      }

      // 2. DEEPSEEK-V4: Fan-out Specialists -> Unified On-Policy Distillation (DAG)
      if (recipeId === 'deepseek-v4') {
        return `
          <div class="p-4 sm:p-5 rounded-2xl border border-emerald-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 bg-dot-grid space-y-3 shadow-xs">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-600 text-white">DeepSeek-V4 (284B/A13B & 1.6T/A49B)</span>
                <span class="text-xs font-bold text-slate-800 dark:text-slate-100">领域专家各自 SFT+GRPO，再由十余个教师做全词表 OPD</span>
              </div>
              <span class="text-[11px] text-slate-500">规避单模型多目标串行训练的梯度冲突与灾难性遗忘</span>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center pt-1">
              <!-- Col 1: Base -->
              <div onclick="openStageDrawer('deepseek-v4', 'stage_0')" class="lg:col-span-2 pipeline-node cursor-pointer p-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-center">
                <span class="text-[10px] font-mono uppercase text-slate-500 font-bold">Stage 0 · Base</span>
                <div class="font-bold text-xs text-slate-900 dark:text-white mt-1">DeepSeek-V4-Base</div>
                <div class="text-[11px] text-slate-500 mt-0.5">1M 上下文；后训练章未单列退火配方</div>
              </div>

              <!-- Col 2: 4 Parallel Specialists -->
              <div class="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2 border-l-2 border-dashed border-emerald-400">
                <div onclick="openStageDrawer('deepseek-v4', 'stage_2')" class="pipeline-node cursor-pointer p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/80 dark:bg-indigo-950/40 dark:border-indigo-800">
                  <span class="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-300">Specialist 1 (SFT + GRPO)</span>
                  <div class="font-bold text-xs text-slate-900 dark:text-white">Math & STEM 推理专家</div>
                  <div class="text-[11px] text-slate-600 dark:text-slate-400">纯粹高难度可验证题库强化</div>
                </div>
                <div onclick="openStageDrawer('deepseek-v4', 'stage_2')" class="pipeline-node cursor-pointer p-2.5 rounded-xl border border-sky-200 bg-sky-50/80 dark:bg-sky-950/40 dark:border-sky-800">
                  <span class="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-300">Specialist 2 (SFT + GRPO)</span>
                  <div class="font-bold text-xs text-slate-900 dark:text-white">SWE & Coding 代码专家</div>
                  <div class="text-[11px] text-slate-600 dark:text-slate-400">仓库级重构与单元测试沙盒</div>
                </div>
                <div onclick="openStageDrawer('deepseek-v4', 'stage_3')" class="pipeline-node cursor-pointer p-2.5 rounded-xl border border-amber-200 bg-amber-50/80 dark:bg-amber-950/40 dark:border-amber-800">
                  <span class="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-300">Specialist 3 (Agent RL)</span>
                  <div class="font-bold text-xs text-slate-900 dark:text-white">长程 Agent 搜索与工具专家</div>
                  <div class="text-[11px] text-slate-600 dark:text-slate-400">多跳检索与复杂环境状态交互</div>
                </div>
                <div onclick="openStageDrawer('deepseek-v4', 'stage_3')" class="pipeline-node cursor-pointer p-2.5 rounded-xl border border-rose-200 bg-rose-50/80 dark:bg-rose-950/40 dark:border-rose-800">
                  <span class="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-300">Specialist 4 (Rubric-GRM)</span>
                  <div class="font-bold text-xs text-slate-900 dark:text-white">自评估 Rubric-GRM 通用专家</div>
                  <div class="text-[11px] text-slate-600 dark:text-slate-400">细粒度评分标准自博弈强化</div>
                </div>
              </div>

              <!-- Col 3: Unified On-Policy Distillation -->
              <div onclick="openStageDrawer('deepseek-v4', 'stage_4')" class="lg:col-span-3 pipeline-node cursor-pointer p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-100 shadow-xs">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-600 text-white">Stage 4 · 核心扇入汇聚</span>
                  <i class="ph-bold ph-arrows-merge text-lg text-emerald-600"></i>
                </div>
                <div class="font-bold text-xs mt-1.5">Unified On-Policy Distillation</div>
                <p class="text-[11px] opacity-85 mt-0.5 leading-snug">
                  学生在自己的轨迹上对齐十余个教师的全词表分布。下面四格是版式示意，论文没有把专家限定成这四类
                </p>
              </div>

              <!-- Col 4: Final RL Polish -->
              <div onclick="openStageDrawer('deepseek-v4', 'stage_5')" class="lg:col-span-2 pipeline-node cursor-pointer p-3 rounded-xl border border-purple-300 bg-purple-50/80 dark:bg-purple-950/40 dark:border-purple-800">
                <span class="text-[10px] font-mono font-bold text-purple-700 dark:text-purple-300">Stage 5 · Polish</span>
                <div class="font-bold text-xs text-slate-900 dark:text-white mt-0.5">没有单独的末置 RLHF</div>
                <div class="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">难验证任务用 GRM；长度惩罚在专家 RL 里</div>
              </div>
            </div>

            <!-- Infra Bar -->
            <div onclick="openStageDrawer('deepseek-v4', 'stage_2')" class="cursor-pointer p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span class="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <i class="ph-bold ph-shield-check text-emerald-600 text-base"></i>
                底层消除隐式偏差的两大关键 Infra 机制:
              </span>
              <div class="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                <span class="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-emerald-700 dark:text-emerald-300">MXFP4 QAT (量化感知后训练，消除训推精度偏移)</span>
                <span class="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-indigo-700 dark:text-indigo-300">Token-level WAL 断点续写采样 (彻底消除故障重采样导致的短回复偏见)</span>
              </div>
            </div>
          </div>
        `;
      }

      // 3. Z.AI GLM-5 / 5.2: Error-Masked SFT -> 4-Domain RL -> Cross-Stage OPD
      if (recipeId === 'glm-5-744b') {
        return `
          <div class="p-4 sm:p-5 rounded-2xl border border-sky-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 bg-dot-grid space-y-3 shadow-xs">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-sky-600 text-white">Z.ai GLM-5 / 5.2 (744B/A40B)</span>
                <span class="text-xs font-bold text-slate-800 dark:text-slate-100">“错误掩码 SFT (Error Masking) → 四域混合 RL → 跨阶段在线策略蒸馏 (Cross-Stage OPD)”拓扑</span>
              </div>
              <span class="text-[11px] font-mono text-sky-600">Powered by Open-Source THUDM/slime</span>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch pt-1">
              <div onclick="openStageDrawer('glm-5-744b', 'stage_1')" class="lg:col-span-3 pipeline-node cursor-pointer p-3 rounded-xl border-2 border-indigo-300 bg-indigo-50/70 dark:bg-indigo-950/40 flex flex-col justify-between">
                <div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-600 text-white">Stage 1 · 核心防坑设计</span>
                  <div class="font-bold text-xs text-slate-900 dark:text-white mt-1.5">专家轨迹 SFT + Error Masking</div>
                  <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    保留真实交互轨迹中的报错尝试上下文，但<strong>将错误动作 Token 的交叉熵 Loss 置零 (Mask)</strong>，让模型学会从报错中恢复而不模仿错误动作。
                  </p>
                </div>
              </div>

              <div onclick="openStageDrawer('glm-5-744b', 'stage_2')" class="lg:col-span-5 pipeline-node cursor-pointer p-3 rounded-xl border border-sky-300 bg-sky-50/70 dark:bg-sky-950/40 flex flex-col justify-between">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-mono font-bold uppercase text-sky-700 dark:text-sky-300">Stage 2 & 3 · 4-Domain Binary Outcome RL</span>
                  <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-sky-200">PD分离 + 增量权重同步</span>
                </div>
                <div class="grid grid-cols-2 gap-1.5 my-2 text-[11px]">
                  <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border border-sky-200/70 font-medium">1. Reasoning 规则验证器</div>
                  <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border border-sky-200/70 font-medium">2. Coding 真实容器沙盒</div>
                  <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border border-sky-200/70 font-medium">3. Agentic 全栈工程环境</div>
                  <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border border-sky-200/70 font-medium">4. General 专用二元 Judge</div>
                </div>
                <div class="text-[11px] text-slate-500">每个专项阶段产出各自领域的最佳历史 Checkpoint</div>
              </div>

              <div onclick="openStageDrawer('glm-5-744b', 'stage_4')" class="lg:col-span-4 pipeline-node cursor-pointer p-3 rounded-xl border-2 border-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 flex flex-col justify-between">
                <div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-600 text-white">Stage 4 · 消除多阶段能力退化</span>
                  <div class="font-bold text-xs text-slate-900 dark:text-white mt-1.5">Cross-Stage On-Policy Distillation</div>
                  <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    前面阶段的检查点当教师。优势来自和学生 logit 的差距，group size 为 1，batch size 为 1024。
                  </p>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      // 4. NVIDIA NEMOTRON 3.5 SUPER: Heavy SWE Mid-Training -> Lightweight SFT -> NeMo Gym Async GRPO -> OPD + MTP
      if (recipeId === 'nemotron-3.5-super') {
        return `
          <div class="p-4 sm:p-5 rounded-2xl border border-emerald-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 bg-dot-grid space-y-3 shadow-xs">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-700 text-white">NVIDIA Nemotron 3.5 Super (120B/A12B)</span>
                <span class="text-xs font-bold text-slate-800 dark:text-slate-100">“前置 Agentic Mid-Training 保可塑性 → NeMo Gym 异步 GRPO → 跨教师蒸馏 + MTP”拓扑</span>
              </div>
              <span class="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">开源 153 个后训练数据集 + NeMo Gym</span>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch pt-1">
              <div onclick="openStageDrawer('nemotron-3.5-super', 'stage_0')" class="lg:col-span-3 pipeline-node cursor-pointer p-3 rounded-xl border-2 border-amber-400 bg-amber-50/80 dark:bg-amber-950/40">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-600 text-white">Stage 0 · 关键前置 (arXiv:2610.22019)</span>
                <div class="font-bold text-xs text-slate-900 dark:text-white mt-1.5">Agentic SWE Mid-Training</div>
                <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                  将海量代码仓库、PR Diff 与 SWE Agent 轨迹前移至退火阶段，<strong>避免长 SFT 锁死分布导致下游 RL 可塑性丧失</strong>。
                </p>
              </div>

              <div onclick="openStageDrawer('nemotron-3.5-super', 'stage_1')" class="lg:col-span-2 pipeline-node cursor-pointer p-3 rounded-xl border border-slate-300 bg-slate-50 dark:bg-slate-800/80 flex flex-col justify-center">
                <span class="text-[10px] font-mono font-bold text-slate-500">Stage 1 · 轻量激发</span>
                <div class="font-bold text-xs text-slate-900 dark:text-white mt-1">Lightweight SFT</div>
                <p class="text-[11px] text-slate-500 mt-0.5">克制训练步数，最大化保留策略探索熵</p>
              </div>

              <div onclick="openStageDrawer('nemotron-3.5-super', 'stage_2')" class="lg:col-span-3 pipeline-node cursor-pointer p-3 rounded-xl border border-indigo-300 bg-indigo-50/70 dark:bg-indigo-950/40">
                <span class="text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300">Stage 2 & 3 · NeMo Gym</span>
                <div class="font-bold text-xs text-slate-900 dark:text-white mt-1">RLVR 与 RLHF 同时训练</div>
                <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                  用 router replay 和 FP32 LM head 压低训推 KL。NVFP4 的 99.62% 恢复写在量化章，不是这一阶段的奖励。
                </p>
              </div>

              <div onclick="openStageDrawer('nemotron-3.5-super', 'stage_4')" class="lg:col-span-2 pipeline-node cursor-pointer p-3 rounded-xl border border-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40">
                <span class="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300">Stage 4 · OPD + MTP</span>
                <div class="font-bold text-xs text-slate-900 dark:text-white mt-1">跨领域教师蒸馏 + 原生投机解码头</div>
                <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">融合专项能力并加速线上推理</p>
              </div>

              <div onclick="openStageDrawer('nemotron-3.5-super', 'stage_5')" class="lg:col-span-2 pipeline-node cursor-pointer p-3 rounded-xl border border-rose-300 bg-rose-50/70 dark:bg-rose-950/40">
                <span class="text-[10px] font-mono font-bold text-rose-700 dark:text-rose-300">Stage 5 · GenRM</span>
                <div class="font-bold text-xs text-slate-900 dark:text-white mt-1">Alignment teacher → MOPD</div>
                <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">生成式奖励模型最终对齐</p>
              </div>
            </div>
          </div>
        `;
      }

      // 5. PRIME INTELLECT INTELLECT-3.1: Same 106B Base -> Heavy SFT -> Hub-and-Spoke Async RLVR
      if (recipeId === 'intellect-3.1-106b') {
        return `
          <div class="p-4 sm:p-5 rounded-2xl border border-amber-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 bg-dot-grid space-y-3 shadow-xs">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-600 text-white">Prime Intellect INTELLECT-3.1 (106B/A12B)</span>
                <span class="text-xs font-bold text-slate-800 dark:text-slate-100">同 GLM-4.5-Air 基座对照：“高密度 SFT → 单循环多环境中心辐射式异步 RLVR”拓扑</span>
              </div>
              <span class="text-[11px] font-mono text-amber-700">prime-rl · verifiers · Environments Hub</span>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center pt-1">
              <div class="lg:col-span-2 p-3 rounded-xl border-2 border-slate-300 bg-slate-100 dark:bg-slate-800 text-center">
                <span class="text-[10px] font-mono uppercase text-slate-500 font-bold">Same Base as Rufus</span>
                <div class="font-bold text-xs text-slate-900 dark:text-white mt-1">GLM-4.5-Air-Base</div>
                <div class="text-[10px] font-mono text-slate-500">106B / A12B</div>
              </div>

              <div onclick="openStageDrawer('intellect-3.1-106b', 'stage_1')" class="lg:col-span-3 pipeline-node cursor-pointer p-3 rounded-xl border border-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/40">
                <span class="text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300">Stage 1 · 模型卡未给样本数</span>
                <div class="font-bold text-xs text-slate-900 dark:text-white mt-1">在 INTELLECT-3 上继续训练</div>
                <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">3.1 卡片没有列出 SFT 条数；6.98M 不能从这张卡核实</p>
              </div>

              <div onclick="openStageDrawer('intellect-3.1-106b', 'stage_2')" class="lg:col-span-3 pipeline-node cursor-pointer p-3.5 rounded-xl border-2 border-amber-500 bg-amber-50/90 dark:bg-amber-950/50">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-600 text-white">Stage 2 & 3 · 中心异步引擎</span>
                <div class="font-bold text-xs text-slate-900 dark:text-white mt-1.5"><code class="font-mono">prime-rl</code> Async Engine</div>
                <p class="text-[11px] text-slate-700 dark:text-slate-300 mt-1">
                  模型卡确认的继续 RL 范围是数学、代码、软件工程和 agent 任务。沙盒预热重叠未写入该卡。
                </p>
              </div>

              <div onclick="openStageDrawer('intellect-3.1-106b', 'stage_3')" class="lg:col-span-4 grid grid-cols-2 gap-1.5 pl-2 border-l-2 border-dashed border-amber-400 text-[11px]">
                <div class="p-2 rounded-lg bg-emerald-50 dark:bg-slate-800 border border-emerald-200 font-semibold text-emerald-900 dark:text-emerald-200">🧮 Math Verifiers</div>
                <div class="p-2 rounded-lg bg-sky-50 dark:bg-slate-800 border border-sky-200 font-semibold text-sky-900 dark:text-sky-200">💻 Competitive Code</div>
                <div class="p-2 rounded-lg bg-purple-50 dark:bg-slate-800 border border-purple-200 font-semibold text-purple-900 dark:text-purple-200">🔬 Science & Logic</div>
                <div class="p-2 rounded-lg bg-amber-50 dark:bg-slate-800 border border-amber-200 font-semibold text-amber-900 dark:text-amber-200">🌐 SWE 与 Agent 任务</div>
              </div>
            </div>
          </div>
        `;
      }

      // 6. XIAOMI MIMO-V2.6: Router-Frozen MoE + 3.7B Token/Step Async RL + Groupwise Agentic Grader
      if (recipeId === 'mimo-v2.6') {
        return `
          <div class="p-4 sm:p-5 rounded-2xl border border-purple-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 bg-dot-grid space-y-3 shadow-xs">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-purple-600 text-white">Xiaomi MiMo-V2.6 (310B/A15B & 1.02T/A42B)</span>
                <span class="text-xs font-bold text-slate-800 dark:text-slate-100">“冻结路由器超大 Batch 异步 RL → 四大 Agent 域 → Groupwise 质量与效率联合评分”拓扑</span>
              </div>
              <span class="text-[11px] font-mono text-purple-700">开源完整 RL 环境套件与 Mini-Harnesses</span>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch pt-1">
              <div onclick="openStageDrawer('mimo-v2.6', 'stage_2')" class="lg:col-span-4 pipeline-node cursor-pointer p-3 rounded-xl border-2 border-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-600 text-white">Stage 2 · 万亿 MoE 稳定核心</span>
                <div class="font-bold text-xs text-slate-900 dark:text-white mt-1.5">MoE Router Freezing + 3.7B Tokens/Step</div>
                <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  在 1M 上下文窗口下直接<strong>冻结各层 MoE 路由器权重</strong>，以单步 2.7B~3.7B Tokens 的超大 Batch 规模进行长程异步 RL，彻底杜绝路由崩溃。
                </p>
              </div>

              <div onclick="openStageDrawer('mimo-v2.6', 'stage_3')" class="lg:col-span-4 pipeline-node cursor-pointer p-3 rounded-xl border border-sky-300 bg-sky-50/70 dark:bg-sky-950/40 flex flex-col justify-between">
                <span class="text-[10px] font-mono font-bold uppercase text-sky-700 dark:text-sky-300">Stage 3 · 四大可组合 Agent Mini-Harnesses</span>
                <div class="grid grid-cols-2 gap-1.5 my-1.5 text-[11px]">
                  <div class="p-2 rounded bg-white dark:bg-slate-900 border border-sky-200 font-medium">⌨️ Coding 工程开发</div>
                  <div class="p-2 rounded bg-white dark:bg-slate-900 border border-sky-200 font-medium">📊 Office 办公自动化</div>
                  <div class="p-2 rounded bg-white dark:bg-slate-900 border border-sky-200 font-medium">🎨 Visual 视觉/前端构建</div>
                  <div class="p-2 rounded bg-white dark:bg-slate-900 border border-sky-200 font-medium">🛡️ Cybersecurity 网络攻防</div>
                </div>
                <span class="text-[10px] text-slate-500">每个环境产出同一 Prompt 下的整组 Rollout 轨迹</span>
              </div>

              <div onclick="openStageDrawer('mimo-v2.6', 'stage_3')" class="lg:col-span-4 pipeline-node cursor-pointer p-3 rounded-xl border-2 border-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-600 text-white">核心奖励创新 · 防轨迹冗长</span>
                <div class="font-bold text-xs text-slate-900 dark:text-white mt-1.5">Groupwise Agentic Grading</div>
                <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  测试通过只是二值信号。高通过率任务用离线 rubric 乘回测试奖励；其余代码任务由在线 grader 在同一组轨迹里重分配优势。
                </p>
              </div>
            </div>
          </div>
        `;
      }

      // 7. MINIMAX-M2.5 / M3: Dual-Loop (200K Automated Docker Synthesis Loop + Task-Routed Forge RL Loop)
      if (recipeId === 'minimax-m2.5') {
        return `
          <div class="p-4 sm:p-5 rounded-2xl border border-amber-300/90 dark:border-slate-800 bg-white dark:bg-slate-900 bg-dot-grid space-y-3 shadow-xs">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-600 text-white">MiniMax-M2 系列 (M2 229.9B/A9.8B)</span>
                <span class="text-xs font-bold text-slate-800 dark:text-slate-100">六步 SWE 环境合成，再按任务类型用 Forge / CISPO 训练</span>
              </div>
              <span class="text-[11px] font-mono text-emerald-700">M3 428B 与 -20% 轮数未在报告中核到</span>
            </div>

            <!-- Upper Loop: Automated Environment Synthesis -->
            <div onclick="openStageDrawer('minimax-m2.5', 'stage_2')" class="pipeline-node cursor-pointer p-3 rounded-xl border border-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40 flex flex-col lg:flex-row lg:items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-600 text-white shrink-0">上环 · 6阶段环境合成引擎</span>
                <span class="font-bold text-xs text-slate-900 dark:text-white">全自动合成 200,000+ 多语言真实 Docker 沙盒:</span>
              </div>
              <div class="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                <span class="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-emerald-200">1. 抓取 10+ 语言 GitHub PR (Go/C++/Rust/TS/Java)</span>
                <i class="ph-bold ph-arrow-right text-emerald-600"></i>
                <span class="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-emerald-200">2. Agent 循环根据报错自动修复编译脚本</span>
                <i class="ph-bold ph-arrow-right text-emerald-600"></i>
                <span class="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-emerald-200 font-bold text-emerald-700">3. 过滤校验产出 200K 可复现容器</span>
              </div>
            </div>

            <!-- Lower Loop: Spec-First SFT + Task-Routed Forge RL -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
              <div onclick="openStageDrawer('minimax-m2.5', 'stage_1')" class="lg:col-span-3 pipeline-node cursor-pointer p-3 rounded-xl border border-indigo-300 bg-indigo-50/70 dark:bg-indigo-950/40">
                <span class="text-[10px] font-mono font-bold text-indigo-700">Stage 1 · 架构师式冷启动</span>
                <div class="font-bold text-xs text-slate-900 dark:text-white mt-1">交错思考 SFT</div>
                <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">思考、动作和观察写在同一条轨迹里。报告没有把“先写 Spec”写成这一阶段的方法</p>
              </div>

              <div onclick="openStageDrawer('minimax-m2.5', 'stage_2')" class="lg:col-span-6 pipeline-node cursor-pointer p-3 rounded-xl border-2 border-amber-400 bg-amber-50/80 dark:bg-amber-950/40">
                <span class="text-[10px] font-mono font-bold text-amber-800 dark:text-amber-300">Stage 2 · 按 PR 任务类型路由可验证奖励 (Task-Routed Verifiable Rewards)</span>
                <div class="grid grid-cols-3 gap-2 mt-1.5 text-[11px]">
                  <div class="p-2 rounded bg-white dark:bg-slate-900 border border-amber-200">
                    <div class="font-bold text-slate-900 dark:text-white">🐞 Bug 修复类</div>
                    <div class="text-[10px] text-slate-500 mt-0.5">F2P (Fail-to-Pass) + P2P 测试通过奖励</div>
                  </div>
                  <div class="p-2 rounded bg-white dark:bg-slate-900 border border-amber-200">
                    <div class="font-bold text-slate-900 dark:text-white">✨ Feature 新增类</div>
                    <div class="text-[10px] text-slate-500 mt-0.5">自动提取新增功能测试点覆盖率</div>
                  </div>
                  <div class="p-2 rounded bg-white dark:bg-slate-900 border border-amber-200">
                    <div class="font-bold text-slate-900 dark:text-white">🚀 Perf 性能优化类</div>
                    <div class="text-[10px] text-slate-500 mt-0.5">P2P + 运行耗时/吞吐提升连续奖励</div>
                  </div>
                </div>
              </div>

              <div onclick="openStageDrawer('minimax-m2.5', 'stage_3')" class="lg:col-span-3 pipeline-node cursor-pointer p-3 rounded-xl border border-rose-300 bg-rose-50/70 dark:bg-rose-950/40">
                <span class="text-[10px] font-mono font-bold text-rose-700">Stage 3 · Forge RL 效率强化</span>
                <div class="font-bold text-xs text-slate-900 dark:text-white mt-1">交互轮数与挂钟耗时压缩</div>
                <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">在 BrowseComp 与办公流环境中联合惩罚冗余工具调用</p>
              </div>
            </div>
          </div>
        `;
      }

      return '';
    }
