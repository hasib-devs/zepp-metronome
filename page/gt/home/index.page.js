import * as hmUI from "@zos/ui";
import { log as Logger, px } from "@zos/utils";
import { push } from "@zos/router";
import { createTimer, deleteTimer } from "@zos/timer";
import { getDeviceInfo } from "@zos/device";
import { vibrate } from "@zos/sensor";
import { DEVICE_WIDTH, DEVICE_HEIGHT } from "zosLoader:./index.page.[pf].layout.js";
import { MetronomeEngine, Storage } from "../../../utils/index.js";

const logger = Logger.getLogger("metronome");

Page({
  onInit(params) {
    logger.debug("metronome page onInit");

    // Initialize metronome engine
    this.metronome = new MetronomeEngine();

    // Load saved settings
    const savedBpm = Storage.load('metronome_bpm', 120);
    const savedTimeSignature = Storage.load('metronome_time_signature', { numerator: 4, denominator: 4 });

    this.metronome.setBpm(savedBpm);
    this.metronome.setTimeSignature(savedTimeSignature.numerator, savedTimeSignature.denominator);

    // Handle returning from time signature page
    if (params && params.timeSignature) {
      this.metronome.setTimeSignature(params.timeSignature.numerator, params.timeSignature.denominator);
      Storage.save('metronome_time_signature', params.timeSignature);
    }

    // Set up tick callback
    this.metronome.onTick = (beatIndex, timeSignature) => {
      this.onMetronomeTick(beatIndex, timeSignature);
    };
  },

  build() {
    logger.debug("metronome page build");

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
        hmApp.gotoHome();
      }
    });

    // Title
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: px(35),
      w: DEVICE_WIDTH,
      h: px(50),
      text: "Metronome",
      text_size: px(28),
      color: 0xffffff,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V
    });

    // BPM Display and controls
    this.createBpmControls();

    // Circular BPM dial
    this.createCircularDial();

    // Play/Pause button
    this.createPlayButton();

    // Time signature button
    this.createTimeSignatureButton();

    // Beat indicator dots
    this.createBeatIndicators();
    
    // Initialize tap tempo tracking
    this.tapTimes = [];
  },

  createBpmControls() {
    const centerY = px(150);

    // Minus button
    this.minusButton = hmUI.createWidget(hmUI.widget.CIRCLE, {
      center_x: px(120),
      center_y: centerY,
      radius: px(30),
      color: 0x333333
    });

    hmUI.createWidget(hmUI.widget.TEXT, {
      x: px(105),
      y: centerY - px(15),
      w: px(30),
      h: px(30),
      text: "−",
      text_size: px(32),
      color: 0xffffff,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V
    });

    // BPM display
    this.bpmText = hmUI.createWidget(hmUI.widget.TEXT, {
      x: px(160),
      y: centerY - px(40),
      w: px(160),
      h: px(80),
      text: this.metronome.bpm.toString(),
      text_size: px(64),
      color: 0xffffff,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V
    });

    // "Beats per min" label
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: px(160),
      y: centerY + px(30),
      w: px(160),
      h: px(30),
      text: "Beats per min",
      text_size: px(16),
      color: 0x888888,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V
    });

    // Plus button
    this.plusButton = hmUI.createWidget(hmUI.widget.CIRCLE, {
      center_x: px(360),
      center_y: centerY,
      radius: px(30),
      color: 0x333333
    });

    hmUI.createWidget(hmUI.widget.TEXT, {
      x: px(345),
      y: centerY - px(15),
      w: px(30),
      h: px(30),
      text: "+",
      text_size: px(28),
      color: 0xffffff,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V
    });

    // Add click handlers for BPM control
    this.minusButton.addEventListener(hmUI.event.CLICK_UP, () => {
      this.decreaseBpm();
      this.buttonFeedback(this.minusButton);
    });

    this.plusButton.addEventListener(hmUI.event.CLICK_UP, () => {
      this.increaseBpm();
      this.buttonFeedback(this.plusButton);
    });
  },

  createCircularDial() {
    const centerX = DEVICE_WIDTH / 2;
    const centerY = px(380);
    const radius = px(120);

    // Outer circle background
    hmUI.createWidget(hmUI.widget.CIRCLE, {
      center_x: centerX,
      center_y: centerY,
      radius: radius + px(10),
      color: 0x2a2a2a
    });

    // Draw tick marks around the circle
    for (let i = 0; i < 60; i++) {
      const angle = (i * 6 - 90) * Math.PI / 180; // Convert to radians, start from top
      const innerRadius = radius - px(15);
      const outerRadius = radius;

      const x1 = centerX + Math.cos(angle) * innerRadius;
      const y1 = centerY + Math.sin(angle) * innerRadius;
      const x2 = centerX + Math.cos(angle) * outerRadius;
      const y2 = centerY + Math.sin(angle) * outerRadius;

      hmUI.createWidget(hmUI.widget.FILL_RECT, {
        x: x1 - px(1),
        y: y1 - px(1),
        w: px(2),
        h: Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)),
        color: i % 5 === 0 ? 0x666666 : 0x444444
      });
    }

    // BPM range labels
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: centerX - px(80),
      y: centerY + px(90),
      w: px(30),
      h: px(20),
      text: "75",
      text_size: px(14),
      color: 0x888888,
      align_h: hmUI.align.CENTER_H
    });

    hmUI.createWidget(hmUI.widget.TEXT, {
      x: centerX + px(50),
      y: centerY + px(90),
      w: px(30),
      h: px(20),
      text: "195",
      text_size: px(14),
      color: 0x888888,
      align_h: hmUI.align.CENTER_H
    });

    hmUI.createWidget(hmUI.widget.TEXT, {
      x: centerX - px(15),
      y: centerY + px(140),
      w: px(30),
      h: px(20),
      text: "30",
      text_size: px(14),
      color: 0x888888,
      align_h: hmUI.align.CENTER_H
    });

    hmUI.createWidget(hmUI.widget.TEXT, {
      x: centerX - px(15),
      y: centerY - px(165),
      w: px(30),
      h: px(20),
      text: "240",
      text_size: px(14),
      color: 0x888888,
      align_h: hmUI.align.CENTER_H
    });

    // Current BPM indicator (green circle)
    this.bpmIndicator = hmUI.createWidget(hmUI.widget.CIRCLE, {
      center_x: centerX,
      center_y: centerY - px(100), // Will be updated based on BPM
      radius: px(8),
      color: 0x00ff88
    });

    // Current BPM value on dial
    this.dialBpmText = hmUI.createWidget(hmUI.widget.TEXT, {
      x: centerX - px(15),
      y: centerY - px(125),
      w: px(30),
      h: px(20),
      text: this.metronome.bpm.toString(),
      text_size: px(12),
      color: 0x888888,
      align_h: hmUI.align.CENTER_H
    });

    // Play button in center
    this.createCenterPlayButton(centerX, centerY);

    // Add touch interaction to the dial area
    this.createDialInteraction(centerX, centerY, radius);

    this.updateBpmIndicator();
  },

  createCenterPlayButton(centerX, centerY) {
    // Play/pause button background
    this.centerPlayButton = hmUI.createWidget(hmUI.widget.CIRCLE, {
      center_x: centerX,
      center_y: centerY,
      radius: px(25),
      color: 0x00ff88
    });

    // Play icon (triangle)
    this.playIcon = hmUI.createWidget(hmUI.widget.TEXT, {
      x: centerX - px(10),
      y: centerY - px(12),
      w: px(20),
      h: px(24),
      text: "▶",
      text_size: px(20),
      color: 0x000000,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V
    });

    this.centerPlayButton.addEventListener(hmUI.event.CLICK_UP, () => {
      this.togglePlay();
    });
  },

  createDialInteraction(centerX, centerY, radius) {
    // Create an invisible overlay for dial interaction
    this.dialOverlay = hmUI.createWidget(hmUI.widget.BUTTON, {
      x: centerX - radius - px(20),
      y: centerY - radius - px(20),
      w: (radius + px(20)) * 2,
      h: (radius + px(20)) * 2,
      normal_color: 0x000000,
      press_color: 0x000000,
      text: "",
      text_size: px(1)
    });

    // Make it transparent
    this.dialOverlay.setProperty(hmUI.prop.COLOR, 0x00000000);
    
    // Add gesture handling for circular dial
    let isDialPressed = false;
    
    this.dialOverlay.addEventListener(hmUI.event.CLICK_DOWN, (info) => {
      isDialPressed = true;
      this.handleDialTouch(info.x, info.y, centerX, centerY);
    });

    this.dialOverlay.addEventListener(hmUI.event.MOVE, (info) => {
      if (isDialPressed) {
        this.handleDialTouch(info.x, info.y, centerX, centerY);
      }
    });

    this.dialOverlay.addEventListener(hmUI.event.CLICK_UP, () => {
      isDialPressed = false;
    });
  },

  handleDialTouch(touchX, touchY, centerX, centerY) {
    // Calculate angle from touch position
    const deltaX = touchX - centerX;
    const deltaY = touchY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Only respond to touches in the dial ring area
    if (distance > px(60) && distance < px(130)) {
      let angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
      
      // Normalize angle to 0-360
      if (angle < 0) angle += 360;
      
      // Convert angle to BPM (0-360 degrees maps to 30-300 BPM)
      const normalizedAngle = (angle + 90) % 360; // Adjust so top is 0
      const bpmRange = this.metronome.maxBpm - this.metronome.minBpm;
      const newBpm = Math.round(this.metronome.minBpm + (normalizedAngle / 360) * bpmRange);
      
      if (newBpm !== this.metronome.bpm) {
        this.metronome.setBpm(newBpm);
        this.updateBpmDisplay();
        this.updateBpmIndicator();
        Storage.save('metronome_bpm', newBpm);
        
        // Provide haptic feedback
        this.buttonFeedback({ setProperty: () => {} }); // Dummy object for haptic only
      }
    }
  },

  createPlayButton() {
    // Tap tempo area below the dial
    this.tapTempoArea = hmUI.createWidget(hmUI.widget.BUTTON, {
      x: DEVICE_WIDTH / 2 - px(60),
      y: px(520),
      w: px(120),
      h: px(50),
      normal_color: 0x2a2a2a,
      press_color: 0x444444,
      text: "TAP TEMPO",
      text_size: px(12),
      color: 0x888888,
      radius: px(10),
      click_func: () => {
        this.handleTapTempo();
      }
    });

    // Hand/tap icon
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: DEVICE_WIDTH / 2 - px(20),
      y: px(530),
      w: px(40),
      h: px(30),
      text: "👆",
      text_size: px(20),
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V
    });
  },

  createTimeSignatureButton() {
    const buttonY = px(580);

    // Time signature display
    this.timeSignatureButton = hmUI.createWidget(hmUI.widget.STROKE_RECT, {
      x: DEVICE_WIDTH / 2 - px(40),
      y: buttonY,
      w: px(80),
      h: px(40),
      radius: px(20),
      line_width: px(2),
      color: 0x666666
    });

    this.timeSignatureText = hmUI.createWidget(hmUI.widget.TEXT, {
      x: DEVICE_WIDTH / 2 - px(40),
      y: buttonY,
      w: px(80),
      h: px(40),
      text: `${this.metronome.timeSignature.numerator}/${this.metronome.timeSignature.denominator}`,
      text_size: px(18),
      color: 0xffffff,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V
    });

    // Label
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: DEVICE_WIDTH / 2 - px(60),
      y: buttonY + px(45),
      w: px(120),
      h: px(20),
      text: "Time signature",
      text_size: px(14),
      color: 0x888888,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V
    });

    this.timeSignatureButton.addEventListener(hmUI.event.CLICK_UP, () => {
      push({ url: "page/gt/timeSignature/index.page", params: {} });
    });
  },

  createBeatIndicators() {
    this.beatDots = [];
    const startX = DEVICE_WIDTH / 2 - px(60);
    const dotY = px(650);

    for (let i = 0; i < 4; i++) {
      const dot = hmUI.createWidget(hmUI.widget.CIRCLE, {
        center_x: startX + i * px(40),
        center_y: dotY,
        radius: px(8),
        color: i === 0 ? 0x00ff88 : 0x444444
      });
      this.beatDots.push(dot);
    }
  },

  // BPM Control Methods
  increaseBpm() {
    const newBpm = Math.min(this.metronome.bpm + 1, this.metronome.maxBpm);
    this.metronome.setBpm(newBpm);
    this.updateBpmDisplay();
    this.updateBpmIndicator();
    Storage.save('metronome_bpm', newBpm);
  },

  decreaseBpm() {
    const newBpm = Math.max(this.metronome.bpm - 1, this.metronome.minBpm);
    this.metronome.setBpm(newBpm);
    this.updateBpmDisplay();
    this.updateBpmIndicator();
    Storage.save('metronome_bpm', newBpm);
  },

  updateBpmDisplay() {
    this.bpmText.setProperty(hmUI.prop.TEXT, this.metronome.bpm.toString());
    this.dialBpmText.setProperty(hmUI.prop.TEXT, this.metronome.bpm.toString());
  },

  updateBpmIndicator() {
    // Calculate position on circular dial based on BPM
    const centerX = DEVICE_WIDTH / 2;
    const centerY = px(380);
    const radius = px(100);

    // Map BPM to angle (30-300 BPM mapped to full circle)
    const normalizedBpm = (this.metronome.bpm - 30) / (300 - 30);
    const angle = (normalizedBpm * 360 - 90) * Math.PI / 180; // Start from top

    const indicatorX = centerX + Math.cos(angle) * radius;
    const indicatorY = centerY + Math.sin(angle) * radius;

    this.bpmIndicator.setProperty(hmUI.prop.CENTER_X, indicatorX);
    this.bpmIndicator.setProperty(hmUI.prop.CENTER_Y, indicatorY);

    this.dialBpmText.setProperty(hmUI.prop.X, indicatorX - px(15));
    this.dialBpmText.setProperty(hmUI.prop.Y, indicatorY - px(25));
  },

  togglePlay() {
    if (this.metronome.isPlaying) {
      this.stopMetronome();
    } else {
      this.startMetronome();
    }
  },

  startMetronome() {
    this.metronome.start();

    // Update play icon to pause
    this.playIcon.setProperty(hmUI.prop.TEXT, "⏸");
  },

  stopMetronome() {
    this.metronome.stop();

    // Update pause icon to play
    this.playIcon.setProperty(hmUI.prop.TEXT, "▶");

    // Reset beat indicators
    this.resetBeatIndicators();
  },

  onMetronomeTick(beatIndex, timeSignature) {
    // Update visual indicators
    this.updateBeatIndicators(beatIndex, timeSignature);

    // Add visual feedback (flash effect)
    this.flashBeatIndicator(beatIndex);

    // Add haptic feedback - stronger vibration for first beat
    try {
      if (beatIndex === 0) {
        // Stronger vibration for downbeat
        vibrate.scene.call({ mode: vibrate.scene_type.MEDIUM });
      } else {
        // Lighter vibration for other beats
        vibrate.scene.call({ mode: vibrate.scene_type.SHORT });
      }
    } catch (error) {
      logger.debug(`Vibration failed: ${error}`);
    }
  },

  updateBeatIndicators(currentBeat = 0, timeSignature = null) {
    const ts = timeSignature || this.metronome.timeSignature;

    for (let i = 0; i < this.beatDots.length; i++) {
      if (i < ts.numerator) {
        const color = i === currentBeat ? 0x00ff88 : 0x444444;
        this.beatDots[i].setProperty(hmUI.prop.COLOR, color);
      } else {
        this.beatDots[i].setProperty(hmUI.prop.COLOR, 0x222222);
      }
    }
  },

  resetBeatIndicators() {
    const ts = this.metronome.timeSignature;
    for (let i = 0; i < this.beatDots.length; i++) {
      if (i < ts.numerator) {
        const color = i === 0 ? 0x00ff88 : 0x444444;
        this.beatDots[i].setProperty(hmUI.prop.COLOR, color);
      } else {
        this.beatDots[i].setProperty(hmUI.prop.COLOR, 0x222222);
      }
    }
  },

  flashBeatIndicator(beatIndex) {
    // Create a brief flash effect for the current beat
    if (this.beatDots[beatIndex]) {
      // Flash bright white for downbeat, cyan for other beats
      const flashColor = beatIndex === 0 ? 0xffffff : 0x00ffff;
      this.beatDots[beatIndex].setProperty(hmUI.prop.COLOR, flashColor);

      // Return to normal color after 100ms
      setTimeout(() => {
        if (this.beatDots[beatIndex]) {
          this.beatDots[beatIndex].setProperty(hmUI.prop.COLOR, 0x00ff88);
        }
      }, 100);
    }

    // Add a pulse effect to the center play button
    this.pulsePlayButton();
  },

  pulsePlayButton() {
    if (this.centerPlayButton && this.metronome.isPlaying) {
      // Briefly change the play button color
      this.centerPlayButton.setProperty(hmUI.prop.COLOR, 0xffffff);

      setTimeout(() => {
        if (this.centerPlayButton) {
          this.centerPlayButton.setProperty(hmUI.prop.COLOR, 0x00ff88);
        }
      }, 50);
    }
  },

  buttonFeedback(button) {
    // Provide visual feedback for button presses
    const originalColor = 0x333333;
    const pressedColor = 0x555555;

    button.setProperty(hmUI.prop.COLOR, pressedColor);

    setTimeout(() => {
      button.setProperty(hmUI.prop.COLOR, originalColor);
    }, 150);

    // Add small vibration for button feedback
    try {
      vibrate.scene.call({ mode: vibrate.scene_type.SHORT });
    } catch (error) {
      logger.debug(`Button vibration failed: ${error}`);
    }
  },

  handleTapTempo() {
    const now = Date.now();
    this.tapTimes.push(now);
    
    // Keep only the last 5 taps for more accurate averaging
    if (this.tapTimes.length > 5) {
      this.tapTimes.shift();
    }
    
    // Need at least 2 taps to calculate tempo
    if (this.tapTimes.length >= 2) {
      // Calculate average interval between taps
      let totalInterval = 0;
      for (let i = 1; i < this.tapTimes.length; i++) {
        totalInterval += this.tapTimes[i] - this.tapTimes[i - 1];
      }
      
      const avgInterval = totalInterval / (this.tapTimes.length - 1);
      const calculatedBpm = Math.round(60000 / avgInterval);
      
      // Only set if it's within reasonable range
      if (calculatedBpm >= this.metronome.minBpm && calculatedBpm <= this.metronome.maxBpm) {
        this.metronome.setBpm(calculatedBpm);
        this.updateBpmDisplay();
        this.updateBpmIndicator();
        Storage.save('metronome_bpm', calculatedBpm);
      }
    }
    
    // Clear taps after 3 seconds of inactivity
    setTimeout(() => {
      if (this.tapTimes.length > 0 && Date.now() - this.tapTimes[this.tapTimes.length - 1] > 3000) {
        this.tapTimes = [];
      }
    }, 3000);
    
    // Provide feedback
    this.buttonFeedback({ setProperty: () => {} });
  },

  onResume() {
    // Refresh time signature display when returning from time signature page
    const savedTimeSignature = Storage.load('metronome_time_signature', { numerator: 4, denominator: 4 });

    if (savedTimeSignature.numerator !== this.metronome.timeSignature.numerator ||
      savedTimeSignature.denominator !== this.metronome.timeSignature.denominator) {

      this.metronome.setTimeSignature(savedTimeSignature.numerator, savedTimeSignature.denominator);
      this.timeSignatureText.setProperty(hmUI.prop.TEXT,
        `${this.metronome.timeSignature.numerator}/${this.metronome.timeSignature.denominator}`);
      this.updateBeatIndicators();
    }
  },

  onDestroy() {
    logger.debug("metronome page onDestroy");
    if (this.metronome) {
      this.metronome.stop();
    }
  },
});
