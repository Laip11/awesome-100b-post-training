# 贡献一个模型

1. 复制 `data/recipes/` 里最接近的一份，文件名用配方的 `id`。
2. 填齐这些字段：`id`、`name`、`org`、`date`、`params_total`、`params_active`、`base_model`、`paradigm_type`（`serial`、`opd` 或 `async_rl`）、`paradigm_label`、`openness`、`source_link`、`source_label`、`infra_stack`、`topology_summary`。
3. `stages` 必须有 `stage_0` 到 `stage_5`。每个阶段包含 `status`（`core`、`standard` 或 `skipped`）、`headline`、`summary`、`methods`、`data_And_filtering`、`infra_notes`、`problems_solved`、`gaps`。`detail` 可选。`problems_solved` 只能引用 `data/problems.json` 里的 id。
4. `summary` 留给泳道卡片，两三句即可。`detail` 写抽屉里的长文，只写 `source_link` 里能对上的内容。来源没写的数字和阶段取舍放进 `gaps`，不要补成肯定句。
5. 运行 `python3 scripts/validate.py && python3 scripts/build.py`。
6. 专属拓扑图是可选的。没有图时，模型仍会出现在泳道、痛点和对比里。要加图，就在 `web/js/pipelines.js` 的 `renderVendorPipelineDiagram` 里按 `recipe.id` 加一个分支。

页面第 5 个视图可以生成一份通过同一套字段的空模板，复制后放到 `data/recipes/`。
