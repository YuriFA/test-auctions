// Verifies the bet form renders +/- stepper buttons when the auction has a
// `step`, that clicking + updates the input, and that the step hint is shown.
import { chromium } from 'playwright'

const BASE = process.env.SMOKE_BASE ?? 'http://localhost:5175'

// downLeading seed pins trading.price.step = 500, available = 44500.
const DOWN_LEADING_UUID = '00000000-0000-4000-8000-000000000001'
const EXPECTED_STEP = 500
const EXPECTED_AVAILABLE = 44500
// First + click seeds from `available`, then snaps up to the next aligned
// value (44500 + 500 = 45000).
const EXPECTED_AFTER_PLUS = String(EXPECTED_AVAILABLE + EXPECTED_STEP)

const browser = await chromium.launch()
const page = await browser.newPage()

let failed = 0
function check(label, ok, detail = '') {
  const status = ok ? 'OK  ' : 'FAIL'
  if (!ok) {
    failed++
  }
  console.log(`${status} ${label}${detail ? ` — ${detail}` : ''}`)
}

try {
  await page.goto(`${BASE}/auctions/${DOWN_LEADING_UUID}/bet`, { waitUntil: 'networkidle' })

  const plusBtn = page.getByRole('button', { name: 'Увеличить на шаг' })
  const minusBtn = page.getByRole('button', { name: 'Уменьшить на шаг' })
  const plusVisible = await plusBtn.isVisible().catch(() => false)
  const minusVisible = await minusBtn.isVisible().catch(() => false)
  check('stepper + button visible', plusVisible)
  check('stepper - button visible', minusVisible)

  const stepHint = await page
    .getByText(/шаг 500/, { exact: false })
    .first()
    .textContent()
    .catch(() => '')
  check('step hint visible', (stepHint ?? '').includes('шаг 500'), (stepHint ?? '').slice(0, 60))

  const input = page.locator('#bet-price')
  await input.fill('')
  await plusBtn.click()
  const valueAfterPlus = await input.inputValue()
  check(
    'plus click seeds from available + step',
    valueAfterPlus === EXPECTED_AFTER_PLUS,
    `value="${valueAfterPlus}"`,
  )

  await plusBtn.click()
  const valueAfterSecondPlus = await input.inputValue()
  check(
    'second plus click moves up one step',
    valueAfterSecondPlus === String(Number(valueAfterPlus) + EXPECTED_STEP),
    `value="${valueAfterSecondPlus}"`,
  )

  await minusBtn.click()
  const valueAfterMinus = await input.inputValue()
  check(
    'minus click moves down one step',
    valueAfterMinus === valueAfterPlus,
    `value="${valueAfterMinus}"`,
  )

  const submitDisabled = await page.getByRole('button', { name: 'Поставить ставку' }).isEnabled()
  check('submit button is interactive', submitDisabled)
} finally {
  await browser.close()
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed`)
  process.exit(1)
}
console.log('\nbet-form-smoke: ALL OK')
