---
title: Creating a new UIBUILDER video
description: |
  This is the process and tools I use to create a new video in the YouTube channel for UIBUILDER. It is not intended as a tutorial for how to create videos, but rather as a record of the process I use and the tools I use.
created: 2026-04-22 14:05:55
updated: 2026-04-25 15:58:16
---

## Tooling

* Microsoft PowerPoint for creating the Intro slide.
* OBS Studio for recording the screen and audio.
* Kdenlive for editing the video and publishing to YouTube.

## Process

1. Plan the content of the video and create a script or outline.
2. Set up the recording environment, including the screen layout and audio settings.
   * Update software.
   * Update nrtest.
   * Auto-hide the Windows taskbar and turn off notifications.
   * Open a new terminal window and run the nrvideos Node-RED instance. Make sure the terminal window is named `nrvideos`.
   * In Vivaldi browser, use the TESTING profile and hide the status panel.
      * Open in 3 separate windows on the default monitor:
        * nrvideos Node-RED Editor. (Make sure all non-relavent packages are uningstalled and that Node-RED and uibuilder are up to date.)
        * A window to use with the `demo` instance
        * A windows to use with the `test` instance
      * Change the `ahk_id` values for the 2 windows in the AHK startup script and reload the script.
      * Open the VSCode `data` workspace (see the nrvideos folder)
   * Open OBS Studio on the wide-screen monitor
   
   > [!NOTE]
   > AutoHotKey is used to provide quick change keyboard shortcuts for switching between windows:
   > * `Alt + 1` - Switch to the nrvideos Node-RED Editor window
   > * `Alt + 2` - Switch to the nrvideos demo instance window
   > * `Alt + 3` - Switch to the nrvideos test instance window
   > * `Alt + 4` - Switch to the VSCode data workspace window
   > * `Alt + 5` - Switch to the nrvideos terminal window

3. Update the `uibuilder videos title.pptx` PowerPoint slide with the title of the video and any relevant information, then export it as an image to use as the intro slide in the video.

4. Record the video using OBS Studio, following the script or outline.

5. Edit the video in DaVinci Resolve:

   1. Create a new project (copy the last one to retain settings).
   2. Import the recorded video(s) and the intro slide image.
   3. Add any necessary edits, cuts, transitions, and annotations.
   4. Add/adjust any background music (see the "Royalty-Free Music" section below for recommendations).
   5. Render the final video using the recommended settings for YouTube (see below).

6. Upload the rendered video to YouTube, ensuring to include a detailed description, relevant tags, and a custom thumbnail (which can be created using the intro slide or a screenshot from the video). Set the video to public and publish it.

7. Share the video on social media and the Node-RED forum to reach the target audience.

## DaVinci Resolve Configuration

Even if your OBS recordings are 1080p, you should set your Resolve timeline to 4K (3840 x 2160).

* Why? YouTube gives 4K uploads a higher-quality "VP9" or "AV1" codec. If you upload in 1080p, YouTube uses a lower-bitrate codec that often makes text and fine details in tutorials look blurry.
* How: Go to File > Project Settings > Master Settings and set Timeline Resolution to 3840 x 2160 Ultra HD.

### Fixing the Audio (Fairlight)
Before exporting, head to the Fairlight tab (the music note icon at the bottom). Since you mentioned "bad audio," do this:
* Voiceover Clarity: Apply a Dynamics effect to your voiceover track and turn on the Compressor. This keeps your voice at a consistent volume so viewers don't have to adjust their speakers.
* Loudness Standard: YouTube’s target is -14 LUFS. You can see this on the Loudness Meter. If your audio is much quieter, it will sound "weak" on YouTube; if it's much louder, YouTube will automatically turn it down, which can ruin the mix.
* Noise Reduction: Right-click your audio clip and select Voice Isolation (if you have the Studio version) or use the Noise Reduction effect to strip out fan hum from your OBS recordings.

### The "Deliver" Page (Export Settings)
When you're ready to export, click the Rocket Ship icon. Ignore the "YouTube" preset; Custom Export is better for quality.

| Setting      | Recommendation |
|--------------|----------------|
| Format       | QuickTime or MP4 |
| Codec        | AV1 (Best for 2026) or H.265 (HEVC) |
| Encoder      | NVIDIA or AMD (Use your hardware encoder for speed) |
| Resolution   | 3840 x 2160 Ultra HD |
| Frame Rate   | Match your OBS recording (usually 30 or 60 fps) |
| Quality      | Set to Restrict to 60,000 Kb/s (for 4K) |
| Rate Control | VBR High Quality |

### Critical "Color Fix" for Windows Users
To prevent your video from looking "washed out" or faded once it's uploaded:
* In the Deliver page, scroll down to Advanced Settings.
* Set Color Space Tag to Rec.709.
* Set Gamma Tag to Rec.709 (or Gamma 2.4).
This ensures the colors you see in Resolve are the same colors people see on YouTube.

### Chapters from Markers
Since this is an instructional video, chapters are essential.
* While editing, press 'M' on your keyboard to drop a marker at the start of each new section.
* Double-click the marker to give it a name (e.g., "Step 1: Setup").
* On the Deliver page, check the box Chapters from markers.
YouTube will now automatically create the "segments" in the video player scrollbar.

## Royalty-Free Music
If you want something less "generic" than the YouTube library, these sites offer high-quality technical beds:

| Site          | Best For...                       | License Note                                      |
|---------------|-----------------------------------|---------------------------------------------------|
| Pixabay Music | Modern, clean tech sounds         | Completely free, no attribution required.         |
| Bensound      | High-energy or "innovative" feels | Free version requires attribution in description. |
| Mixkit        | Short, "punchy" loops             | Great for quick 2-minute help videos.             |
| Uppbeat       | High-quality "vlogger" style      | Free tier allows 10 downloads/month.              |
