#!/usr/bin/env python3
"""
B站视频内容提取脚本

用法:
    python fetch_bilibili.py <B站链接>
    python fetch_bilibili.py https://www.bilibili.com/video/BV16Mwcz9EK5/

输出: 视频标题、简介、字幕文本（Markdown格式）
"""

import sys
import re
import requests


HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://www.bilibili.com/",
    "Origin": "https://www.bilibili.com",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
}


def extract_bvid(url: str) -> str:
    """从各种格式的B站URL中提取BV号（保持原始大小写）"""
    patterns = [
        r"BV[a-zA-Z0-9]{10}",
        r"bv[a-zA-Z0-9]{10}",
    ]
    for p in patterns:
        m = re.search(p, url, re.IGNORECASE)
        if m:
            bvid = m.group(0).rstrip("/")
            # 标准化为 BV 开头，保持其余字符大小写
            if bvid.lower().startswith("bv"):
                bvid = "BV" + bvid[2:]
            return bvid
    return url.strip()


def format_duration(seconds: int) -> str:
    """秒数转 mm:ss 或 hh:mm:ss"""
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60
    if h > 0:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


def fetch_video_info(bvid: str) -> dict:
    """获取视频基本信息（无需登录）"""
    url = "https://api.bilibili.com/x/web-interface/view"
    r = requests.get(url, params={"bvid": bvid}, headers=HEADERS, timeout=15)
    r.raise_for_status()
    data = r.json()
    if data["code"] != 0:
        raise Exception(f"API错误: {data.get('message', 'unknown')}")
    return data["data"]


def fetch_subtitles(bvid: str, cid: int) -> list[dict]:
    """获取字幕列表"""
    url = "https://api.bilibili.com/x/web-interface/view/conclusion/get"
    params = {"bvid": bvid, "cid": cid}
    try:
        r = requests.get(url, params=params, headers=HEADERS, timeout=15)
        d = r.json()
        if d.get("code") == 0:
            return d.get("data", {}).get("subtitles", [])
    except Exception:
        pass
    return []


def download_subtitle(url: str) -> str:
    """下载字幕文件并合并为纯文本"""
    if url.startswith("//"):
        url = "https:" + url
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        r.raise_for_status()
        lines = []
        for seg in r.json().get("body", []):
            content = seg.get("content", "").strip()
            if content:
                lines.append(content)
        return "\n".join(lines)
    except Exception:
        return ""


def extract(url: str) -> str:
    """提取视频文字内容"""
    bvid = extract_bvid(url)
    print(f"[1/3] 正在获取视频信息: {bvid}", file=sys.stderr)

    info = fetch_video_info(bvid)
    title = info.get("title", "无标题")
    desc = info.get("desc", "")
    duration = info.get("duration", 0)
    owner = info.get("owner", {}).get("name", "未知UP主")
    cid = info["cid"]

    stat = info.get("stat", {})
    view = stat.get("view", 0)
    like = stat.get("like", 0)
    coin = stat.get("coin", 0)
    favorite = stat.get("favorite", 0)
    danmaku = stat.get("danmaku", 0)

    pages = info.get("pages", [])
    page_info = ""
    if len(pages) > 1:
        page_info = f"（共 {len(pages)} P）"

    print("[2/3] 正在获取字幕...", file=sys.stderr)
    subtitle_text = ""
    subtitle_urls = fetch_subtitles(bvid, cid)
    if subtitle_urls:
        print(f"[2/3] 找到 {len(subtitle_urls)} 个字幕", file=sys.stderr)
        zh_sub = next(
            (s for s in subtitle_urls if "zh" in s.get("lang", "").lower()),
            subtitle_urls[0],
        )
        sub_url = zh_sub.get("subtitle_url", "")
        if sub_url:
            subtitle_text = download_subtitle(sub_url)
    else:
        print("[2/3] 无字幕（该视频未提供字幕）", file=sys.stderr)

    out = []
    out.append(f"# {title}")
    out.append("")
    out.append(f"**BV号**: {bvid}")
    out.append(f"**UP主**: {owner}")
    out.append(f"**时长**: {format_duration(duration)}")
    out.append(f"**播**: {view:,}  **赞**: {like:,}  **投币**: {coin:,}  **收藏**: {favorite:,}  **弹幕**: {danmaku:,}")
    if page_info:
        out.append(f"**分P**: {page_info}")
    out.append("")
    out.append("## 简介")
    out.append(desc or "（无简介）")
    out.append("")
    if subtitle_text:
        out.append(f"## 字幕（{len(subtitle_text):,} 字）")
        out.append(subtitle_text)
    else:
        out.append("## 字幕")
        out.append("（该视频暂无字幕）")
    out.append("")
    out.append(f"---")
    out.append(f"来源: {url}")
    return "\n".join(out)


def main():
    if len(sys.argv) < 2:
        print("用法: python fetch_bilibili.py <B站链接或BV号>", file=sys.stderr)
        print("示例: python fetch_bilibili.py https://www.bilibili.com/video/BV16Mwcz9EK5/", file=sys.stderr)
        sys.exit(1)
    url = sys.argv[1]
    try:
        print(extract(url))
    except Exception as e:
        print(f"错误: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
