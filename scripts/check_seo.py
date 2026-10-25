"""Check the generated site before publishing: python3 scripts/check_seo.py [_site]."""

import json
import sys
import xml.etree.ElementTree as ET
from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.tags = defaultdict(list)
        self.lang = ""
        self.schemas = []
        self.text_tag = None
        self.text = ""
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "html":
            self.lang = attrs.get("lang", "")
        if tag == "meta":
            self.tags[attrs.get("name") or attrs.get("property")].append(attrs.get("content"))
        if tag == "link":
            self.tags[attrs.get("rel")].append(attrs.get("href"))
        if tag == "title" or (tag == "script" and attrs.get("type") == "application/ld+json"):
            self.text_tag = tag
            self.text = ""

    def handle_data(self, text):
        if self.text_tag:
            self.text += text

    def handle_endtag(self, tag):
        if tag != self.text_tag:
            return
        if tag == "title":
            self.tags["title"].append(self.text.strip())
        else:
            self.schemas.append(json.loads(self.text))
        self.text_tag = None


def check_site(root):
    origin = "https://k7y.space"
    sitemap = ET.parse(root / "sitemap.xml")
    locations = [element.text for element in sitemap.findall(".//{*}loc")]
    urls = set(locations)
    assert len(locations) == len(urls), "Sitemap contains duplicate URLs"
    indexed = set()
    titles = set()
    pages = sorted(root.rglob("*.html"))
    assert pages, "Build the site before checking SEO"
    for path in pages:
        page = Page(path.read_text())
        for key in ["title", "description", "canonical", "og:title", "og:url", "og:image", "twitter:card"]:
            assert len(page.tags[key]) == 1 and page.tags[key][0], f"{path}: missing or duplicate {key}"
        assert page.lang, f"{path}: missing HTML language"
        canonical = page.tags["canonical"][0]
        assert canonical.startswith(origin + "/"), f"{path}: incorrect canonical domain"
        assert page.tags["og:url"] == [canonical], f"{path}: Open Graph URL differs from canonical"
        assert page.schemas, f"{path}: missing structured data"
        image = urlsplit(page.tags["og:image"][0])
        assert image.scheme == "https" and image.netloc, f"{path}: image URL must be absolute"
        if image.netloc == "k7y.space":
            assert (root / image.path.lstrip("/")).is_file(), f"{path}: missing share image"
        if "noindex" in ",".join(page.tags["robots"]):
            assert canonical not in urls, f"{path}: noindex page appears in sitemap"
        else:
            assert canonical in urls, f"{path}: indexable page missing from sitemap"
            title = page.tags["title"][0]
            assert title not in titles, f"{path}: duplicate searchable title"
            titles.add(title)
            indexed.add(canonical)
        if path.parent.name == "notes":
            assert page.tags["robots"] == ["noindex, follow"], f"{path}: note must remain noindex"
        if path.parent.name == "writing":
            assert page.lang == "zh-CN", f"{path}: incorrect article language"
            assert page.tags["title"][0].count("Kai Qu") == 1, f"{path}: repeated author in title"
            assert sum(schema.get("@type") == "BlogPosting" for schema in page.schemas) == 1, f"{path}: duplicate article schema"
        if path.parent.name == "stories":
            assert page.tags["title"][0] != "Story | Kai Qu", f"{path}: generic story title"
            assert page.tags["alternate"] == [origin + "/feed.xml"] or page.tags["alternate"] == ["/feed.xml"], f"{path}: broken story feed"
    assert urls == indexed, "Sitemap contains unexpected or duplicate canonical URLs"
    assert not Page((root / "note.html").read_text()).tags["robots"], "Notes archive must remain indexable"
    assert f"Sitemap: {origin}/sitemap.xml" in (root / "robots.txt").read_text(), "Missing sitemap declaration"
    print(f"SEO checks passed: {len(pages)} pages, {len(indexed)} indexable canonical URLs.")


if __name__ == "__main__":
    check_site(Path(sys.argv[1] if len(sys.argv) > 1 else "_site"))
