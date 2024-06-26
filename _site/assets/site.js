function settime() {
  const timestamp = document.querySelector('[data-timestamp-text]')
  if (!timestamp || !('Intl' in window)) return

  const options = {
    timeZone: "America/New_York",
    timeStyle: "short",
    hour12: false
  }

  // https://gist.github.com/muan/e7414b6241f088090acd916ed965540e
  let time = new Intl.DateTimeFormat(navigator.language || "zh-TW", options).format(new Date())

  // https://bugs.chromium.org/p/chromium/issues/detail?id=1262801
  if (time.match(/^24:/)) time = time.replace('24:', '00:')

  // Setting interpolated string instead of just the time because
  // if there's no JS there should be no mentions of current time
  const text = timestamp.getAttribute('data-timestamp-text').replace('{time}', time)
  timestamp.innerHTML = text.replace(':', '<span class="timestamp-colon" data-colon>:</span>')

  const now = new Date()
  const sec = now.getSeconds()
  const secondIsEven = sec % 2 === 0
  const colon = document.querySelector('[data-colon]')
  if (colon) colon.style.animationDelay = `${(secondIsEven ? 0 : 1000) - now.getMilliseconds()}ms`

  const delay = 60000 - ((sec * 1000) + now.getMilliseconds())
  setTimeout(settime, delay)
}

settime()

const statusEl = document.querySelector('[data-status-loading]')

try {
  statusEl.hidden = false
  const s = await (await fetch('https://faithk7.github.io/index.txt')).text()
  console.log(s)
  if (s.trim() !== '') {
    console.log('there')
    const [datetime, text] = s.split('\n')
    const date = relativeDate(new Date(datetime))
    console.log(date)
    if (date) {
      console.log('here')
      document.querySelector('[data-status-text]').textContent = text
      document.querySelector('[data-status-datetime]').textContent = `(${date})`
    }
  }
  statusEl.removeAttribute('data-status-loading')
} catch (e) {
  console.log("exception")
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


// added by myself to modify the sidebar style - kinda ugly though
function modifySideBarStyleForIndex() {
  console.log(window.location.pathname)
  if (true) {
  // if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    // Get the sidebar element
    var sidebar = document.querySelector('.navigation-bar-wrapper');

    // Apply the desired styles
    // sidebar.style.borderRight = '2px solid white';
    // sidebar.style.width = '40px'; // You can modify this value later
    // sidebar.style.position = 'sticky';
    // sidebar.style.top = '30%';
    // sidebar.style.height = '40vh';

    // Get all elements with the class .nav-item
    var navItems = document.querySelectorAll('.nav-item');

    // Loop through each .nav-item element and modify its child img element
    navItems.forEach(function(navItem) {
        // Get the child img element within .nav-item
        var imgElement = navItem.querySelector('img');

        // Apply the style to the img element
        if (imgElement) {
            imgElement.style.display = 'inline-block';
        }
    });
  }
}

modifySideBarStyleForIndex()
