this[''] = this[''] || {};
this['']['/dist/bundle'] = this['']['/dist/bundle'] || {};
this['']['/dist/bundle'].js = (function () {
'use strict';

const MUTATION_RATE = .2;

class Genome {

    constructor (pieces) {
        this.pieces = pieces;
        this.first = this.pieces.shift();
        this.last = this.pieces.pop();

        this.score = -1;
    }

    /**
     * Clone the Genome
     * 
     * @return {Genome}
     */
    clone () {
        const gene = new Genome([this.first, ...this.pieces.slice(), this.last]);
        return gene
    }

    /**
     * Mutate the pieces by removing one at random
     */
    mutate () {
        for (let i = 0; i < this.pieces.length; i++) {
            if (Math.random() < MUTATION_RATE) {
                this.pieces.splice(i, 1);
            }
        }
    }

    /**
     * Activation function for calculating score
     * 
     * @param {HTMLElement} target 
     * @param {string} originalSelector 
     */
    validate (target, originalSelector) {
        const sel = this.getSelector();
        const elem = document.querySelector(sel);

        if (elem && elem.isEqualNode(target)) {
            const diff = originalSelector.length - sel.length;
            this.score += ~~((diff / originalSelector.length) * 100);
        }
    }

    /**
     * Returns the selector for this genome
     * 
     * @return {string}
     */
    getSelector () {
        return `${this.first} ${this.pieces.join(' ')} ${this.last}`
    }
}

const POP_SIZE = 100;
const MAX_GENERATIONS = 30;

class SelectorShortener {

    /**
     * @param {string} selector 
     */
    constructor (selector) {
        this.selector = selector;
        this.originalElement = document.querySelector(selector);
        this.pieces = selector.split(` > `);
        this.generation = 0;
        this.best = null;
        
        this.isValid = document.querySelector(selector).isEqualNode(
            document.querySelector(this.pieces.join(' '))
        );

        this.population = [];
    }

    /**
     * Finds the best selector
    */
    findBest () {
        if (!this.isValid || this.pieces.length < 3)
            return this.selector

        // Try the first and last and see if they are the same element
        const firstLast = this.getFirstLast();
        if (firstLast)
            return firstLast

        // Start genetic algorithm
        if (this.population.length)
            return this.best.getSelector()

        for (let i = 0; i < POP_SIZE; i++) {
            const gen = new Genome(this.pieces.slice());
            gen.mutate();
            this.population.push(gen);
        }
        
        return this.nextGeneration()
    }

    /**
     * Calculates next generation
    */
    nextGeneration () {
        const nextPop = [];

        this.generation++;
        for (let i = 0; i < POP_SIZE; i++) {
            this.population[i].validate(this.originalElement, this.selector);
        }

        const sorted = this.population.sort((a,b) => b.score - a.score);
        if (((this.best || {}).score || 0) < sorted[0].score) {
            this.best = sorted[0].clone();
            this.best.score = sorted[0].score;
        }

        for (let i = 0; i < POP_SIZE; i++) {
            const clone = this.population[i].clone();
            clone.mutate();
            nextPop.push(clone);
        }

        this.population = nextPop;

        if (this.generation < MAX_GENERATIONS) {
            return this.nextGeneration()
            }
            return this.best.getSelector()
        }

    /**
     * Tests the first and the last selectorPiece to see if the are equalk
     * to the target element
     */
    getFirstLast () {
        const pcs = this.pieces.slice();
        const first = pcs.shift();
        const last = pcs.pop();
        const sel = `${first} ${last}`;

        const elem = document.querySelector(sel);
        if (elem && elem.isEqualNode(this.originalElement)) {
            return sel
        }
        return null
    }

}

const isValidID = id => id[0].match(/[a-z]/i) && id.match(/[a-z0-9]+/);

/**
 * Gets a css selector for an element
 * 
 * @param {HTMLElement} elem 
 * @param {boolean} optimize 
 */
function fetchSelector (elem, optimize = false) {
    if (!(elem instanceof HTMLElement))
        throw new TypeError('fetchSelector: "elem" is not an instance of HTMLElement')

    let path = '', maxIterations = 15;
    while (elem) {
        if (!maxIterations--)
            break

        let subSelector = elem.localName;
        if (!subSelector) {
            break
        }
        subSelector = subSelector.toLowerCase();

        const parent = elem.parentElement;

        if (parent) {
            const sameTagSiblings = parent.children;
            if (sameTagSiblings.length > 1) {
                let nameCount = 0;
                const index = [...sameTagSiblings].findIndex((child) => {
                    if (elem.localName === child.localName) {
                        nameCount++;
                    }
                    return child === elem
                }) + 1;
                if (index > 1 && nameCount > 1) {
                    subSelector += ':nth-child(' + index + ')';
                } else {
                    subSelector = subSelector + (elem.classList.length ? '.' + elem.classList[0] : '');
                }
            } else {
                subSelector = subSelector + (elem.classList.length ? '.' + elem.classList[0] : '');
            }
        }
        
        if (parent && (!elem.id || elem.id && !isValidID(elem.id))) {
            path = subSelector + (path ? ' > ' + path : '');
            elem = parent;
        } else if(elem && elem.id && isValidID(elem.id)) {
            path = '#' + elem.id + (path ? ' ' + path : '');
            elem = null;
        }
    }
    
    const selector = path.replace('html>body>', '');

    if (selector && optimize) {
        const selShort = new SelectorShortener(selector);
        return selShort.findBest()
    }
    return selector
}

return fetchSelector;

}());
