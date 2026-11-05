var ATLAS_DATA = null;

    // =========================================================================
    // 2. UI STATE MANAGEMENT & BRIGHT PALETTE MAPPINGS
    // =========================================================================
    let currentView = 'swimlane';
    let activeParadigm = 'all';
    let activeArchitecture = 'all';
    let activeProblemHighlight = null;
    let searchQuery = '';
    let selectedPipelineModel = 'all';
    let expandedInlineRows = new Set(['rufus-air-106b']); // Default expand Rufus-Air inline pipeline so user immediately sees it!

    const PROBLEM_COLORS = {
      sky: {
        bg: 'bg-sky-50 dark:bg-sky-500/15',
        border: 'border-sky-200 dark:border-sky-500/30',
        text: 'text-sky-700 dark:text-sky-300',
        activeBg: 'bg-sky-600 text-white border-sky-600'
      },
      rose: {
        bg: 'bg-rose-50 dark:bg-rose-500/15',
        border: 'border-rose-200 dark:border-rose-500/30',
        text: 'text-rose-700 dark:text-rose-300',
        activeBg: 'bg-rose-600 text-white border-rose-600'
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-500/15',
        border: 'border-purple-200 dark:border-purple-500/30',
        text: 'text-purple-700 dark:text-purple-300',
        activeBg: 'bg-purple-600 text-white border-purple-600'
      },
      amber: {
        bg: 'bg-amber-50 dark:bg-amber-500/15',
        border: 'border-amber-200 dark:border-amber-500/30',
        text: 'text-amber-700 dark:text-amber-300',
        activeBg: 'bg-amber-600 text-white border-amber-600'
      },
      emerald: {
        bg: 'bg-emerald-50 dark:bg-emerald-500/15',
        border: 'border-emerald-200 dark:border-emerald-500/30',
        text: 'text-emerald-700 dark:text-emerald-300',
        activeBg: 'bg-emerald-600 text-white border-emerald-600'
      },
      indigo: {
        bg: 'bg-indigo-50 dark:bg-indigo-500/15',
        border: 'border-indigo-200 dark:border-indigo-500/30',
        text: 'text-indigo-700 dark:text-indigo-300',
        activeBg: 'bg-indigo-600 text-white border-indigo-600'
      }
    };

    const PARADIGM_BADGES = {
      serial: {
        label: 'Serial',
        classes: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30'
      },
      opd: {
        label: 'Specialist + OPD',
        classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
      },
      async_rl: {
        label: 'Async RL',
        classes: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
      }
    };

    // =========================================================================
    // 3. CUSTOM VISUAL PIPELINE DIAGRAM RENDERER FOR EACH OF THE 7 MODELS
    // =========================================================================
    // =========================================================================
    // 4. VIEW RENDERING LOGIC
    // =========================================================================
    function getProblemById(pid) {
      return ATLAS_DATA.problems.find(p => p.id === pid);
    }

    function renderProblemFilterPills() {
      const container = document.getElementById('problem-pills-container');
      container.innerHTML = ATLAS_DATA.problems.map(prob => {
        const c = PROBLEM_COLORS[prob.color];
        const isActive = activeProblemHighlight === prob.id;
        return `
          <button 
            onclick="toggleProblemHighlight('${prob.id}')" 
            class="px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
              isActive ? c.activeBg + ' shadow-xs scale-[1.02]' : c.bg + ' ' + c.border + ' ' + c.text + ' hover:opacity-90'
            }"
          >
            <span class="w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-current'}"></span>
            <span>${prob.name}</span>
          </button>
        `;
      }).join('');
    }

    function toggleInlinePipeline(recipeId) {
      if (expandedInlineRows.has(recipeId)) {
        expandedInlineRows.delete(recipeId);
      } else {
        expandedInlineRows.add(recipeId);
      }
      renderSwimlaneMatrix();
    }

    function expandAllInlinePipelines() {
      if (expandedInlineRows.size === ATLAS_DATA.recipes.length) {
        expandedInlineRows.clear();
        document.getElementById('expand-all-btn-text').textContent = 'All pipelines';
      } else {
        ATLAS_DATA.recipes.forEach(r => expandedInlineRows.add(r.id));
        document.getElementById('expand-all-btn-text').textContent = 'Hide pipelines';
      }
      renderSwimlaneMatrix();
    }

    function lensView(recipe, lens) {
      if (lens.track) {
        return { cell: recipe.tracks[lens.track], openId: lens.track, extras: [] };
      }
      const parts = lens.stage_ids.map(id => ({ id, cell: recipe.stages[id] }));
      if (lens.optional) {
        const part = parts[0];
        const absent = part.cell.status === 'skipped';
        const cell = absent
          ? Object.assign({}, part.cell, { status: 'skipped', headline: part.cell.headline || '没有在线蒸馏' })
          : part.cell;
        return { cell, openId: part.id, extras: [] };
      }
      const primary = parts.find(part => part.cell.status === 'core') || parts[0];
      const extras = parts.filter(part => part !== primary && part.cell.status !== 'skipped');
      return { cell: primary.cell, openId: primary.id, extras };
    }

    function recipeVariants(recipe) {
      if (recipe.variants && recipe.variants.length) return recipe.variants;
      return [{
        id: recipe.id,
        label: '—',
        params_total: recipe.params_total,
        params_active: recipe.params_active
      }];
    }

    function variantLensView(recipe, variant, lens) {
      const view = lensView(recipe, lens);
      const key = lens.track || view.openId;
      const over = variant && variant.overrides && variant.overrides[key];
      if (!over) return view;
      return Object.assign({}, view, { cell: Object.assign({}, view.cell, over) });
    }

    function renderSwimlaneMatrix() {
      const lenses = ATLAS_DATA.lenses;
      const colSpan = lenses.length + 2;
      // 1. Render Table Header
      const groups = [];
      lenses.forEach(lens => {
        const last = groups[groups.length - 1];
        if (last && last.name === lens.group) {
          last.span += 1;
          last.titles.push(lens.title);
        } else {
          groups.push({ name: lens.group, span: 1, titles: [lens.title] });
        }
      });
      const thead = document.getElementById('swimlane-thead');
      const leafClass = 'min-w-[190px] px-3 py-2.5 text-left text-[13px] font-semibold text-slate-900 dark:text-white border-l border-slate-200 dark:border-slate-800 whitespace-nowrap bg-white dark:bg-slate-900';
      thead.innerHTML = `
        <tr class="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <th rowspan="2" class="w-56 px-4 py-3 sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-left text-xs font-semibold text-slate-700 dark:text-slate-200">Model</th>
          <th rowspan="2" class="w-36 px-3 py-3 sticky left-56 z-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-left text-xs font-semibold text-slate-700 dark:text-slate-200">Variant</th>
          ${groups.map(group => group.span === 1 ? `
            <th rowspan="2" class="${leafClass}">${group.titles[0]}</th>
          ` : `
            <th colspan="${group.span}" class="px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 border-l border-slate-200 dark:border-slate-800">${group.name}</th>
          `).join('')}
        </tr>
        <tr class="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95">
          ${groups.filter(group => group.span > 1).flatMap(group => group.titles).map(title => `
            <th class="${leafClass}">${title}</th>
          `).join('')}
        </tr>
      `;

      // 2. Filter Recipes
      const filteredRecipes = ATLAS_DATA.recipes.filter(r => {
        if (activeParadigm !== 'all' && r.paradigm_type !== activeParadigm) return false;
        if (activeArchitecture !== 'all' && r.architecture !== activeArchitecture) return false;
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const fullText = JSON.stringify(r).toLowerCase();
          if (!fullText.includes(q)) return false;
        }
        return true;
      });

      // 3. Render Table Body + Optional Expanded Pipeline Row
      const tbody = document.getElementById('swimlane-body');
      if (filteredRecipes.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="${colSpan}" class="p-12 text-center text-slate-400">
              No recipes match the current filters.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = filteredRecipes.map(recipe => {
        const pBadge = PARADIGM_BADGES[recipe.paradigm_type];
        const isExpanded = expandedInlineRows.has(recipe.id);
        const variants = recipeVariants(recipe);

        return variants.map((variant, index) => `
          <tr class="group hover:bg-slate-50/90 dark:hover:bg-slate-900/40 transition-colors ${index === 0 ? '' : 'border-t border-dashed border-slate-200 dark:border-slate-800'}">
            ${index === 0 ? `
            <td rowspan="${variants.length}" class="w-56 p-3.5 align-top sticky left-0 z-10 bg-white dark:bg-slate-925 group-hover:bg-slate-50 dark:group-hover:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
              <div class="flex flex-col gap-1.5">
                <div class="flex items-start justify-between gap-1">
                  <div>
                    <span class="font-bold text-base tracking-tight text-slate-900 dark:text-white">${recipe.name}</span>
                    <span class="mt-1 inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide ${recipe.architecture === 'dense' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300'}">${recipe.architecture === 'dense' ? 'Dense' : 'MoE'}</span>
                    <span class="block text-[11px] text-slate-500 dark:text-slate-400">${recipe.org} · ${recipe.date}</span>
                  </div>
                  <a href="${recipe.source_link}" target="_blank" rel="noopener noreferrer" class="text-[11px] font-mono font-semibold text-indigo-600 dark:text-sky-400 hover:underline flex items-center gap-0.5 shrink-0" title="访问原始论文或报告">
                    <span>Paper</span>
                    <i class="ph-bold ph-arrow-up-right"></i>
                  </a>
                </div>

                <!-- Paradigm Badge -->
                <div class="mt-0.5">
                  <span class="inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${pBadge.classes}">
                    ${pBadge.label}
                  </span>
                </div>

                <!-- Dedicated Pipeline Expand Button -->
                <button 
                  onclick="toggleInlinePipeline('${recipe.id}')"
                  class="mt-1.5 w-full px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition flex items-center justify-between ${
                    isExpanded 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' 
                      : 'bg-indigo-50/80 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-slate-700 hover:bg-indigo-100'
                  }"
                >
                  <span class="flex items-center gap-1">
                    <i class="ph-bold ph-git-fork"></i>
                    <span>${isExpanded ? 'Hide pipeline' : 'Show pipeline'}</span>
                  </span>
                  <i class="ph-bold ${isExpanded ? 'ph-caret-up' : 'ph-caret-down'}"></i>
                </button>
              </div>
            </td>` : ''}
            <td class="w-36 p-3 align-top sticky left-56 z-10 bg-white dark:bg-slate-925 border-r border-slate-200 dark:border-slate-800">
              <div class="text-sm font-semibold text-slate-900 dark:text-white">${escapeHtml(variant.label)}</div>
              <div class="mt-1 text-[11px] font-mono text-slate-600 dark:text-slate-300 leading-relaxed">${escapeHtml(variant.params_total)}</div>
              <div class="text-[11px] font-mono text-slate-400">${recipe.architecture === 'dense' ? 'Dense' : 'Active ' + escapeHtml(variant.params_active)}</div>
            </td>

            ${lenses.map(lens => {
              const view = variantLensView(recipe, variant, lens);
              const cell = view.cell;
              const solvesProblem = activeProblemHighlight
                ? cell.problems_solved.includes(activeProblemHighlight)
                : false;
              const isDimmed = activeProblemHighlight && !solvesProblem;

              let statusLabel = 'Reported';
              let statusClass = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300';
              let cardBorder = 'border-slate-200/90 dark:border-slate-800 border-l-indigo-400 bg-white dark:bg-slate-900/90';
              if (cell.status === 'core') {
                statusLabel = 'Core';
                statusClass = 'bg-emerald-600 text-white';
                cardBorder = 'border-emerald-300/90 dark:border-emerald-500/30 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/[0.07]';
              } else if (cell.status === 'skipped') {
                statusLabel = 'Not reported';
                statusClass = 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
                cardBorder = 'border-dashed border-slate-200 dark:border-slate-800 border-l-slate-300 bg-slate-50/80 dark:bg-slate-950/40';
              }

              return `
                <td class="p-2.5 align-top border-r last:border-r-0 border-slate-200/70 dark:border-slate-800/60">
                  <div 
                    onclick="openStageDrawer('${recipe.id}', '${view.openId}')"
                    class="cell-card cursor-pointer h-full p-3 rounded-xl border border-l-4 ${cardBorder} flex flex-col justify-between gap-2.5 ${
                      isDimmed ? 'dimmed-cell' : ''
                    } ${solvesProblem ? 'highlighted-cell' : ''}"
                  >
                    <div class="space-y-2">
                      <span class="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide ${statusClass}">${statusLabel}</span>
                      <h4 class="font-bold text-slate-950 dark:text-white text-sm leading-snug">
                        ${escapeHtml(cell.headline)}
                      </h4>
                      <p class="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        ${escapeHtml(cell.summary)}
                      </p>
                      ${view.extras.map(extra => `
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">Also: ${escapeHtml(extra.cell.headline)}</p>
                      `).join('')}
                    </div>

                    <!-- Problem Tags Solved in this Stage -->
                    <div class="flex flex-wrap items-center gap-1 pt-1">
                      ${cell.problems_solved.map(pid => {
                        const prob = getProblemById(pid);
                        if (!prob) return '';
                        const c = PROBLEM_COLORS[prob.color];
                        return `
                          <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold border ${c.bg} ${c.border} ${c.text}">
                            #${prob.name.split('与')[0]}
                          </span>
                        `;
                      }).join('')}
                      <span class="ml-auto text-[10px] font-medium text-slate-400 hover:text-indigo-600 flex items-center gap-0.5">
                        <span>Details</span>
                        <i class="ph-bold ph-caret-right"></i>
                      </span>
                    </div>
                  </div>
                </td>
              `;
            }).join('')}
          </tr>
        `).join('') + (isExpanded ? `
          <tr class="bg-slate-50/90 dark:bg-slate-925 border-b-2 border-indigo-200/80 dark:border-slate-800">
            <td colspan="${colSpan}" class="p-4">
              ${renderVendorPipelineDiagram(recipe.id)}
            </td>
          </tr>
        ` : '');
      }).join('');
    }

    // Render View 2: Full Dedicated Vendor Training Pipelines Tab
    function renderDedicatedPipelinesView() {
      const selectorContainer = document.getElementById('pipeline-selector-pills');
      selectorContainer.innerHTML = `
        <button onclick="setSelectedPipelineModel('all')" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
          selectedPipelineModel === 'all'
            ? 'bg-indigo-600 text-white shadow-xs'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
        }">
          All (${ATLAS_DATA.recipes.length})
        </button>
        ${ATLAS_DATA.recipes.map(r => `
          <button onclick="setSelectedPipelineModel('${r.id}')" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            selectedPipelineModel === r.id
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }">
            ${r.name}
          </button>
        `).join('')}
      `;

      const list = selectedPipelineModel === 'all'
        ? ATLAS_DATA.recipes
        : ATLAS_DATA.recipes.filter(r => r.id === selectedPipelineModel);

      const container = document.getElementById('dedicated-pipelines-container');
      container.innerHTML = list.map(r => `
        <div class="space-y-2">
          ${renderVendorPipelineDiagram(r.id)}
        </div>
      `).join('');
    }

    function setSelectedPipelineModel(modelId) {
      selectedPipelineModel = modelId;
      renderDedicatedPipelinesView();
    }

    function renderProblemCentricMatrix() {
      const grid = document.getElementById('problem-cards-grid');
      grid.innerHTML = ATLAS_DATA.problems.map(prob => {
        const c = PROBLEM_COLORS[prob.color];

        const solutions = [];
        ATLAS_DATA.recipes.forEach(recipe => {
          ATLAS_DATA.canonical_stages.forEach(stg => {
            const stgData = recipe.stages[stg.id];
            if (stgData && stgData.problems_solved.includes(prob.id)) {
              solutions.push({ recipe, stage: stg, stgData });
            }
          });
        });

        return `
          <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4 shadow-xs">
            <div class="space-y-3">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${c.bg} ${c.border} ${c.text}">
                    ${prob.en}
                  </span>
                  <h3 class="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                    ${prob.name}
                  </h3>
                </div>
                <button 
                  onclick="switchView('swimlane'); toggleProblemHighlight('${prob.id}', true);"
                  class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-indigo-700 dark:text-slate-300 border border-indigo-200 dark:border-slate-700 transition shrink-0 flex items-center gap-1"
                >
                  <i class="ph-bold ph-magnifying-glass"></i>
                  <span>Highlight (${solutions.length})</span>
                </button>
              </div>

              <div class="space-y-2">
                <div class="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30">
                  <div class="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">What works</div>
                  <p class="mt-1 text-sm font-medium text-slate-900 dark:text-white leading-relaxed">${prob.key_takeaway}</p>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed"><span class="font-semibold text-slate-600 dark:text-slate-300">Failure mode. </span>${prob.symptom}</p>
              </div>

              <div class="space-y-2 pt-1">
                <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">Where it shows up</div>
                <div class="divide-y divide-slate-100 dark:divide-slate-800/70 max-h-72 overflow-y-auto pr-1">
                  ${solutions.map(item => `
                    <div 
                      onclick="openStageDrawer('${item.recipe.id}', '${item.stage.id}')"
                      class="py-2.5 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-lg transition"
                    >
                      <div class="space-y-0.5">
                        <div class="flex items-center gap-2">
                          <span class="font-bold text-xs text-slate-900 dark:text-white">${item.recipe.name}</span>
                          <span class="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-sky-400">
                            ${item.stage.code}: ${item.stage.title}
                          </span>
                        </div>
                        <div class="text-sm font-semibold text-slate-900 dark:text-white leading-snug">${escapeHtml(item.stgData.headline)}</div>
                      </div>
                      <i class="ph-bold ph-arrow-right text-slate-400 shrink-0 mt-1"></i>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    function initDiffSelectors() {
      const selA = document.getElementById('diff-select-a');
      const selB = document.getElementById('diff-select-b');
      const optionsHtml = ATLAS_DATA.recipes.map(r => `
        <option value="${r.id}">${r.name} (${r.org} · ${r.params_total}/A${r.params_active})</option>
      `).join('');
      selA.innerHTML = optionsHtml;
      selB.innerHTML = optionsHtml;
      selA.value = 'rufus-air-106b';
      selB.value = 'intellect-3.1-106b';
    }

    function setDiffPair(idA, idB) {
      document.getElementById('diff-select-a').value = idA;
      document.getElementById('diff-select-b').value = idB;
      renderDiffView();
    }

    function renderDiffView() {
      const idA = document.getElementById('diff-select-a').value;
      const idB = document.getElementById('diff-select-b').value;
      const modelA = ATLAS_DATA.recipes.find(r => r.id === idA);
      const modelB = ATLAS_DATA.recipes.find(r => r.id === idB);

      const container = document.getElementById('diff-comparison-container');
      if (!modelA || !modelB) return;

      container.innerHTML = `
        <!-- Visual Pipeline Topology Comparison Block -->
        <div class="space-y-3">
          <div class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <i class="ph-bold ph-git-fork text-indigo-600"></i>
            <span>Pipelines</span>
          </div>
          ${renderVendorPipelineDiagram(modelA.id)}
          ${renderVendorPipelineDiagram(modelB.id)}
        </div>

        <!-- Stage by Stage Comparison -->
        <div class="pt-2 space-y-3">
          <div class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <i class="ph-bold ph-list-checks text-indigo-600"></i>
            <span>Stage comparison</span>
          </div>
          ${ATLAS_DATA.lenses.map(lens => {
            const viewA = lensView(modelA, lens);
            const viewB = lensView(modelB, lens);
            const stgA = viewA.cell;
            const stgB = viewB.cell;
            const stg = lens;
            return `
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 text-xs shadow-2xs">
                <div class="lg:col-span-2 flex flex-col justify-center pr-2 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 pb-2 lg:pb-0">
                  <span class="text-[11px] font-mono font-bold text-indigo-600 dark:text-sky-400">${stg.group === stg.title ? 'Stage' : stg.group}</span>
                  <div class="font-bold text-slate-900 dark:text-white text-sm mt-0.5">${stg.title}</div>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">${stg.subtitle}</div>
                </div>

                <div class="lg:col-span-5 p-3.5 rounded-xl bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                  <div class="font-bold text-slate-950 dark:text-white text-sm leading-snug flex items-start justify-between gap-2">
                    <span>${escapeHtml(stgA.headline)}</span>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 shrink-0">${modelA.name}</span>
                  </div>
                  <p class="text-sm text-slate-800 dark:text-slate-100 leading-relaxed">${escapeHtml(stgA.summary)}</p>
                  ${(stgA.methods || []).length ? `<ul class="list-disc list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-400">${stgA.methods.map(m => `<li>${escapeHtml(m)}</li>`).join('')}</ul>` : ''}
                </div>

                <div class="lg:col-span-5 p-3.5 rounded-xl bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                  <div class="font-bold text-slate-950 dark:text-white text-sm leading-snug flex items-start justify-between gap-2">
                    <span>${escapeHtml(stgB.headline)}</span>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 shrink-0">${modelB.name}</span>
                  </div>
                  <p class="text-sm text-slate-800 dark:text-slate-100 leading-relaxed">${escapeHtml(stgB.summary)}</p>
                  ${(stgB.methods || []).length ? `<ul class="list-disc list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-400">${stgB.methods.map(m => `<li>${escapeHtml(m)}</li>`).join('')}</ul>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // =========================================================================
    // 5. DRAWER INTERACTION
    // =========================================================================
    function escapeHtml(value) {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    function openStageDrawer(recipeId, stageId) {
      const recipe = ATLAS_DATA.recipes.find(r => r.id === recipeId);
      if (!recipe) return;
      const lens = (ATLAS_DATA.lenses || []).find(item => item.track === stageId || (item.stage_ids || []).includes(stageId));
      const stage = ATLAS_DATA.canonical_stages.find(s => s.id === stageId);
      const cell = (recipe.tracks && recipe.tracks[stageId]) || recipe.stages[stageId];
      if (!cell) return;
      const badge = lens ? `${lens.group} · ${lens.title}` : `${stage.code} · ${stage.title}`;

      const headerEl = document.getElementById('drawer-header-content');
      headerEl.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-100 text-indigo-700 dark:bg-sky-500/15 dark:text-sky-400 border border-indigo-200 dark:border-sky-500/20">
            ${badge}
          </span>
          <span class="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            ${recipe.params_total} / A${recipe.params_active}
          </span>
        </div>
        <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2">${recipe.name} · ${recipe.org}</p>
        <h3 class="text-lg font-bold text-slate-950 dark:text-white mt-0.5 leading-snug">
          ${escapeHtml(cell.headline)}
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Base: ${recipe.base_model} · ${recipe.paradigm_label}
        </p>
      `;

      const bodyEl = document.getElementById('drawer-body-content');
      bodyEl.innerHTML = `
        <div class="p-4 rounded-xl bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30">
          <div class="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">Summary</div>
          <p class="lead-claim text-slate-900 dark:text-white mt-1">${escapeHtml(cell.summary)}</p>
        </div>
        ${cell.detail ? `
        <details class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <summary class="cursor-pointer px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300">Source notes</summary>
          <p class="px-4 pb-4 text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">${escapeHtml(cell.detail)}</p>
        </details>` : ''}

        ${(cell.methods || []).length ? `<div class="space-y-2">
          <div class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <i class="ph-bold ph-gear-six text-indigo-600"></i>
            <span>Method</span>
          </div>
          <ul class="space-y-2">
            ${cell.methods.map(m => `
              <li class="p-3 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 leading-relaxed flex items-start gap-2 shadow-2xs">
                <i class="ph-fill ph-check-circle text-emerald-600 shrink-0 mt-0.5"></i>
                <span>${escapeHtml(m)}</span>
              </li>
            `).join('')}
          </ul>
        </div>` : ''}

        ${cell.data_And_filtering ? `<div class="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 space-y-1">
          <div class="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
            <i class="ph-bold ph-funnel"></i>
            <span>Data</span>
          </div>
          <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">${escapeHtml(cell.data_And_filtering)}</p>
        </div>` : ''}

        ${cell.infra_notes ? `<div class="p-4 rounded-xl bg-indigo-50/80 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20 space-y-1">
          <div class="text-xs font-bold text-indigo-800 dark:text-indigo-400 flex items-center gap-1.5">
            <i class="ph-bold ph-cpu"></i>
            <span>Infrastructure</span>
          </div>
          <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">${escapeHtml(cell.infra_notes)}</p>
        </div>` : ''}

        <div class="space-y-2">
          <div class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <i class="ph-bold ph-shield-check text-rose-600"></i>
            <span>Related problems</span>
          </div>
          ${(cell.problems_solved || []).length === 0 ? `
            <div class="text-xs text-slate-400 italic">No problem tag for this cell.</div>
          ` : cell.problems_solved.map(pid => {
            const p = getProblemById(pid);
            if (!p) return '';
            const c = PROBLEM_COLORS[p.color];
            return `
              <div class="p-3 rounded-xl border ${c.bg} ${c.border} space-y-1">
                <div class="font-bold ${c.text}">${p.name} (${p.en})</div>
                <div class="text-[11px] text-slate-700 dark:text-slate-300">${p.key_takeaway}</div>
              </div>
            `;
          }).join('')}
        </div>

        ${(cell.gaps || []).length ? `
        <details class="rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <summary class="cursor-pointer px-4 py-3 text-xs font-semibold text-slate-500">Not in the source (${cell.gaps.length})</summary>
          <ul class="px-4 pb-4 space-y-1.5">
            ${cell.gaps.map(gap => `<li class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">· ${escapeHtml(gap)}</li>`).join('')}
          </ul>
        </details>` : ''}

        <div class="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div class="text-[11px] font-bold uppercase text-slate-400">Other stages · ${recipe.name}</div>
          <div class="grid grid-cols-3 gap-1.5">
            ${ATLAS_DATA.canonical_stages.map(s => `
              <button 
                onclick="openStageDrawer('${recipe.id}', '${s.id}')"
                class="px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-left border transition ${
                  s.id === stageId
                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500'
                }"
              >
                ${s.code}: ${s.title.split(' ')[0]}
              </button>
            `).join('')}
          </div>
        </div>
      `;

      document.getElementById('detail-drawer-backdrop').classList.remove('hidden');
      document.getElementById('detail-drawer').classList.remove('translate-x-full');
    }

    function closeDrawer() {
      document.getElementById('detail-drawer-backdrop').classList.add('hidden');
      document.getElementById('detail-drawer').classList.add('translate-x-full');
    }

    // =========================================================================
    // 6. FILTERS, TABS & REPO EXPORT HELPERS
    // =========================================================================
    function switchView(viewName) {
      currentView = viewName;
      ['swimlane', 'pipelines', 'problems', 'diff', 'repo'].forEach(v => {
        const el = document.getElementById(`view-${v}`);
        const tab = document.getElementById(`tab-${v}`);
        if (v === viewName) {
          el.classList.remove('hidden');
          tab.className = 'view-tab px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all bg-white dark:bg-slate-800 text-indigo-600 dark:text-sky-400 shadow-xs font-semibold';
        } else {
          el.classList.add('hidden');
          tab.className = 'view-tab px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white';
        }
      });

      const controlBar = document.getElementById('control-bar');
      if (viewName === 'swimlane') {
        controlBar.classList.remove('hidden');
      } else {
        controlBar.classList.add('hidden');
      }
    }

    function setArchitectureFilter(kind) {
      activeArchitecture = kind;
      document.querySelectorAll('.arch-btn').forEach(btn => {
        if (btn.dataset.arch === kind) {
          btn.className = 'arch-btn px-3 py-1 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs transition';
        } else {
          btn.className = 'arch-btn px-3 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-400 transition';
        }
      });
      renderSwimlaneMatrix();
    }

    function setParadigmFilter(paradigm) {
      activeParadigm = paradigm;
      document.querySelectorAll('.paradigm-btn').forEach(btn => {
        if (btn.dataset.paradigm === paradigm) {
          btn.className = 'paradigm-btn px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white shadow-xs transition';
        } else {
          btn.className = 'paradigm-btn px-3 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition';
        }
      });
      renderSwimlaneMatrix();
    }

    function toggleProblemHighlight(problemId, forceOn = false) {
      if (forceOn) {
        activeProblemHighlight = problemId;
      } else {
        activeProblemHighlight = activeProblemHighlight === problemId ? null : problemId;
      }
      renderProblemFilterPills();
      renderSwimlaneMatrix();
    }

    function handleSearch(val) {
      searchQuery = val;
      renderSwimlaneMatrix();
    }

    function resetAllFilters() {
      activeParadigm = 'all';
      activeArchitecture = 'all';
      activeProblemHighlight = null;
      searchQuery = '';
      document.getElementById('search-input').value = '';
      setArchitectureFilter('all');
      setParadigmFilter('all');
      renderProblemFilterPills();
      renderSwimlaneMatrix();
    }

    function emptyStage(status, headline, problems) {
      return {
        status: status,
        headline: headline,
        summary: "",
        methods: [],
        data_And_filtering: "",
        infra_notes: "",
        problems_solved: problems,
        detail: "",
        gaps: []
      };
    }

    function updateTemplatePreview() {
      const name = document.getElementById('form-name').value || 'New-Model-100B';
      const orgRaw = document.getElementById('form-org').value || 'Lab · 2026.11';
      const paramsRaw = document.getElementById('form-params').value || '100B Total / 10B Active';
      const paradigm = document.getElementById('form-paradigm').value;
      const paradigmLabels = {
        opd: "Fan-out Specialists -> Unified OPD",
        serial: "Multi-Stage Serial Chain",
        async_rl: "Hub-and-Spoke Async Multi-Env RL"
      };
      const orgParts = orgRaw.split('·').map(part => part.trim());
      const paramParts = paramsRaw.split('/').map(part => part.trim());

      const templateObj = {
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'new-model',
        name: name,
        org: orgParts[0] || orgRaw,
        date: orgParts[1] || "",
        params_total: (paramParts[0] || paramsRaw).replace(/\s*total\s*/i, '').trim(),
        params_active: (paramParts[1] || "").replace(/\s*active\s*/i, '').trim(),
        base_model: "",
        paradigm_type: paradigm,
        paradigm_label: paradigmLabels[paradigm] || paradigm,
        openness: "Open Weights + Tech Report",
        source_link: "",
        source_label: "",
        infra_stack: "slime / verl / NeMo RL",
        topology_summary: "",
        stages: {
          stage_0: emptyStage("standard", "Repo-level code and reasoning annealing", []),
          stage_1: emptyStage("core", "Cold-start trajectories", ["forgetting_conflict"]),
          stage_2: emptyStage("core", "Verifiable RL on math, code, and SWE", ["moe_off_policy", "curriculum_efficiency"]),
          stage_3: emptyStage("core", "Multi-turn tool use and rubric rewards", ["reward_hacking", "env_synthesis"]),
          stage_4: emptyStage("core", "On-policy distillation", ["forgetting_conflict"]),
          stage_5: emptyStage("standard", "General alignment and token efficiency", ["overthinking_latency"])
        }
      };

      document.getElementById('template-json-preview').textContent = JSON.stringify(templateObj, null, 2);
    }

    function copyReadmeMarkdown() {
      let md = `# 100B+ Post-Training Recipes Atlas\n\n`;
      md += `| 模型 | 机构与时间 | 参数规模 (总/激活) | 后训练核心范式 | 底层 RL Infra | 开源程度 |\n`;
      md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
      ATLAS_DATA.recipes.forEach(r => {
        md += `| **${r.name}** | ${r.org} (${r.date}) | ${r.params_total} / A${r.params_active} | ${r.paradigm_label} | \`${r.infra_stack}\` | ${r.openness} |\n`;
      });
      copyTextToClipboard(md, 'GitHub README.md 静态汇总表格已复制！');
    }

    function copyTextToClipboard(text, message) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast(message);
    }

    function copyGeneratedTemplate() {
      const text = document.getElementById('template-json-preview').textContent;
      copyTextToClipboard(text, '新模型 JSON 模板已复制到剪贴板！');
    }

    function copyFullDataset() {
      const text = JSON.stringify(ATLAS_DATA, null, 2);
      copyTextToClipboard(text, '全量 7 模型 JSON 数据源已复制到剪贴板！');
    }

    function showToast(msg) {
      const toast = document.getElementById('toast');
      document.getElementById('toast-msg').textContent = msg;
      toast.classList.remove('translate-y-16', 'opacity-0');
      setTimeout(() => {
        toast.classList.add('translate-y-16', 'opacity-0');
      }, 2400);
    }

    function toggleTheme() {
      const htmlEl = document.documentElement;
      const iconEl = document.getElementById('theme-icon');
      const labelEl = document.getElementById('theme-label');
      if (htmlEl.classList.contains('dark')) {
        htmlEl.classList.remove('dark');
        iconEl.className = 'ph-bold ph-moon text-sm text-indigo-600';
        if (labelEl) labelEl.textContent = '深色';
      } else {
        htmlEl.classList.add('dark');
        iconEl.className = 'ph-bold ph-sun text-sm text-amber-400';
        if (labelEl) labelEl.textContent = '明亮';
      }
    }

    // =========================================================================
    // 7. INITIALIZATION ON LOAD
    // =========================================================================
    function renderAtlas() {
      renderProblemFilterPills();
      renderSwimlaneMatrix();
      renderDedicatedPipelinesView();
      renderProblemCentricMatrix();
      initDiffSelectors();
      renderDiffView();
      updateTemplatePreview();
      document.getElementById('full-json-viewer').textContent = JSON.stringify(ATLAS_DATA, null, 2);
    }

    window.onload = function () {
      fetch('./atlas.json')
        .then(response => {
          if (!response.ok) throw new Error('atlas.json 加载失败');
          return response.json();
        })
        .then(data => {
          ATLAS_DATA = data;
          renderAtlas();
        })
        .catch(error => {
          const main = document.querySelector('main');
          if (main) {
            main.insertAdjacentHTML('afterbegin', `<p class="text-sm text-rose-600">无法加载数据：${escapeHtml(error.message)}。请在 web/ 目录运行 python3 -m http.server 后打开。</p>`);
          }
        });
    };
