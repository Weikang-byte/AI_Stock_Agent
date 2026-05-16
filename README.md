# A股强势复盘台

一个零前端依赖的本地网站，用于每天自动整理最近一个完整交易日中涨势较强的 A 股，输出统计量、图表和股票观察列表。

## 本地预览

```bash
python3 -m http.server 4173
```

浏览器打开 `http://localhost:4173`。

## 生成日报

```bash
python3 scripts/daily_report.py
```

脚本会优先抓取新浪财经 A 股分页行情；如果主源失败，会降级使用东方财富涨幅前排行情池，生成：

- `data/report-latest.json`：网站默认读取的最新日报
- `data/reports/report-YYYY-MM-DD.json`：按日期归档
- `data/history.json`：用于后续扩展历史趋势

默认筛选规则：

- 涨跌幅 ≥ `5%`
- 成交额 ≥ `5000 万`
- 排除 `ST`、`*ST`、退市风险名称

可以调整参数：

```bash
python3 scripts/daily_report.py --min-pct 6 --min-amount 100000000 --top 200
```

## 每日自动化

### GitHub Pages 自动更新

项目已经内置 GitHub Actions workflow：

- `.github/workflows/update-and-deploy.yml`

推送到 GitHub 后，它会：

1. 在每周二到周六北京时间 `07:40` 自动运行 `python scripts/daily_report.py`，生成前一个交易日的复盘
2. 更新 `data/report-latest.json`、`data/history.json` 和 `data/reports/`
3. 自动提交更新后的日报数据
4. 部署静态网站到 GitHub Pages

首次使用时，在 GitHub 仓库里打开：

```text
Settings -> Pages -> Build and deployment -> Source -> GitHub Actions
```

也可以在 GitHub 的 `Actions` 页面手动运行 `Update A-share report and deploy site`，立刻生成并部署一次。

### 本机 cron 自动更新

如果也想让本机每天早上自动生成前一交易日复盘，可以用 cron：

```bash
crontab -e
```

加入一行，把路径替换成你的实际路径：

```cron
40 7 * * 2-6 cd /Users/weikangchen/Documents/Stocks && /usr/local/bin/python3 scripts/daily_report.py >> daily_report.log 2>&1
```

如果希望收盘后复盘当天，把时间改为 `16:30` 或更晚。

## 数据和风险

数据源为公开行情快照，可能受网络、接口限流、节假日、停复牌和复权口径影响。本网站只做统计整理，不构成投资建议。
