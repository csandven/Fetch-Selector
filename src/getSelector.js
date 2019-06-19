
import SelectorShortener from './selectorShortener'

const isValidID = id => id[0].match(/[a-z]/i) && id.match(/[a-z0-9]+/)

/**
 * Gets a css selector for an element
 * 
 * @param {HTMLElement} elem 
 * @param {boolean} optimize 
 */
export default function (elem, optimize = false) {
    if (!(elem instanceof HTMLElement))
        throw new TypeError('getSelector: "elem" is not an instance of HTMLElement')

    let path = '', maxIterations = 15
    while (elem) {
        if (!maxIterations--)
            break

        let subSelector = elem.localName
        if (!subSelector) {
            break
        }
        subSelector = subSelector.toLowerCase()

        const parent = elem.parentElement

        if (parent) {
            const sameTagSiblings = parent.children
            if (sameTagSiblings.length > 1) {
                let nameCount = 0
                const index = [...sameTagSiblings].findIndex((child) => {
                    if (elem.localName === child.localName) {
                        nameCount++
                    }
                    return child === elem
                }) + 1;
                if (index > 1 && nameCount > 1) {
                    subSelector += ':nth-child(' + index + ')'
                } else {
                    subSelector = subSelector + (elem.classList.length ? '.' + elem.classList[0] : '')
                }
            } else {
                subSelector = subSelector + (elem.classList.length ? '.' + elem.classList[0] : '')
            }
        }
        
        if (parent && (!elem.id || elem.id && !isValidID(elem.id))) {
            path = subSelector + (path ? ' > ' + path : '')
            elem = parent
        } else if(elem && elem.id && isValidID(elem.id)) {
            path = '#' + elem.id + (path ? ' ' + path : '')
            elem = null
        }
    }
    
    const selector = path.replace('html>body>', '')

    if (selector && optimize) {
        const selShort = new SelectorShortener(selector)
        return selShort.findBest()
    }
    return selector
}

