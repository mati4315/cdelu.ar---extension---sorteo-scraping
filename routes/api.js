const express = require('express')
const { DRAWS } = require('../services/constants')
const { getResult, getResultsByDate, getLatestResults } = require('../services/database')
const { today } = require('../services/time')
const { syncDraw, getLiveSnapshot } = require('../services/sync')

const router = express.Router()

router.get('/health', (_, res) => {
  res.json({
    ok: true,
    service: 'iafas-scraper',
    uptime: process.uptime(),
    now: new Date().toISOString(),
  })
})

router.get('/hoy', (_, res) => {
  const fecha = today()
  res.json({ fecha, resultados: getResultsByDate(fecha) })
})

router.get('/live', (_, res) => {
  const fecha = today()
  res.json({ fecha, sorteos: getLiveSnapshot(fecha) })
})

router.get('/history', (req, res) => {
  const limit = Math.min(500, Math.max(1, Number(req.query.limit || 100)))
  res.json({ items: getLatestResults(limit) })
})

router.get('/:fecha/:sorteo', async (req, res) => {
  const { fecha, sorteo } = req.params

  if (!DRAWS[sorteo]) {
    return res.status(400).json({ error: 'Sorteo inválido' })
  }

  const cached = getResult(fecha, sorteo)
  if (cached?.resultado) {
    return res.json({ fecha, sorteo, resultado: cached.resultado, source: cached.source || 'cache' })
  }

  const synced = await syncDraw({ fecha, sorteo, source: 'public_api' })
  return res.json({
    fecha,
    sorteo,
    resultado: synced.resultado || null,
    source: synced.cached ? 'cache' : 'scraper',
    status: synced.reason || (synced.resultado ? 'ok' : 'pending'),
  })
})

module.exports = router
