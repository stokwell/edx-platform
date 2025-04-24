'use strict';

const Resizer = function(params) {
    const defaults = {
        container: window,
        element: null,
        containerRatio: null,
        elementRatio: null
    };
    const callbacksList = [];
    const delta = {
        height: 0,
        width: 0
    };
    const module = {};
    let mode = null;
    let config;

    // eslint-disable-next-line no-shadow
    const initialize = (params) => {
        if (!config) {
            config = defaults;
        }

        config = $.extend(true, {}, config, params);

        if (!config.element) {
            console.log(
                'Required parameter `element` is not passed.'
            );
        }

        return module;
    };

    const getData = () => {
        const $container = $(config.container);
        const containerWidth = $container.width() + delta.width;
        const containerHeight = $container.height() + delta.height;
        let containerRatio = config.containerRatio;

        const $element = $(config.element);
        let elementRatio = config.elementRatio;

        if (!containerRatio) {
            containerRatio = containerWidth / containerHeight;
        }

        if (!elementRatio) {
            elementRatio = $element.width() / $element.height();
        }

        return {
            containerWidth,
            containerHeight,
            containerRatio,
            element: $element,
            elementRatio
        };
    };

    const alignByWidthOnly = () => {
        const data = getData();
        const height = data.containerWidth / data.elementRatio;

        data.element.css({
            height,
            width: data.containerWidth,
            top: 0.5 * (data.containerHeight - height),
            left: 0
        });

        return module;
    };

    const alignByHeightOnly = () => {
        const data = getData();
        const width = data.containerHeight * data.elementRatio;

        data.element.css({
            height: data.containerHeight,
            width: data.containerHeight * data.elementRatio,
            top: 0,
            left: 0.5 * (data.containerWidth - width)
        });

        return module;
    };

    const fireCallbacks = () => {
        $.each(callbacksList, (index, callback) => {
            callback();
        });
    };

    const removeCallback = (func) => {
        const index = $.inArray(func, callbacksList);

        if (index !== -1) {
            return callbacksList.splice(index, 1);
        }
    };

    const align = () => {
        const data = getData();

        switch (mode) {
        case 'height':
            alignByHeightOnly();
            break;

        case 'width':
            alignByWidthOnly();
            break;

        default:
            if (data.containerRatio >= data.elementRatio) {
                alignByHeightOnly();
            } else {
                alignByWidthOnly();
            }
            break;
        }

        fireCallbacks();

        return module;
    };

    const setMode = (param) => {
        if (_.isString(param)) {
            mode = param;
            align();
        }

        return module;
    };

    const setElement = (element) => {
        config.element = element;

        return module;
    };

    const addCallback = (func) => {
        if ($.isFunction(func)) {
            callbacksList.push(func);
        } else {
            console.error('[Video info]: TypeError: Argument is not a function.');
        }

        return module;
    };

    const addOnceCallback = (func) => {
        if ($.isFunction(func)) {
            const decorator = () => {
                func();
                removeCallback(func);
            };

            addCallback(decorator);
        } else {
            console.error('TypeError: Argument is not a function.');
        }

        return module;
    };

    const removeCallbacks = () => {
        callbacksList.length = 0;

        return module;
    };

    const resetDelta = () => {
        // eslint-disable-next-line no-multi-assign
        delta.height = delta.width = 0;

        return module;
    };

    const addDelta = (value, side) => {
        if (_.isNumber(value) && _.isNumber(delta[side])) {
            delta[side] += value;
        }

        return module;
    };

    const substractDelta = (value, side) => {
        if (_.isNumber(value) && _.isNumber(delta[side])) {
            delta[side] -= value;
        }

        return module;
    };

    const destroy = () => {
        const data = getData();
        data.element.css({
            height: '', width: '', top: '', left: ''
        });
        removeCallbacks();
        resetDelta();
        mode = null;
    };

    initialize.apply(module, arguments);

    return $.extend(true, module, {
        align,
        alignByWidthOnly,
        alignByHeightOnly,
        destroy,
        setParams: initialize,
        setMode,
        setElement,
        callbacks: {
            add: addCallback,
            once: addOnceCallback,
            remove: removeCallback,
            removeAll: removeCallbacks
        },
        delta: {
            add: addDelta,
            substract: substractDelta,
            reset: resetDelta
        }
    });
};

export default Resizer;
