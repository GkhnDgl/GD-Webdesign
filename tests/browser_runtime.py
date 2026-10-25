import asyncio
import json
import os
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


async def main():
    os.chdir(ROOT)
    server = ThreadingHTTPServer(("127.0.0.1", 0), QuietHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base_url = f"http://127.0.0.1:{server.server_port}"

    try:
        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch()
            for page_path in ("/index.html", "/templates/one-pager-boilerplate/index.html"):
                page = await browser.new_page(viewport={"width": 390, "height": 844})
                errors = []
                page.on("pageerror", lambda error: errors.append(str(error)))
                await page.goto(base_url + page_path, wait_until="networkidle")
                await page.wait_for_function("document.documentElement.lang === 'de'")
                await page.wait_for_function("document.querySelector('#language-toggle')?.getAttribute('aria-pressed') === 'false'")

                # Use the real browser selector engine to validate every production selector.
                selector_map = await page.evaluate("""() => {
                    const source = [...document.scripts].find(script => script.src.includes('/assets/js/main.js'));
                    if (!source) throw new Error('main.js script tag not found');
                    return source.src;
                }""")
                js_source = await page.request.get(selector_map)
                assert js_source.ok, f"Could not fetch main.js: {selector_map}"
                script_text = await js_source.text()
                import re
                match = re.search(r"const translations = (\{[\s\S]*?\n  \});", script_text)
                assert match, "Could not locate production translation selector map"
                selector_map_json = await page.evaluate(f"() => ({match.group(1)})")
                selector_results = await page.evaluate("""(translations) => {
                    const missing = [];
                    for (const [key, selectors] of Object.entries(translations)) {
                      for (const selector of selectors) {
                        try {
                          if (!document.querySelector(selector)) missing.push({key, selector, reason: 'no match'});
                        } catch (error) {
                          missing.push({key, selector, reason: error.message});
                        }
                      }
                    }
                    return missing;
                }""", selector_map_json)
                assert not selector_results, f"{page_path}: translation selectors failed in browser: {selector_results}"

                # Validate real localization effects, including labels, metadata, placeholders, and privacy link.
                await page.locator("#language-toggle").click()
                await page.wait_for_function("document.documentElement.lang === 'en'")
                en_locale = json.loads((ROOT / "locales/en.json").read_text(encoding="utf-8"))
                assert await page.title() == en_locale["meta"]["title"]
                assert await page.locator('meta[name="description"]').get_attribute("content") == en_locale["meta"]["description"]
                assert await page.locator("#language-toggle").get_attribute("aria-pressed") == "true"
                assert await page.locator("#name").get_attribute("placeholder") == en_locale["contact"]["placeholders"]["name"]
                assert await page.locator("#contact label[for='name']").inner_text() == en_locale["contact"]["name"]
                assert await page.locator(".form-privacy-note a").inner_text() == en_locale["contact"]["privacy_link"]
                assert await page.locator(".primary-navigation").get_attribute("aria-label") == en_locale["nav"]["label"]

                await page.locator("#language-toggle").click()
                await page.wait_for_function("document.documentElement.lang === 'de'")
                de_locale = json.loads((ROOT / "locales/de.json").read_text(encoding="utf-8"))
                assert await page.title() == de_locale["meta"]["title"]
                assert await page.locator("#language-toggle").get_attribute("aria-pressed") == "false"

                # Mobile navigation uses actual click, Escape, and link activation events.
                menu = page.locator(".mobile-menu-toggle")
                nav = page.locator(".primary-navigation")
                await menu.click()
                await page.wait_for_function("document.querySelector('.mobile-menu-toggle')?.getAttribute('aria-expanded') === 'true'")
                assert "is-open" in (await nav.get_attribute("class"))
                assert "menu-open" in (await page.locator("body").get_attribute("class"))
                assert await menu.get_attribute("aria-label") == de_locale["accessibility"]["close_menu"]

                await page.keyboard.press("Escape")
                await page.wait_for_function("document.querySelector('.mobile-menu-toggle')?.getAttribute('aria-expanded') === 'false'")
                assert "is-open" not in (await nav.get_attribute("class"))
                assert "menu-open" not in (await page.locator("body").get_attribute("class"))
                assert await menu.get_attribute("aria-label") == de_locale["accessibility"]["open_menu"]

                await menu.click()
                await nav.locator("a").first.click()
                await page.wait_for_function("document.querySelector('.mobile-menu-toggle')?.getAttribute('aria-expanded') === 'false'")

                await menu.click()
                await page.set_viewport_size({"width": 1024, "height": 768})
                await page.wait_for_function("document.querySelector('.mobile-menu-toggle')?.getAttribute('aria-expanded') === 'false'")
                assert "is-open" not in (await nav.get_attribute("class"))
                assert not errors, f"{page_path}: uncaught browser errors: {errors}"
                print(f"PASS {page_path}: browser selectors, DE/EN switch, metadata, form labels, mobile menu")
                await page.close()
            await browser.close()
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)


if __name__ == "__main__":
    asyncio.run(main())
