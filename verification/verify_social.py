from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:8080/community/find-members")
    page.wait_for_timeout(2000)

    # Take screenshot of the community members page
    page.screenshot(path="verification/screenshots/find_members.png")
    page.wait_for_timeout(1000)

    # Search for a member
    # Since we use mock supabase, it might be empty or show whatever the mock returns
    # We just want to see the UI and buttons

    # Let's also check my network page
    page.goto("http://localhost:8080/community/my-network")
    page.wait_for_timeout(2000)
    page.screenshot(path="verification/screenshots/my_network.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
