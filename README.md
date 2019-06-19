# Fetch-Selector
Fetches a selector of an html element, and shortens it with a genetic algorithm.

## Installation

```bash
npm install --save fetch-selector
```

## Usage

```javascript
import fetchSelector from 'fetch-selector'

// Example element
const div = document.querySelector('#top > div._9dMXo.w-third-l.mt3.w-100.ph3.ph4-m.pv3.pv0-l.order-1-ns.order-0 > div:nth-child(8) > p > a')

// Return a default selector string from an element
// This selector is quite long, but the function is quicker
// than the shortened one
const longSelector = fetchSelector(div)
// returns: "#top div:nth-child(4) > div:nth-child(8) > p.n8Z-E > a.zE7yA"

const shortSelector = fetchSelector(div, true)
// returns: #top div:nth-child(4) div:nth-child(8) a.zE7yA"
```