const statusEl = document.querySelector('[data-status-loading]')

// Add null check for statusEl
if (!statusEl) {
    console.warn('[status] Status element not found')
} else {
    try {
        statusEl.hidden = false
        const response = await fetch('https://k7m.xyz/status-quo/index.txt')
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const s = await response.text()
        
        if (s.trim() !== '') {
            const [datetime, text] = s.split('\n')
            const date = relativeDate(new Date(datetime))

            if (date) {
                const textEl = document.querySelector('[data-status-text]')
                const datetimeEl = document.querySelector('[data-status-datetime]')
                
                // Null checks for status elements
                if (textEl && datetimeEl) {
                    textEl.textContent = text
                    datetimeEl.textContent = `(${date})`
                } else {
                    console.warn('[status] Status text/datetime elements not found')
                }
            }
        }
        statusEl.removeAttribute('data-status-loading')
    } catch (e) {
        // Gracefully handle errors
        if (statusEl.parentNode) {
            statusEl.remove()
        }
        console.warn('[status] Failed to load status:', e.message)
    }
}

function relativeDate(date) {
    const now = new Date()
    const diff = now - date
    const hour = 1000 * 60 * 60
    const day = hour * 24
    const week = day * 7
    const month = day * 30
    const year = day * 365
    const rtf = new Intl.RelativeTimeFormat('en', { style: 'narrow' })

    if (diff < hour) {
        return rtf.format(-Math.floor(diff / 60000), 'minute')
    } else if (diff < day) {
        return rtf.format(-Math.floor(diff / hour), 'hour')
    } else if (diff < week) {
        return rtf.format(-Math.floor(diff / day), 'day')
    } else if (diff < month) {
        return rtf.format(-Math.floor(diff / week), 'week')
    } else if (diff < year) {
        return rtf.format(-Math.floor(diff / month), 'month')
    } else {
        return rtf.format(-Math.floor(diff / year), 'year')
    }
}

const quoteContainer = document.querySelector('[data-quote]')
if (quoteContainer) {
    const reloadBtn = quoteContainer.querySelector('[data-quote-reload]')
    const initialQuoteEl = quoteContainer.querySelector('[data-quote-text]')
    const theme = initialQuoteEl?.getAttribute('data-theme') ?? ''

    function getEmbeddedQuotes() {
        try {
            const script = document.getElementById('quotes-data')
            if (!script) return []
            const data = JSON.parse(script.textContent || '[]')
            return Array.isArray(data) ? data : []
        } catch (_) {
            return []
        }
    }

    function renderVerticalQuote(text) {
        const lines = String(text).split(/\r?\n/).map(s => s.trim()).filter(Boolean)
        const btn = reloadBtn

        // Clear all existing quote columns but preserve the reload button
        quoteContainer.querySelectorAll('.o-quote').forEach(el => el.remove())

        for (const line of lines) {
            const col = document.createElement('div')
            col.className = 'o-quote'
            if (theme !== '') col.setAttribute('data-theme', theme)
            col.textContent = line
            // Append each line before the button so columns appear from left to right
            quoteContainer.insertBefore(col, btn)
        }
    }

    const quotes = getEmbeddedQuotes()
    let lastIndex = -1
    let remainingIndices = []

    function refillRemainingIndices() {
        remainingIndices = Array.from({ length: quotes.length }, (_, i) => i)
        for (let i = remainingIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
                ;[remainingIndices[i], remainingIndices[j]] = [remainingIndices[j], remainingIndices[i]]
        }
        if (
            quotes.length > 1 &&
            lastIndex !== -1 &&
            remainingIndices[remainingIndices.length - 1] === lastIndex
        ) {
            const swapWith = remainingIndices.length - 2
            if (swapWith >= 0) {
                ;[remainingIndices[remainingIndices.length - 1], remainingIndices[swapWith]] = [
                    remainingIndices[swapWith],
                    remainingIndices[remainingIndices.length - 1]
                ]
            }
        }
    }

    function pickRandomIndex() {
        if (!quotes.length) return -1
        if (remainingIndices.length === 0) refillRemainingIndices()
        const idx = remainingIndices.pop()
        lastIndex = idx
        return idx
    }

    function reloadQuote() {
        const idx = pickRandomIndex()
        if (idx >= 0) {
            renderVerticalQuote(quotes[idx].text)
        }
    }

    if (initialQuoteEl && initialQuoteEl.textContent) {
        renderVerticalQuote(initialQuoteEl.textContent)
    }

    if (reloadBtn) reloadBtn.addEventListener('click', reloadQuote)
}