# Bilibili-EnToCn

Bilibili-EnToCn is a browser extension that translates your English text drafts to Chinese on the fly while typing in comment boxes, search fields, or danmaku inputs on Bilibili. 

It operates completely in the background with zero UI clutter. Because it uses native browser input events, Bilibili's React/Vue frontend properly registers the translated text, clears the field placeholders, and keeps the post or search buttons active.

## Why Use It?

* **Better Search Results:** Bilibili is a Chinese platform, and its search engine is heavily optimized for Chinese characters. Searching in English often yields zero or poor results. Translating your search queries to Chinese instantly opens up the full catalog of videos, creators, and niche topics.
* **Engage with the Community:** The vast majority of Bilibili users and creators only communicate in Chinese. Translating your comments and replies allows you to participate in discussions, support your favorite creators, and get your questions answered.
* **Seamless Workflow:** Instead of keeping translation tabs open, copy-pasting back and forth, and dealing with broken UI placeholders, you can translate your drafts directly inside Bilibili's native text fields.

## How to Use It

There are two ways to translate your text while typing:

### Method 1: The Alt + T Shortcut
1. Click into any input field on Bilibili (comments, searches, or danmaku bars).
2. Type what you want to say in English.
3. Press **Alt + T** (or **Option + T** on a Mac).
4. The text field will briefly flash blue to show it is translating, and your English text will be replaced with the Chinese translation.

### Method 2: The /zh Command
1. Type **/zh** followed by your English text inside any input field.
   * *Example:* `/zh this video is really cool`
2. Press **Enter** or **Tab**.
3. The command prefix will disappear, leaving the Chinese translation in its place.

## Installation (Local/Developer Mode)

Since this extension is not currently hosted on the Chrome Web Store, you can run it locally in developer mode:

1. Download this repository as a ZIP file from GitHub (click the green **Code** button on the repository page and select **Download ZIP**).
2. Extract (unzip) the downloaded file into a folder on your computer.
3. Open your browser and navigate to your extensions management page:
   * Chrome: `chrome://extensions/`
   * Edge: `edge://extensions/`
   * Brave: `brave://extensions/`
4. Turn on the **Developer mode** toggle (usually in the top-right corner).
5. Click the **Load unpacked** button (usually in the top-left corner).
6. Select the extracted `Bilibili-EnToCn` folder.
7. Refresh your Bilibili tab and click on an input box to test it out.

## Configuration

You can change the translation engine by clicking the extension icon in your browser toolbar:
* **Google Translate:** Works out of the box with no setup or API keys.
* **DeepL:** Requires setting up a free or pro API key in the extension settings.
* **Microsoft Translator:** Requires an Azure Cognitive Services translator key and region.
