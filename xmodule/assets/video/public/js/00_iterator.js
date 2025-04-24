'use strict';

/**
 * Provides convenient way to work with iterable data.
 * @exports video/00_iterator.js
 * @constructor
 * @param {array} list Array to be iterated.
 */
class Iterator {
    constructor(list) {
        this.list = list;
        this.index = 0;
        this.size = this.list.length;
        this.lastIndex = this.list.length - 1;
    }

    /**
     * Checks validity of provided index for the iterator.
     * @access protected
     * @param {numebr} index
     * @return {boolean}
     */
    _isValid(index) {
        return _.isNumber(index) && index < this.size && index >= 0;
    }

    /**
     * Returns next element.
     * @param {number} [index] Updates current position.
     * @return {any}
     */
    next(index) {
        if (!(this._isValid(index))) {
            index = this.index;
        }

        this.index = (index >= this.lastIndex) ? 0 : index + 1;

        return this.list[this.index];
    }

    /**
     * Returns previous element.
     * @param {number} [index] Updates current position.
     * @return {any}
     */
    prev(index) {
        if (!(this._isValid(index))) {
            index = this.index;
        }

        this.index = (index < 1) ? this.lastIndex : index - 1;

        return this.list[this.index];
    }

    /**
     * Returns last element in the list.
     * @return {any}
     */
    last() {
        return this.list[this.lastIndex];
    }

    /**
     * Returns first element in the list.
     * @return {any}
     */
    first() {
        return this.list[0];
    }

    /**
     * Returns `true` if current position is last for the iterator.
     * @return {boolean}
     */
    isEnd() {
        return this.index === this.lastIndex;
    }
}

export default Iterator;
