
import Genome from './genome'

const POP_SIZE = 100,
      MAX_GENERATIONS = 30

export default class SelectorShortener {

    /**
     * @param {string} selector 
     */
    constructor (selector) {
        this.selector = selector
        this.originalElement = document.querySelector(selector)
        this.pieces = selector.split(` > `)
        this.generation = 0
        this.best = null
        
        this.isValid = document.querySelector(selector).isEqualNode(
            document.querySelector(this.pieces.join(' '))
        )

        this.population = []
    }

    /**
     * Finds the best selector
    */
    findBest () {
        if (!this.isValid || this.pieces.length < 3)
            return this.selector

        // Try the first and last and see if they are the same element
        const firstLast = this.getFirstLast()
        if (firstLast)
            return firstLast

        // Start genetic algorithm
        if (this.population.length)
            return this.best.getSelector()

        for (let i = 0; i < POP_SIZE; i++) {
            const gen = new Genome(this.pieces.slice())
            gen.mutate()
            this.population.push(gen)
        }
        
        return this.nextGeneration()
    }

    /**
     * Calculates next generation
    */
    nextGeneration () {
        const nextPop = []

        this.generation++
        for (let i = 0; i < POP_SIZE; i++) {
            this.population[i].validate(this.originalElement, this.selector)
        }

        const sorted = this.population.sort((a,b) => b.score - a.score)
        if (((this.best || {}).score || 0) < sorted[0].score) {
            this.best = sorted[0].clone()
            this.best.score = sorted[0].score
        }

        for (let i = 0; i < POP_SIZE; i++) {
            const clone = this.population[i].clone()
            clone.mutate()
            nextPop.push(clone)
        }

        this.population = nextPop

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
        const pcs = this.pieces.slice()
        const first = pcs.shift()
        const last = pcs.pop()
        const sel = `${first} ${last}`

        const elem = document.querySelector(sel)
        if (elem && elem.isEqualNode(this.originalElement)) {
            return sel
        }
        return null
    }

}