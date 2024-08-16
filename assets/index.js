const statusEl = document.querySelector('[data-status-loading]')

try {
    statusEl.hidden = false
    const s = await(await fetch('https://status-quo-proxy.lastk7.workers.dev/status-quo/index.txt')).text()
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
    const rtf = new Intl.RelativeTimeFormat('en', { style: 'narrow' })

    if (diff < hour) {
        return rtf.format(-Math.floor(diff / 60000), 'minute')
    } else if (diff < day) {
        return rtf.format(-Math.floor(diff / hour), 'hour')
    } else if (diff < week) {
        return rtf.format(-Math.floor(diff / day), 'day')
    } else if (diff < month) {
        return rtf.format(-Math.floor(diff / week), 'week')
    } else {
        return
    }
}