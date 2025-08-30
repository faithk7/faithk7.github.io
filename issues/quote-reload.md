# Feature: Quote Reload (hover button, random pick, vertical layout)

Context:
- Page: `index.html`, container: `.c-quote-container`.
- Requirement: On hover, show a reload button at lower-left; on click, randomly select text from `_data/quotes.json` and render vertically with multiple lines displayed as columns, with the first line placed right-most.

Plan:
1) Data: Create `_data/quotes.json` with array of `{ id, text }`.
2) HTML: Add a button `.o-quote-reload` and mark elements with `data-quote`, `data-quote-text`, `data-quote-reload`. Embed quotes via `<script id="quotes-data" type="application/json">` using `{{ site.data.quotes | jsonify }}`.
3) CSS: In `_sass/_index.scss`, make `.c-quote-container` a `flex` row-reverse to position the first line as the right-most column; add styles for `.o-quote-reload` with hover reveal.
4) JS: In `assets/index.js`, parse embedded JSON, split multi-line text to columns, and wire the reload button to randomly pick a quote ensuring variety.
5) Build: Use Ruby 3.4.x per `.ruby-version` and `Gemfile`, then `bundle exec jekyll build`.

Expected Result:
- Hovering the quote area reveals a subtle reload button at the lower-left. Clicking reload switches the quote to a random entry from `_data/quotes.json`. Multi-line quotes render as vertical columns with the first line at the right edge.

