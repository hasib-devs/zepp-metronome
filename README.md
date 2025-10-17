# Zepp OS Metronome App

A full-featured metronome application for Zepp OS smartwatches, designed for musicians and music practice.

## Features

### 🎵 Core Metronome Functionality

- **BPM Control**: Range from 30 to 300 BPM
- **Visual Beat Indicator**: Circular dots showing current beat position
- **Time Signatures**: Support for 1/4, 2/4, 3/4, 4/4, 5/4, 7/4, 5/8, 6/8, 7/8, 9/8, 12/8
- **Precise Timing**: Accurate beat timing for professional use

### 🎛️ User Interface

- **Circular BPM Dial**: Visual representation of tempo with interactive touch control
- **BPM Display**: Large, easy-to-read tempo display
- **+/- Buttons**: Quick BPM adjustment buttons
- **Play/Pause**: Center button for metronome control
- **Time Signature Selector**: Easy access to different time signatures

### 📱 Interactive Controls

- **Touch Dial**: Touch and drag on circular dial to adjust BPM
- **Tap Tempo**: Tap the tempo area to set BPM by tapping rhythm
- **Button Feedback**: Visual and haptic feedback for all interactions
- **Settings Persistence**: Remembers your last BPM and time signature

### 🔊 Feedback Systems

- **Visual Feedback**:
  - Beat indicator flashing
  - Play button pulsing during playback
  - Different colors for downbeats vs regular beats
- **Haptic Feedback**:
  - Stronger vibration for downbeats (first beat)
  - Lighter vibration for other beats
  - Button press feedback

### ⚙️ Technical Features

- **Accurate Timing Engine**: Custom metronome engine for precise beat timing
- **Memory Management**: Efficient resource usage for smartwatch performance
- **State Management**: Proper cleanup and memory management
- **Error Handling**: Robust error handling for device compatibility

## Usage

### Basic Operation

1. **Start/Stop**: Tap the green play button in the center of the circular dial
2. **Adjust Tempo**: Use +/- buttons or drag around the circular dial
3. **Change Time Signature**: Tap the time signature button at the bottom
4. **Tap Tempo**: Tap the "TAP TEMPO" area repeatedly to set tempo by rhythm

### Navigation

- **Main Screen**: Core metronome functionality
- **Time Signature Screen**: Select from various time signatures
- **Back Button**: Return to previous screen or exit app

### Visual Indicators

- **Green Dots**: Show current beat position within the time signature
- **Bright Flash**: Indicates the current beat (white for downbeat, cyan for others)
- **Green Circle**: Shows current BPM position on the dial
- **Play Button**: Changes between play ▶ and pause ⏸ icons

## Installation

This app is built using the Zepp OS development framework. To install:

1. Build using `pnpm run dev` for development
2. Use `pnpm run preview` to test in simulator
3. Deploy to compatible Zepp OS devices

## Compatibility

- **Target Device**: Amazfit Bip 5 Unity
- **Zepp OS Version**: 3.0.0+
- **Framework**: Zepp OS SDK v3

## Development

Built with:

- **JavaScript**: Core application logic
- **Zepp OS UI**: Native UI components
- **Custom Engine**: Purpose-built metronome timing engine

### Key Components

- `MetronomeEngine`: Core timing and beat management
- `Storage`: Settings persistence
- **Main Page**: Primary metronome interface
- **Time Signature Page**: Time signature selection

## Features Implemented

✅ BPM display and controls (30-300 BPM range)  
✅ Circular visual dial with touch interaction  
✅ Multiple time signatures (simple and compound)  
✅ Visual beat indicators with animations  
✅ Haptic feedback (different for downbeats)  
✅ Tap tempo functionality  
✅ Settings persistence  
✅ Professional-grade timing accuracy  
✅ Intuitive touch controls  
✅ Modern, clean UI design

## For Musicians

This metronome is designed with musicians in mind:

- **Practice Sessions**: Reliable timing for instrument practice
- **Different Genres**: Support for various time signatures
- **Performance Ready**: Accurate timing suitable for live use
- **Visual Cues**: Clear beat indicators for noisy environments
- **Portable**: Always available on your smartwatch

Perfect for:

- Piano practice
- Guitar playing
- Drum practice
- Ensemble rehearsals
- Music education
- Live performance preparation
