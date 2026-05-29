const DRAW_ORDER = ['previa', 'primero', 'matutina', 'vespertina', 'nocturna', 'turista']

const DRAWS = {
  previa: { key: 'previa', label: 'Previa', time: '10:15' },
  primero: { key: 'primero', label: 'Primero', time: '12:00' },
  matutina: { key: 'matutina', label: 'Matutina', time: '15:00' },
  vespertina: { key: 'vespertina', label: 'Vespertina', time: '18:00' },
  nocturna: { key: 'nocturna', label: 'Nocturna', time: '21:00' },
  turista: { key: 'turista', label: 'Turista', time: '22:15' },
}

const WINDOW_RULES = {
  beforeMinutes: 5,
  afterMinutes: 10,
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64; rv:126.0) Gecko/20100101 Firefox/126.0',
]

module.exports = {
  DRAW_ORDER,
  DRAWS,
  WINDOW_RULES,
  USER_AGENTS,
}
