/* eslint-disable no-console, no-param-reassign */
/**
 * HTML5 video player module to support HLS video playback.
 *
 */

'use strict';

import _ from 'underscore';
import HTML5Video from 'video/02_html5_video.js';
import HLS from 'hls';

const HLSVideo = {};

/**
 * Initialize HLS video player.
 *
 * @param {jQuery} el  Reference to video player container element
 * @param {Object} config  Contains common config for video player
 */
class Player extends HTML5Video.Player {
    constructor(el, config) {
        super(el, config);

        const self = this;

        this.config = config;

        _.bindAll(this, 'playVideo', 'pauseVideo', 'onReady');

        // If we have only HLS sources and browser doesn't support HLS then show error message.
        if (config.HLSOnlySources && !config.canPlayHLS) {
            this.showErrorMessage(null, '.video-hls-error');
            return;
        }

        this.config.state.el.on('initialize', _.once(function() {
            console.log('[HLS Video]: HLS Player initialized');
            self.showPlayButton();
        }));

        // Safari has native support to play HLS videos
        if (config.browserIsSafari) {
            this.videoEl.attr('src', config.videoSources[0]);
        } else {
            // load auto start if auto_advance is enabled
            if (config.state.auto_advance) {
                this.hls = new HLS({autoStartLoad: true});
            } else {
                this.hls = new HLS({autoStartLoad: false});
            }
            this.hls.loadSource(config.videoSources[0]);
            this.hls.attachMedia(this.video);

            this.hls.on(HLS.Events.ERROR, this.onError.bind(this));

            this.hls.on(HLS.Events.MANIFEST_PARSED, function(event, data) {
                console.log(
                    '[HLS Video]: MANIFEST_PARSED, qualityLevelsInfo: ',
                    data.levels.map(function(level) {
                        return {
                            bitrate: level.bitrate,
                            resolution: level.width + 'x' + level.height
                        };
                    })
                );
                self.config.onReadyHLS();
            });
            this.hls.on(HLS.Events.LEVEL_SWITCHED, function(event, data) {
                const level = self.hls.levels[data.level];
                console.log(
                    '[HLS Video]: LEVEL_SWITCHED, qualityLevelInfo: ',
                    {
                        bitrate: level.bitrate,
                        resolution: level.width + 'x' + level.height
                    }
                );
            });
        }
    }

    playVideo() {
        super.updatePlayerLoadingState('show');
        if (!this.config.browserIsSafari) {
            this.hls.startLoad();
        }
        super.playVideo();
    }

    pauseVideo() {
        super.pauseVideo();
        super.updatePlayerLoadingState('hide');
    }

    onPlaying() {
        super.onPlaying();
        super.updatePlayerLoadingState('hide');
    }

    onReady() {
        this.config.events.onReady(null);
    }

    /**
     * Handler for HLS video errors. This only takes care of fatal erros, non-fatal errors
     * are automatically handled by hls.js
     *
     * @param {String} event `hlsError`
     * @param {Object} data  Contains the information regarding error occurred.
     */
    onError(event, data) {
        if (data.fatal) {
            switch (data.type) {
            case HLS.ErrorTypes.NETWORK_ERROR:
                console.error(
                    '[HLS Video]: Fatal network error encountered, try to recover. Details: %s',
                    data.details
                );
                this.hls.startLoad();
                break;
            case HLS.ErrorTypes.MEDIA_ERROR:
                console.error(
                    '[HLS Video]: Fatal media error encountered, try to recover. Details: %s',
                    data.details
                );
                this.hls.recoverMediaError();
                break;
            default:
                console.error(
                    '[HLS Video]: Unrecoverable error encountered. Details: %s',
                    data.details
                );
                break;
            }
        }
    }
}

HLSVideo.Player = Player;

export default HLSVideo;
