#!/usr/bin/env python3
"""Generate the latest A-share momentum report for the static dashboard."""

from __future__ import annotations

import argparse
import json
import math
import statistics
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "data" / "report-latest.json"
ARCHIVE_DIR = ROOT / "data" / "reports"
HISTORY_FILE = ROOT / "data" / "history.json"
CN_TZ = ZoneInfo("Asia/Shanghai")

EASTMONEY_URLS = [
    "http://82.push2.eastmoney.com/api/qt/clist/get",
    "http://push2.eastmoney.com/api/qt/clist/get",
]

SINA_URL = "http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeData"

EASTMONEY_FIELDS = [
    "f12",  # code
    "f14",  # name
    "f2",   # latest price
    "f3",   # pct change
    "f4",   # price change
    "f5",   # volume
    "f6",   # amount
    "f7",   # amplitude
    "f8",   # turnover rate
    "f9",   # dynamic PE
    "f10",  # volume ratio
    "f15",  # high
    "f16",  # low
    "f17",  # open
    "f18",  # previous close
    "f20",  # total market cap
    "f21",  # free float market cap
    "f23",  # PB
    "f24",  # 60-day pct change
    "f25",  # year-to-date pct change
    "f62",  # main net inflow
]

MARKET_FIELDS = [
    "f12",
    "f14",
    "f2",
    "f3",
]


@dataclass
class Stock:
    code: str
    name: str
    board: str
    price: float | None
    pct_change: float | None
    change: float | None
    volume: float | None
    amount: float | None
    amplitude: float | None
    turnover_rate: float | None
    pe_dynamic: float | None
    volume_ratio: float | None
    high: float | None
    low: float | None
    open_price: float | None
    prev_close: float | None
    total_market_cap: float | None
    free_market_cap: float | None
    pb: float | None
    pct_60d: float | None
    pct_ytd: float | None
    main_net_inflow: float | None

    @property
    def close_position(self) -> float | None:
        if self.price is None or self.high is None or self.low is None:
            return None
        spread = self.high - self.low
        if spread <= 0:
            return None
        return max(0.0, min(1.0, (self.price - self.low) / spread))

    @property
    def is_limit_up_like(self) -> bool:
        pct = self.pct_change
        if pct is None:
            return False
        if self.board == "北交所":
            return pct >= 29.5
        if self.board in {"创业板", "科创板"}:
            return pct >= 19.5
        return pct >= 9.75


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate an A-share momentum report JSON.")
    parser.add_argument("--min-pct", type=float, default=5.0, help="Minimum daily percentage gain for the strong sample.")
    parser.add_argument("--min-amount", type=float, default=50_000_000, help="Minimum turnover amount in CNY.")
    parser.add_argument("--top", type=int, default=160, help="Maximum number of strong stocks to keep in the report.")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="Path to report-latest.json.")
    parser.add_argument("--target-date", type=str, default=None, help="Report date label, YYYY-MM-DD. Defaults to the latest completed trading day approximation.")
    parser.add_argument("--include-st", action="store_true", help="Include ST and delisting-risk names.")
    args = parser.parse_args()

    now = datetime.now(CN_TZ)
    target_date = args.target_date or latest_completed_trading_day(now).strftime("%Y-%m-%d")
    warnings: list[str] = []
    try:
        stocks = fetch_sina_all_a_shares()
        data_source = "新浪财经 A股行情快照"
        report = build_report(
            market_stocks=stocks,
            detail_stocks=stocks,
            data_source=data_source,
            now=now,
            target_date=target_date,
            min_pct=args.min_pct,
            min_amount=args.min_amount,
            top_n=args.top,
            exclude_st=not args.include_st,
            warnings=warnings,
        )
    except RuntimeError as error:
        warnings.append(f"新浪财经分页行情失败，已降级使用东方财富涨幅前排详情池：{error}")
        try:
            stocks = fetch_detail_pool()
            data_source = "东方财富 A股实时行情快照（降级）"
            report = build_report(
                market_stocks=stocks,
                detail_stocks=stocks,
                data_source=data_source,
                now=now,
                target_date=target_date,
                min_pct=args.min_pct,
                min_amount=args.min_amount,
                top_n=args.top,
                exclude_st=not args.include_st,
                warnings=warnings,
            )
        except RuntimeError as second_error:
            warnings.append(f"东方财富详情池也不可用，已降级使用本地缓存报告：{second_error}")
            report = load_cached_report(now, warnings)

    write_report(report, args.output)
    print(f"Wrote {args.output} with {len(report.get('top_stocks', []))} strong stocks for {report.get('report_date', target_date)}.")


def load_cached_report(now: datetime, warnings: list[str]) -> dict[str, Any]:
    """Fallback to last generated report when network access is unavailable."""
    candidates: list[Path] = []
    if DEFAULT_OUTPUT.exists():
        candidates.append(DEFAULT_OUTPUT)
    if ARCHIVE_DIR.exists():
        candidates.extend(sorted(ARCHIVE_DIR.glob("report-*.json")))
    if not candidates:
        raise RuntimeError("no cached report found under data/")  # pragma: no cover
    cached_path = max(candidates, key=lambda path: path.stat().st_mtime)
    cached = json.loads(cached_path.read_text(encoding="utf-8"))
    if not isinstance(cached, dict):
        raise RuntimeError(f"cached report {cached_path} is invalid")

    cached["generated_at"] = now.isoformat(timespec="seconds")
    cached["data_source"] = f"{cached.get('data_source', '本地缓存')}（离线缓存）"
    cached.setdefault("data_quality", {})
    cached["data_quality"]["warnings"] = list(dict.fromkeys((cached["data_quality"].get("warnings") or []) + warnings))
    return cached


def fetch_sina_all_a_shares(page_size: int = 100, max_pages: int = 80) -> list[Stock]:
    rows: list[dict[str, Any]] = []
    for page in range(1, max_pages + 1):
        params = {
            "page": page,
            "num": page_size,
            "sort": "changepercent",
            "asc": 0,
            "node": "hs_a",
            "symbol": "",
            "_s_r_a": "page",
        }
        query = urllib.parse.urlencode(params)
        request = f"{SINA_URL}?{query}"
        last_error: Exception | None = None
        for attempt in range(2):
            try:
                with urllib.request.urlopen(request, timeout=10) as response:
                    payload = response.read().decode("gb18030", errors="ignore")
                page_rows = json.loads(payload)
                if not isinstance(page_rows, list):
                    raise RuntimeError(f"unexpected Sina response on page {page}")
                if not page_rows:
                    stocks = [parse_sina_stock(row) for row in rows]
                    return [stock for stock in stocks if stock.code and stock.name]
                rows.extend(page_rows)
                break
            except (urllib.error.URLError, TimeoutError, RuntimeError, json.JSONDecodeError) as error:
                last_error = error
                time.sleep(0.5 + attempt * 0.6)
        else:
            raise RuntimeError(f"Failed to fetch Sina page {page}: {last_error}") from last_error
        time.sleep(0.03)
        if len(page_rows) < page_size:
            break
    stocks = [parse_sina_stock(row) for row in rows]
    stocks = [stock for stock in stocks if stock.code and stock.name]
    if len(stocks) < 100:
        raise RuntimeError(f"Sina returned too few rows: {len(stocks)}")
    return stocks


def fetch_market_overview(page_size: int = 100) -> list[Stock]:
    first_page = fetch_eastmoney_page(1, page_size, MARKET_FIELDS)
    total = int(first_page.get("total") or 0)
    rows = list(first_page.get("diff") or [])
    pages = max(1, math.ceil(total / page_size))
    for page in range(2, pages + 1):
        time.sleep(0.08)
        rows.extend(fetch_eastmoney_page(page, page_size, MARKET_FIELDS).get("diff") or [])
    stocks = [parse_stock(row) for row in rows]
    return [stock for stock in stocks if stock.code and stock.name]


def fetch_detail_pool(page_size: int = 5000) -> list[Stock]:
    data = fetch_eastmoney_page(1, page_size, EASTMONEY_FIELDS)
    stocks = [parse_stock(row) for row in data.get("diff") or []]
    return [stock for stock in stocks if stock.code and stock.name]


def fetch_eastmoney_page(page: int, page_size: int, fields: list[str]) -> dict[str, Any]:
    params = {
        "pn": page,
        "pz": page_size,
        "po": 1,
        "np": 1,
        "ut": "bd1d9ddb04089700cf9c27f6f7426281",
        "fltt": 2,
        "invt": 2,
        "fid": "f3",
        "fs": "m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23",
        "fields": ",".join(fields),
    }
    query = urllib.parse.urlencode(params)
    last_error: Exception | None = None
    for base_url in EASTMONEY_URLS:
        request = f"{base_url}?{query}"
        for attempt in range(3):
            try:
                with urllib.request.urlopen(request, timeout=20) as response:
                    payload = json.loads(response.read().decode("utf-8"))
                data = payload.get("data")
                if not data:
                    raise RuntimeError(f"empty Eastmoney response for page {page}")
                return data
            except (urllib.error.URLError, TimeoutError, RuntimeError, json.JSONDecodeError) as error:
                last_error = error
                time.sleep(0.4 + attempt * 0.5)
    raise RuntimeError(f"Failed to fetch Eastmoney page {page}: {last_error}") from last_error


def parse_stock(row: dict[str, Any]) -> Stock:
    return Stock(
        code=str(row.get("f12") or "").zfill(6),
        name=str(row.get("f14") or ""),
        board=board_for_code(str(row.get("f12") or "")),
        price=clean_number(row.get("f2")),
        pct_change=clean_number(row.get("f3")),
        change=clean_number(row.get("f4")),
        volume=clean_number(row.get("f5")),
        amount=clean_number(row.get("f6")),
        amplitude=clean_number(row.get("f7")),
        turnover_rate=clean_number(row.get("f8")),
        pe_dynamic=clean_number(row.get("f9")),
        volume_ratio=clean_number(row.get("f10")),
        high=clean_number(row.get("f15")),
        low=clean_number(row.get("f16")),
        open_price=clean_number(row.get("f17")),
        prev_close=clean_number(row.get("f18")),
        total_market_cap=clean_number(row.get("f20")),
        free_market_cap=clean_number(row.get("f21")),
        pb=clean_number(row.get("f23")),
        pct_60d=clean_number(row.get("f24")),
        pct_ytd=clean_number(row.get("f25")),
        main_net_inflow=clean_number(row.get("f62")),
    )


def parse_sina_stock(row: dict[str, Any]) -> Stock:
    price = clean_number(row.get("trade"))
    high = clean_number(row.get("high"))
    low = clean_number(row.get("low"))
    return Stock(
        code=str(row.get("code") or "").zfill(6),
        name=str(row.get("name") or ""),
        board=board_for_code(str(row.get("code") or "")),
        price=price,
        pct_change=clean_number(row.get("changepercent")),
        change=clean_number(row.get("pricechange")),
        volume=clean_number(row.get("volume")),
        amount=clean_number(row.get("amount")),
        amplitude=calc_amplitude(high, low, clean_number(row.get("settlement"))),
        turnover_rate=clean_number(row.get("turnoverratio")),
        pe_dynamic=clean_number(row.get("per")),
        volume_ratio=None,
        high=high,
        low=low,
        open_price=clean_number(row.get("open")),
        prev_close=clean_number(row.get("settlement")),
        total_market_cap=scale_sina_market_cap(row.get("mktcap")),
        free_market_cap=scale_sina_market_cap(row.get("nmc")),
        pb=clean_number(row.get("pb")),
        pct_60d=None,
        pct_ytd=None,
        main_net_inflow=None,
    )


def build_report(
    market_stocks: list[Stock],
    detail_stocks: list[Stock],
    data_source: str,
    now: datetime,
    target_date: str,
    min_pct: float,
    min_amount: float,
    top_n: int,
    exclude_st: bool,
    warnings: list[str],
) -> dict[str, Any]:
    valid = [stock for stock in market_stocks if stock.pct_change is not None and stock.price is not None]
    detailed_valid = [stock for stock in detail_stocks if stock.pct_change is not None and stock.price is not None]
    tradable = [stock for stock in detailed_valid if not exclude_st or not is_risk_name(stock.name)]
    selected = [
        stock for stock in tradable
        if (stock.pct_change or 0) >= min_pct and (stock.amount or 0) >= min_amount
    ]
    selected.sort(key=lambda stock: ((stock.pct_change or -999), (stock.amount or 0)), reverse=True)
    selected = selected[:top_n]

    pct_values = [stock.pct_change for stock in valid if stock.pct_change is not None]
    selected_pct = [stock.pct_change for stock in selected if stock.pct_change is not None]
    selected_turnover = [stock.turnover_rate for stock in selected if stock.turnover_rate is not None and stock.turnover_rate >= 0]
    advancers = sum(1 for stock in valid if (stock.pct_change or 0) > 0)
    decliners = sum(1 for stock in valid if (stock.pct_change or 0) < 0)
    unchanged = len(valid) - advancers - decliners
    limit_up_count = sum(1 for stock in selected if stock.is_limit_up_like)
    strong_close_count = sum(1 for stock in selected if (stock.close_position or 0) >= 0.8)
    selected_amount = sum(stock.amount or 0 for stock in selected)

    board_stats = build_board_stats(selected)
    report = {
        "generated_at": now.isoformat(timespec="seconds"),
        "report_date": target_date,
        "data_source": data_source,
        "selection_rule": {
            "min_pct_change": min_pct,
            "min_amount": min_amount,
            "exclude_st": exclude_st,
        },
        "data_quality": {
            "market_rows": len(market_stocks),
            "detail_rows": len(detail_stocks),
            "warnings": warnings,
        },
        "summary": {
            "total_count": len(market_stocks),
            "valid_count": len(valid),
            "advancers": advancers,
            "decliners": decliners,
            "unchanged": unchanged,
            "advance_ratio": ratio(advancers, len(valid)),
            "mean_pct": safe_mean(pct_values),
            "median_pct": safe_median(pct_values),
            "top_decile_pct": percentile(pct_values, 90),
            "selected_count": len(selected),
            "limit_up_count": limit_up_count,
            "strong_close_count": strong_close_count,
            "selected_amount": selected_amount,
            "median_turnover_rate": safe_median(selected_turnover),
            "avg_selected_pct": safe_mean(selected_pct),
        },
        "insights": build_insights(valid, selected, board_stats, min_pct, min_amount),
        "charts": {
            "pct_change_histogram": build_histogram(pct_values),
            "board_leadership": board_stats,
        },
        "top_stocks": [stock_to_json(stock, rank) for rank, stock in enumerate(selected, start=1)],
    }
    return report


def build_board_stats(stocks: list[Stock]) -> list[dict[str, Any]]:
    buckets: dict[str, list[Stock]] = defaultdict(list)
    for stock in stocks:
        buckets[stock.board or "其他"].append(stock)
    stats = []
    for board, items in buckets.items():
        stats.append({
            "board": board,
            "count": len(items),
            "avg_pct": safe_mean([item.pct_change for item in items if item.pct_change is not None]),
            "amount": sum(item.amount or 0 for item in items),
        })
    return sorted(stats, key=lambda item: (item["count"], item["amount"]), reverse=True)


def build_insights(
    valid: list[Stock],
    selected: list[Stock],
    board_stats: list[dict[str, Any]],
    min_pct: float,
    min_amount: float,
) -> list[dict[str, str]]:
    selected_count = len(selected)
    valid_count = max(1, len(valid))
    selected_amount = sum(stock.amount or 0 for stock in selected)
    strong_close_count = sum(1 for stock in selected if (stock.close_position or 0) >= 0.8)
    limit_count = sum(1 for stock in selected if stock.is_limit_up_like)
    top_board = board_stats[0] if board_stats else {"board": "--", "count": 0}
    concentration = 0.0
    if selected_amount:
        top20_amount = sum(stock.amount or 0 for stock in selected[:20])
        concentration = ratio(top20_amount, selected_amount)

    return [
        {
            "label": "强势扩散",
            "value": str(selected_count),
            "text": f"涨幅不低于 {min_pct:.1f}% 且成交额不低于 {format_cny(min_amount)} 的样本占全市场 {selected_count / valid_count * 100:.2f}%。",
        },
        {
            "label": "资金承载",
            "value": format_cny(selected_amount),
            "text": f"前 20 只强势股贡献了强势样本 {concentration:.1f}% 的成交额，可观察资金是否继续集中。",
        },
        {
            "label": "收盘质量",
            "value": f"{ratio(strong_close_count, max(1, selected_count)):.1f}%",
            "text": f"{strong_close_count} 只强势股收在日内区间上沿，涨停附近样本 {limit_count} 只。",
        },
        {
            "label": "市场结构",
            "value": str(top_board["board"]),
            "text": f"{top_board['board']} 强势样本数量最多，共 {top_board['count']} 只，适合作为次日结构观察起点。",
        },
    ]


def build_histogram(values: list[float]) -> list[dict[str, Any]]:
    bins = [
        ("<-7%", None, -7),
        ("-7~-5%", -7, -5),
        ("-5~-3%", -5, -3),
        ("-3~-1%", -3, -1),
        ("-1~0%", -1, 0),
        ("0~1%", 0, 1),
        ("1~3%", 1, 3),
        ("3~5%", 3, 5),
        ("5~7%", 5, 7),
        ("7~10%", 7, 10),
        ("10~20%", 10, 20),
        (">20%", 20, None),
    ]
    output = []
    for label, low, high in bins:
        count = 0
        for value in values:
            if low is None and value < high:
                count += 1
            elif high is None and value >= low:
                count += 1
            elif low is not None and high is not None and low <= value < high:
                count += 1
        output.append({"label": label, "count": count})
    return output


def stock_to_json(stock: Stock, rank: int) -> dict[str, Any]:
    return {
        "rank": rank,
        "code": stock.code,
        "name": stock.name,
        "board": stock.board,
        "price": round_number(stock.price, 2),
        "pct_change": round_number(stock.pct_change, 2),
        "change": round_number(stock.change, 2),
        "volume": round_number(stock.volume, 0),
        "amount": round_number(stock.amount, 0),
        "amplitude": round_number(stock.amplitude, 2),
        "turnover_rate": round_number(stock.turnover_rate, 2),
        "pe_dynamic": round_number(stock.pe_dynamic, 2),
        "pb": round_number(stock.pb, 2),
        "volume_ratio": round_number(stock.volume_ratio, 2),
        "total_market_cap": round_number(stock.total_market_cap, 0),
        "free_market_cap": round_number(stock.free_market_cap, 0),
        "pct_60d": round_number(stock.pct_60d, 2),
        "pct_ytd": round_number(stock.pct_ytd, 2),
        "main_net_inflow": round_number(stock.main_net_inflow, 0),
        "close_position": round_number(stock.close_position, 3),
        "limit_up": stock.is_limit_up_like,
    }


def write_report(report: dict[str, Any], output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    text = json.dumps(report, ensure_ascii=False, indent=2)
    output.write_text(text + "\n", encoding="utf-8")
    archive = ARCHIVE_DIR / f"report-{report['report_date']}.json"
    archive.write_text(text + "\n", encoding="utf-8")
    update_history(report)


def update_history(report: dict[str, Any]) -> None:
    HISTORY_FILE.parent.mkdir(parents=True, exist_ok=True)
    if HISTORY_FILE.exists():
        try:
            history = json.loads(HISTORY_FILE.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            history = []
    else:
        history = []
    item = {
        "report_date": report["report_date"],
        "generated_at": report["generated_at"],
        "selected_count": report["summary"]["selected_count"],
        "limit_up_count": report["summary"]["limit_up_count"],
        "advance_ratio": report["summary"]["advance_ratio"],
        "selected_amount": report["summary"]["selected_amount"],
    }
    history = [row for row in history if row.get("report_date") != report["report_date"]]
    history.append(item)
    history.sort(key=lambda row: row.get("report_date", ""))
    HISTORY_FILE.write_text(json.dumps(history[-260:], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def latest_completed_trading_day(now: datetime) -> datetime:
    candidate = now
    if now.weekday() >= 5 or now.hour < 15 or (now.hour == 15 and now.minute < 30):
        candidate = now - timedelta(days=1)
    while candidate.weekday() >= 5:
        candidate -= timedelta(days=1)
    return candidate


def board_for_code(code: str) -> str:
    code = code.zfill(6)
    if code.startswith(("300", "301")):
        return "创业板"
    if code.startswith("688"):
        return "科创板"
    if code.startswith(("600", "601", "603", "605")):
        return "沪市主板"
    if code.startswith(("000", "001", "002", "003")):
        return "深市主板"
    if code.startswith(("430", "830", "831", "832", "833", "834", "835", "836", "837", "838", "839", "870", "871", "872", "873", "920")):
        return "北交所"
    return "其他"


def is_risk_name(name: str) -> bool:
    normalized = name.upper()
    return "ST" in normalized or "退" in normalized


def clean_number(value: Any) -> float | None:
    if value in (None, "", "-", "--"):
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    if math.isnan(number) or math.isinf(number):
        return None
    return number


def calc_amplitude(high: float | None, low: float | None, prev_close: float | None) -> float | None:
    if high is None or low is None or prev_close in (None, 0):
        return None
    return round((high - low) / prev_close * 100, 2)


def scale_sina_market_cap(value: Any) -> float | None:
    number = clean_number(value)
    if number is None:
        return None
    return number * 10_000


def safe_mean(values: list[float | None]) -> float | None:
    clean = [value for value in values if value is not None]
    if not clean:
        return None
    return round(statistics.fmean(clean), 2)


def safe_median(values: list[float | None]) -> float | None:
    clean = [value for value in values if value is not None]
    if not clean:
        return None
    return round(statistics.median(clean), 2)


def percentile(values: list[float | None], pct: float) -> float | None:
    clean = sorted(value for value in values if value is not None)
    if not clean:
        return None
    if len(clean) == 1:
        return round(clean[0], 2)
    position = (len(clean) - 1) * pct / 100
    low = math.floor(position)
    high = math.ceil(position)
    if low == high:
        return round(clean[int(position)], 2)
    weight = position - low
    return round(clean[low] * (1 - weight) + clean[high] * weight, 2)


def ratio(numerator: float, denominator: float) -> float:
    if not denominator:
        return 0.0
    return round(numerator / denominator * 100, 2)


def round_number(value: float | None, digits: int) -> float | None:
    if value is None:
        return None
    return round(value, digits)


def format_cny(value: float) -> str:
    if abs(value) >= 100_000_000:
        return f"{value / 100_000_000:.1f}亿"
    if abs(value) >= 10_000:
        return f"{value / 10_000:.0f}万"
    return f"{value:.0f}元"


if __name__ == "__main__":
    main()
