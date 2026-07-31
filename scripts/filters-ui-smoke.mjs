import { chromium } from 'playwright'

const BASE = process.env.SMOKE_BASE ?? 'http://localhost:5175'

const browser = await chromium.launch()
const page = await browser.newPage()

const failures = []
function check(label, ok, detail = '') {
  const status = ok ? 'OK  ' : 'FAIL'
  if (!ok) {
    failures.push(label)
  }
  console.log(`${status} ${label}${detail ? ` — ${detail}` : ''}`)
}

await page.setViewportSize({ width: 1280, height: 900 })
await page.goto(`${BASE}/auctions`, { waitUntil: 'networkidle' })

// Search input lives in the page header (not inside the sheet).
const headerSearch = page.locator('input[placeholder*="номеру заявки"]').first()
check('search input visible in page header', await headerSearch.isVisible())

const trigger = page.getByRole('button', { name: /Фильтры/ }).first()
check('filter trigger visible', await trigger.isVisible())

if (await headerSearch.count()) {
  await headerSearch.fill('12345')
  await headerSearch.blur()
  await page.waitForURL(/cargo_num=12345/, { timeout: 2000 }).catch(() => {})
  check('search commits to URL on blur', page.url().includes('cargo_num=12345'), page.url())

  const triggerText = (await trigger.textContent()) ?? ''
  check(
    'search does not bump filter counter (separate primary action)',
    !/\d/.test(triggerText.replace('Фильтры', '').trim()),
    `trigger="${triggerText.trim()}"`,
  )
}

check('no inline filter panel before opening', (await page.locator('fieldset > legend').count()) === 0)

// Open sheet — sections render; checkbox toggle does NOT yet touch URL.
await trigger.click()
await page.waitForTimeout(300)
const legends = await page.locator('fieldset > legend').allTextContents()
check('sheet renders filter sections after open', legends.length >= 6, `count=${legends.length}`)

const downField = page.locator('[data-slot="field"]:has(label:has-text("На понижение"))').first()
await downField.locator('[data-slot="checkbox"]').click()
await page.waitForTimeout(200)
check('checkbox draft is not committed until Apply', !page.url().includes('auc_type'))

// Apply button writes draft to URL and closes the sheet.
const applyButton = page.getByRole('button', { name: 'Применить' }).first()
await applyButton.click()
await page.waitForURL(/auc_type=Down/, { timeout: 2000 }).catch(() => {})
await page.waitForTimeout(400)
check('Apply commits filters to URL', page.url().includes('auc_type=Down'), page.url())
check('Apply closes the sheet', (await page.locator('fieldset > legend').count()) === 0)

const triggerTextAfterApply = (await trigger.textContent()) ?? ''
check(
  'filter counter reflects committed non-search filters',
  triggerTextAfterApply.includes('1'),
  `trigger="${triggerTextAfterApply.trim()}"`,
)

// Close paths still work: open again, dismiss via backdrop.
await trigger.click()
await page.waitForTimeout(300)
const backdrop = page.locator('[data-slot="sheet-overlay"]').first()
if (await backdrop.count()) {
  await backdrop.click()
  await page.waitForTimeout(300)
  check('backdrop click closes the sheet', (await page.locator('fieldset > legend').count()) === 0)
} else {
  check('sheet backdrop found', false)
  failures.push('backdrop not found')
}

// Reopen, dismiss via the X button.
await trigger.click()
await page.waitForTimeout(300)
const closeButton = page.locator('[data-slot="sheet-close"]').first()
if (await closeButton.count()) {
  await closeButton.click()
  await page.waitForTimeout(300)
  check('X button closes the sheet', (await page.locator('fieldset > legend').count()) === 0)
} else {
  check('sheet close button found', false)
  failures.push('close button not found')
}

// Mobile viewport: trigger still visible, opens sheet.
await page.setViewportSize({ width: 375, height: 800 })
await page.goto(`${BASE}/auctions`, { waitUntil: 'networkidle' })
const mobileTrigger = page.getByRole('button', { name: /Фильтры/ }).first()
const mobileVisible = await mobileTrigger.isVisible().catch(() => false)
check('filter trigger visible on mobile', mobileVisible)
if (mobileVisible) {
  await mobileTrigger.click()
  await page.waitForTimeout(300)
  check('sheet opens on mobile trigger click', (await page.locator('fieldset > legend').count()) >= 6)
}

await browser.close()

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed`)
  process.exit(1)
}
