const axios = require('axios')
const cheerio = require('cheerio')
const { USER_AGENTS } = require('./constants')
const { getSettingsObject } = require('./config')
const { formatHumanDate, today, isToday, hasDrawPassed } = require('./time')

function randomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

function buildDateVariants(date) {
  const [year, month, day] = String(date).split('-')
  const padded = `${day}/${month}/${year}`
  const dashed = `${day}-${month}-${year}`
  const shortYear = `${day}/${month}/${year.slice(2)}`
  return [date, padded, dashed, shortYear, formatHumanDate(date)].filter(Boolean)
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractResultFromHtml(html, fecha, sorteo) {
  const $ = cheerio.load(html)
  const normalizedDraw = normalizeText(sorteo)
  const dateVariants = buildDateVariants(fecha).map(normalizeText)
  let result = null

  $('table tr').each((_, row) => {
    if (result) return

    const rowText = normalizeText($(row).text())
    const matchesDate = dateVariants.some((variant) => rowText.includes(variant))
    const matchesDraw = rowText.includes(normalizedDraw)

    if (!matchesDate || !matchesDraw) return

    const cells = $(row).find('td')
    if (!cells.length) return

    const lastCell = normalizeText($(cells[cells.length - 1]).text()).replace(/\s+/g, '')
    const numericMatch = lastCell.match(/\b\d{4}\b/)
    result = numericMatch ? numericMatch[0] : $(cells[cells.length - 1]).text().trim() || null
  })

  return result
}

async function scrapeIafas(fecha, sorteo, attempt = 0) {
  const settings = getSettingsObject()

  if (isToday(fecha) && !hasDrawPassed(fecha, sorteo)) {
    return { ok: true, resultado: null, skipped: true, reason: 'draw_not_started' }
  }

  try {
    const response = await axios.get(settings.scraper_url, {
      timeout: Number(settings.scraper_timeout_ms || 12000),
      headers: {
        'User-Agent': randomUserAgent(),
        'Accept-Language': 'es-AR,es;q=0.9',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    })

    const resultado = extractResultFromHtml(response.data, fecha, sorteo)
    return {
      ok: true,
      resultado: resultado || null,
      skipped: false,
      reason: resultado ? 'scraped' : 'not_found',
    }
  } catch (error) {
    const retries = Number(settings.scraper_retries || 3)
    if (attempt + 1 < retries) {
      return scrapeIafas(fecha, sorteo, attempt + 1)
    }

    return {
      ok: false,
      resultado: null,
      skipped: false,
      reason: 'request_failed',
      error: error.message,
    }
  }
}

module.exports = {
  scrapeIafas,
  extractResultFromHtml,
}
