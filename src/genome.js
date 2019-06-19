const MUTATION_RATE = .2

export default class Genome {

    constructor (pieces) {
        this.pieces = pieces
        this.first = this.pieces.shift()
        this.last = this.pieces.pop()

        this.score = -1
    }

    /**
     * Clone the Genome
     * 
     * @return {Genome}
     */
    clone () {
        const gene = new Genome([this.first, ...this.pieces.slice(), this.last])
        return gene
    }

    /**
     * Mutate the pieces by removing one at random
     */
    mutate () {
        for (let i = 0; i < this.pieces.length; i++) {
            if (Math.random() < MUTATION_RATE) {
                this.pieces.splice(i, 1)
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
        const sel = this.getSelector()
        const elem = document.querySelector(sel)

        if (elem && elem.isEqualNode(target)) {
            const diff = originalSelector.length - sel.length
            this.score += ~~((diff / originalSelector.length) * 100)
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

