const statusEl = document.querySelector('[data-status-loading]')

try {
    statusEl.hidden = false
    const s = await(await fetch('https://k7m.xyz/status-quo/index.txt')).text()
    if (s.trim() !== '') {
        const [datetime, text] = s.split('\n')
        const date = relativeDate(new Date(datetime))

        if (date) {
            document.querySelector('[data-status-text]').textContent = text
            document.querySelector('[data-status-datetime]').textContent = `(${date})`
        }
    }
    statusEl.removeAttribute('data-status-loading')
} catch (e) {
    statusEl.remove()
    console.warn(e)
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

// Quote reload: render vertical multi-line text with first line at leftmost
const quoteContainer = document.querySelector('[data-quote]')
if (quoteContainer) {
    const reloadBtn = quoteContainer.querySelector('[data-quote-reload]')
    const initialQuoteEl = quoteContainer.querySelector('[data-quote-text]')
    const theme = initialQuoteEl?.getAttribute('data-theme') ?? ''

    /**
     * Parse embedded quotes from script tag to avoid runtime fetch.
     * Returns an array like [{ id, text }]
     */
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

    /**
     * Render a quote string vertically. Multi-line text is split by newline; each line
     * becomes its own vertical column. Flex row ensures the first line appears at the leftmost.
     */
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

    function pickRandomIndex() {
        if (!quotes.length) return -1
        let idx = Math.floor(Math.random() * quotes.length)
        if (quotes.length > 1 && idx === lastIndex) {
            idx = (idx + 1) % quotes.length
        }
        lastIndex = idx
        return idx
    }

    function reloadQuote() {
        const idx = pickRandomIndex()
        if (idx >= 0) {
            renderVerticalQuote(quotes[idx].text)
        }
    }

    // Initialize with the existing text content in the DOM
    if (initialQuoteEl && initialQuoteEl.textContent) {
        renderVerticalQuote(initialQuoteEl.textContent)
    }

    // Wire up reload button
    if (reloadBtn) reloadBtn.addEventListener('click', reloadQuote)
}