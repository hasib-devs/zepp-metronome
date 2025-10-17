import * as hmUI from "@zos/ui";
import { log as Logger, px } from "@zos/utils";
import { back } from "@zos/router";
import { getDeviceInfo } from "@zos/device";

const logger = Logger.getLogger("timeSignature");
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

Page({
    state: {
        currentTimeSignature: { numerator: 4, denominator: 4 },
        timeSignatures: [
            { numerator: 1, denominator: 4 },
            { numerator: 2, denominator: 4 },
            { numerator: 3, denominator: 4 },
            { numerator: 4, denominator: 4 },
            { numerator: 5, denominator: 4 },
            { numerator: 7, denominator: 4 },
            { numerator: 5, denominator: 8 },
            { numerator: 6, denominator: 8 },
            { numerator: 7, denominator: 8 },
            { numerator: 9, denominator: 8 },
            { numerator: 12, denominator: 8 }
        ]
    },

    onInit() {
        logger.debug("time signature page onInit");
        this.loadCurrentTimeSignature();
    },

    build() {
        logger.debug("time signature page build");

        // Background
        hmUI.createWidget(hmUI.widget.FILL_RECT, {
            x: 0,
            y: 0,
            w: DEVICE_WIDTH,
            h: DEVICE_HEIGHT,
            color: 0x1a1a1a
        });

        // Back button
        this.backButton = hmUI.createWidget(hmUI.widget.BUTTON, {
            x: px(20),
            y: px(30),
            w: px(40),
            h: px(40),
            text: "<",
            normal_color: 0x333333,
            press_color: 0x555555,
            color: 0xffffff,
            text_size: px(24),
            click_func: () => {
                back();
            }
        });

        // Title
        hmUI.createWidget(hmUI.widget.TEXT, {
            x: 0,
            y: px(35),
            w: DEVICE_WIDTH,
            h: px(50),
            text: "Time signatures",
            text_size: px(28),
            color: 0xffffff,
            align_h: hmUI.align.CENTER_H,
            align_v: hmUI.align.CENTER_V
        });

        // Create time signature options
        this.createTimeSignatureOptions();
    },

    createTimeSignatureOptions() {
        const startY = px(120);
        const itemHeight = px(60);
        const padding = px(20);

        this.timeSignatureButtons = [];
        this.checkMarks = [];

        this.state.timeSignatures.forEach((timeSignature, index) => {
            const y = startY + index * itemHeight;

            // Option background
            const button = hmUI.createWidget(hmUI.widget.FILL_RECT, {
                x: padding,
                y: y,
                w: DEVICE_WIDTH - padding * 2,
                h: itemHeight - px(2),
                color: 0x2a2a2a
            });

            // Time signature text
            hmUI.createWidget(hmUI.widget.TEXT, {
                x: padding + px(20),
                y: y,
                w: px(100),
                h: itemHeight - px(2),
                text: `${timeSignature.numerator}/${timeSignature.denominator}`,
                text_size: px(24),
                color: 0xffffff,
                align_v: hmUI.align.CENTER_V
            });

            // Check mark (only visible for current selection)
            const checkMark = hmUI.createWidget(hmUI.widget.TEXT, {
                x: DEVICE_WIDTH - padding - px(60),
                y: y,
                w: px(40),
                h: itemHeight - px(2),
                text: "✓",
                text_size: px(24),
                color: 0x00ff88,
                align_h: hmUI.align.CENTER_H,
                align_v: hmUI.align.CENTER_V
            });

            // Hide check mark initially
            if (timeSignature.numerator !== this.state.currentTimeSignature.numerator ||
                timeSignature.denominator !== this.state.currentTimeSignature.denominator) {
                checkMark.setProperty(hmUI.prop.VISIBLE, false);
            }

            // Add click handler
            button.addEventListener(hmUI.event.CLICK_UP, () => {
                this.selectTimeSignature(timeSignature, index);
            });

            this.timeSignatureButtons.push(button);
            this.checkMarks.push(checkMark);
        });
    },

    selectTimeSignature(timeSignature, index) {
        // Hide all check marks
        this.checkMarks.forEach(checkMark => {
            checkMark.setProperty(hmUI.prop.VISIBLE, false);
        });

        // Show check mark for selected item
        this.checkMarks[index].setProperty(hmUI.prop.VISIBLE, true);

        // Update current selection
        this.state.currentTimeSignature = timeSignature;

        // Store the selection
        this.saveTimeSignature(timeSignature);

        logger.debug(`Selected time signature: ${timeSignature.numerator}/${timeSignature.denominator}`);

        // Go back to main page after a short delay
        setTimeout(() => {
            back();
        }, 300);
    },

    saveTimeSignature(timeSignature) {
        // Save to storage so main page can pick it up
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('metronome_time_signature', JSON.stringify(timeSignature));
            }
        } catch (error) {
            logger.debug(`Failed to save time signature: ${error}`);
        }
    },

    loadCurrentTimeSignature() {
        try {
            if (typeof localStorage !== 'undefined') {
                const stored = localStorage.getItem('metronome_time_signature');
                if (stored) {
                    this.state.currentTimeSignature = JSON.parse(stored);
                }
            }
        } catch (error) {
            logger.debug(`Failed to load time signature: ${error}`);
        }
    },

    onDestroy() {
        logger.debug("time signature page onDestroy");
    },
});