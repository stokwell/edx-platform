'use strict';

import _ from 'underscore';

/**
 * @desc VideoTranscriptFeedbackHandler module exports a function.
 *
 * @type {function}
 * @access public
 *
 * @param {object} state - The object containing the state of the video
 *     player. All other modules, their parameters, public variables, etc.
 *     are available via this object.
 *
 * @this {object} The global window object.
 *
 */
class VideoTranscriptFeedbackHandler {
    constructor(state) {
        if (!(this instanceof VideoTranscriptFeedbackHandler)) {
            return new VideoTranscriptFeedbackHandler(state);
        }

        _.bindAll(this, 'destroy', 'getFeedbackForCurrentTranscript', 'markAsPositiveFeedback', 'markAsNegativeFeedback', 'markAsEmptyFeedback',
            'selectThumbsUp', 'selectThumbsDown', 'unselectThumbsUp', 'unselectThumbsDown', 'thumbsUpClickHandler', 'thumbsDownClickHandler',
            'sendFeedbackForCurrentTranscript', 'onHideLanguageMenu', 'getCurrentLanguage', 'loadAndSetVisibility', 'showWidget', 'hideWidget'
        );

        this.state = state;
        this.state.videoTranscriptFeedback = this;
        this.currentTranscriptLanguage = this.state.lang;
        this.transcriptLanguages = this.state.config.transcriptLanguages;

        if (this.state.el.find('.wrapper-transcript-feedback').length) {
            this.initialize();
        }

        return false;
    }

    destroy() {
        this.state.el.off(this.events);
    }

    // Initializes the module.
    initialize() {
        this.el = this.state.el.find('.wrapper-transcript-feedback');

        this.videoId = this.el.data('video-id');
        this.userId = this.el.data('user-id');
        this.aiTranslationsUrl = this.state.config.aiTranslationsUrl;

        this.thumbsUpButton = this.el.find('.thumbs-up-btn');
        this.thumbsDownButton = this.el.find('.thumbs-down-btn');
        this.thumbsUpButton.on('click', this.thumbsUpClickHandler);
        this.thumbsDownButton.on('click', this.thumbsDownClickHandler);

        this.events = {
            'language_menu:hide': this.onHideLanguageMenu,
            destroy: this.destroy
        };
        this.loadAndSetVisibility();
        this.bindHandlers();
    }

    bindHandlers() {
        this.state.el.on(this.events);
    }

    getFeedbackForCurrentTranscript() {
        const self = this;
        const url = self.aiTranslationsUrl + '/transcript-feedback' + '?transcript_language=' + self.currentTranscriptLanguage + '&video_id=' + self.videoId + '&user_id=' + self.userId;

        $.ajax({
            url: url,
            type: 'GET',
            success: function(data) {
                if (data && data.value === true) {
                    self.markAsPositiveFeedback();
                    self.currentFeedback = true;
                } else {
                    if (data && data.value === false) {
                        self.markAsNegativeFeedback();
                        self.currentFeedback = false;
                    } else {
                        self.markAsEmptyFeedback();
                        self.currentFeedback = null;
                    }
                }
            },
            error: function(error) {
                self.markAsEmptyFeedback();
                self.currentFeedback = null;
            }
        });
    }

    markAsPositiveFeedback() {
        this.selectThumbsUp();
        this.unselectThumbsDown();
    }

    markAsNegativeFeedback() {
        this.selectThumbsDown();
        this.unselectThumbsUp();
    }

    markAsEmptyFeedback() {
        this.unselectThumbsUp();
        this.unselectThumbsDown();
    }

    selectThumbsUp() {
        const thumbsUpIcon = this.thumbsUpButton.find('.thumbs-up-icon');
        if (thumbsUpIcon[0].classList.contains('fa-thumbs-o-up')) {
            thumbsUpIcon[0].classList.remove("fa-thumbs-o-up");
            thumbsUpIcon[0].classList.add("fa-thumbs-up");
        }
    }

    selectThumbsDown() {
        const thumbsDownIcon = this.thumbsDownButton.find('.thumbs-down-icon');
        if (thumbsDownIcon[0].classList.contains('fa-thumbs-o-down')) {
            thumbsDownIcon[0].classList.remove("fa-thumbs-o-down");
            thumbsDownIcon[0].classList.add("fa-thumbs-down");
        }
    }

    unselectThumbsUp() {
        const thumbsUpIcon = this.thumbsUpButton.find('.thumbs-up-icon');
        if (thumbsUpIcon[0].classList.contains('fa-thumbs-up')) {
            thumbsUpIcon[0].classList.remove("fa-thumbs-up");
            thumbsUpIcon[0].classList.add("fa-thumbs-o-up");
        }
    }

    unselectThumbsDown() {
        const thumbsDownIcon = this.thumbsDownButton.find('.thumbs-down-icon');
        if (thumbsDownIcon[0].classList.contains('fa-thumbs-down')) {
            thumbsDownIcon[0].classList.remove("fa-thumbs-down");
            thumbsDownIcon[0].classList.add("fa-thumbs-o-down");
        }
    }

    thumbsUpClickHandler() {
        if (this.currentFeedback) {
            this.sendFeedbackForCurrentTranscript(null);
        } else {
            this.sendFeedbackForCurrentTranscript(true);
        }
    }

    thumbsDownClickHandler() {
        if (this.currentFeedback === false) {
            this.sendFeedbackForCurrentTranscript(null);
        } else {
            this.sendFeedbackForCurrentTranscript(false);
        }
    }

    sendFeedbackForCurrentTranscript(feedbackValue) {
        const self = this;
        const url = self.aiTranslationsUrl + '/transcript-feedback/';
        $.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            data: {
                transcript_language: self.currentTranscriptLanguage,
                video_id: self.videoId,
                user_id: self.userId,
                value: feedbackValue,
            },
            success: function(data) {
                if (data && data.value === true) {
                    self.markAsPositiveFeedback();
                    self.currentFeedback = true;
                } else {
                    if (data && data.value === false) {
                        self.markAsNegativeFeedback();
                        self.currentFeedback = false;
                    } else {
                        self.markAsEmptyFeedback();
                        self.currentFeedback = null;
                    }
                }
            },
            error: function() {
                self.markAsEmptyFeedback();
                self.currentFeedback = null;
            }
        });
    }

    onHideLanguageMenu() {
        const newLanguageSelected = this.getCurrentLanguage();
        if (this.currentTranscriptLanguage !== newLanguageSelected) {
            this.currentTranscriptLanguage = this.getCurrentLanguage();
            this.loadAndSetVisibility();
        }
    }

    getCurrentLanguage() {
        const language = this.state.lang;
        return language;
    }

    loadAndSetVisibility() {
        const self = this;
        const url = self.aiTranslationsUrl + '/video-transcript' + '?transcript_language=' + self.currentTranscriptLanguage + '&video_id=' + self.videoId;

        $.ajax({
            url: url,
            type: 'GET',
            async: false,
            success: function(data) {
                if (data && data.status === 'Completed') {
                    self.showWidget();
                    self.getFeedbackForCurrentTranscript();
                } else {
                    self.hideWidget();
                }
            },
            error: function(error) {
                self.hideWidget();
            }
        });
    }

    showWidget() {
        this.el.show();
    }

    hideWidget() {
        this.el.hide();
    }
}

export default VideoTranscriptFeedbackHandler;
