import { test, expect, type Page } from "@playwright/test";

// The format route is mocked: these tests cost nothing and never write to the database.
// The form is never submitted.

const RAW = "ישיבת ועד   התחלנו בשעה 20:00 .דנו בנושא הטיול השנתי  והוחלט לאשר";
const FORMATTED =
  "ישיבת ועד\n\nהתחלנו בשעה 20:00.\n\nדנו בנושא הטיול השנתי והוחלט לאשר.";

const formatButton = (page: Page) =>
  page.getByRole("button", { name: "עיצוב עם AI" }).nth(1);

async function openPage(page: Page) {
  await page.setViewportSize({ width: 375, height: 800 });
  // Log in through the API so the auth cookie lands in this browser context (needs ADMIN_PASSWORD).
  const login = await page.request.post("/api/auth/login", {
    data: { password: process.env.ADMIN_PASSWORD ?? "" },
  });
  expect(login.ok()).toBeTruthy();
  await page.goto("/he/admin/protocols/new");
  await expect(page.locator("#decisions")).toBeVisible();
  await page.waitForLoadState("networkidle");
}

// Typing before React has hydrated is dropped, so retry until the button reacts to the text.
async function fillDecisions(page: Page, text: string) {
  await expect(async () => {
    await page.locator("#decisions").fill(text);
    await expect(formatButton(page)).toBeEnabled({ timeout: 1000 });
  }).toPass({ timeout: 15000 });
}

test.describe("Admin protocol: format with AI", () => {
  test("button is disabled while the field is empty or too short", async ({
    page,
  }) => {
    await openPage(page);
    await expect(formatButton(page)).toBeDisabled();
    await page.locator("#decisions").fill("קצר");
    await expect(formatButton(page)).toBeDisabled();
    await fillDecisions(page, RAW);
  });

  test("formatted text replaces the input and undo restores it", async ({
    page,
  }) => {
    let calls = 0;
    await page.route("**/api/protocols/format", async (route) => {
      calls++;
      expect(route.request().postDataJSON()).toEqual({ text: RAW });
      await new Promise((r) => setTimeout(r, 300));
      await route.fulfill({
        json: { success: true, data: { text: FORMATTED } },
      });
    });
    await openPage(page);
    const field = page.locator("#decisions");
    await fillDecisions(page, RAW);

    await formatButton(page).click();
    await expect(page.getByRole("button", { name: "מעצב..." })).toBeDisabled();
    await expect(field).toHaveValue(FORMATTED);

    await page.getByRole("button", { name: "בטל עיצוב" }).click();
    await expect(field).toHaveValue(RAW);
    await expect(page.getByRole("button", { name: "בטל עיצוב" })).toHaveCount(
      0,
    );
    expect(calls).toBe(1);
  });

  test("on failure the original text is left untouched and an error is shown", async ({
    page,
  }) => {
    await page.route("**/api/protocols/format", (route) =>
      route.fulfill({
        status: 502,
        json: { success: false, code: "ai_failed", error: "Formatting failed" },
      }),
    );
    await openPage(page);
    const field = page.locator("#decisions");
    await fillDecisions(page, RAW);

    await formatButton(page).click();
    await expect(
      page.getByText("העיצוב נכשל. הטקסט שלך לא שונה"),
    ).toBeVisible();
    await expect(field).toHaveValue(RAW);
    await expect(page.getByRole("button", { name: "בטל עיצוב" })).toHaveCount(
      0,
    );
    await expect(formatButton(page)).toBeEnabled();
  });
});
