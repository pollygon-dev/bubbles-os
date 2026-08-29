# Bubbles 🫧

Hi there! Bubbles is a website template that boots up like Windows 7 and looks
like Frutiger Aero.

Made with Neocities and Nekoweb in mind, though it runs anywhere that can serve
files.

---

## Getting started

1. Open `index.html` in your browser.
2. Now open that same file in a text editor and scroll until you see the big
   comment that says **YOUR STUFF GOES HERE**. 

---

## Putting it online

Upload the files exactly how they are. `index.html` has to sit at the top
level, that's the only rule.

**Neocities:** go to your dashboard and drag in `index.html`, `styles.css`,
`script.js` and `not_found.html`. Then make a folder called `assets` and put
everything from `assets/` inside it.

Bonus: `not_found.html` becomes your 404 page automatically.

**Nekoweb:** same deal in the File Manager. Upload the files, make an `assets`
folder for the pictures!

---

## The windows

There are five icons on the desktop, plus the Welcome window that pops up when
someone arrives. Each one is a `<section>` inside the YOUR STUFF block:

| Section                | What it is                                          |
|------------------------|-----------------------------------------------------|
| `data-tpl="about"`     | About Me. Your picture, your name, your introduction. The side buttons jump between sections |
| `data-tpl="blog"`      | Blog. One `<article>` per post, newest on top       |
| `data-tpl="links"`     | Links. Friends, sites you like, and 88x31 buttons   |
| `data-tpl="gallery"`   | Gallery. Your art, in a file explorer window        |
| `data-tpl="credits"`   | Credits. Who made the things this template uses     |
| `data-tpl="welcome"`   | The window that says hi to visitors                 |

### Writing a blog post

Copy one `<article>` and change the words.

```html
<article class="post">
  <h3>my post title</h3>
  <time>29 August 2026</time>
  <p>Write as much as you like, and add another paragraph any time.</p>
</article>
```
Or change entirely how it looks!

### Adding a link

```html
<a class="link-card" href="https://friend.site" target="_blank" rel="noopener">
  <span class="lc-ico">🐱</span>
  <span class="lc-txt"><b>Friend's site</b><small>friend.site</small></span>
</a>
```

For 88x31 buttons, drop the images into `assets/` and swap out a placeholder:

```html
<a href="https://friend.site"><img class="btn88" src="assets/friend.gif" alt="friend"></a>
```

### Putting art in the Gallery

```html
<div class="art art-img" data-caption="My drawing"><img src="assets/art.jpg" alt="My drawing"></div>
```

Picture tiles open full size when you click them. If you would rather have a
coloured tile with an emoji on it:

```html
<div class="art" style="--c1:#9fe0e8;--c2:#e6f8fe" data-caption="A mood">🫧</div>
```

Note: the Gallery is the only window using the file explorer look, meaning the
address bar, the folder tree and the toolbar. If you want a second window like
it, copy that whole `<section>` and rename its `data-tpl`.

### Making a new window

Two steps, both in `index.html`. No JavaScript needed, windows sign themselves
up from the section you write.

1. Add a section in the YOUR STUFF block and put whatever you like inside:

   ```html
   <section data-tpl="music"
            data-title="Music" data-icon="assets/icons/music.png"
            data-w="520" data-h="460">
     <div class="win-pad">
       <div class="pad-hdr"><i class="bx bxs-music"></i> Music</div>
       <p>What I have had on repeat lately.</p>
     </div>
   </section>
   ```

2. Add a desktop icon, or a row in the Start menu. Anything
   with `data-window="music"` on it opens your new window.

   ```html
   <li class="desk-icon" data-window="music" tabindex="0">
     <span class="icon"><img src="assets/icons/music.png" alt=""></span>
     <span class="label">Music</span>
   </li>
   ```

The four `data-` bits on the section are all optional:

| Attribute    | What it does                    | If you leave it out    |
|--------------|---------------------------------|------------------------|
| `data-title` | the text in the title bar       | uses the `data-tpl` name |
| `data-icon`  | a Boxicons name or a picture    | a plain window icon    |
| `data-w`     | how wide the window opens       | 520                    |
| `data-h`     | how tall the window opens       | 460                    |

Icon names come from [Boxicons](https://boxicons.com) and there are plenty to
browse. You can also point `data-icon` at a picture, like
`data-icon="assets/icons/blog.png"`. The Vista icons in Bubbles work exactly
that way.

If a desktop icon points at a window that does not exist, nothing happens when
you click it, and the browser console (F12) tells you which name it could not
find.

---

## Making it yours

### Colours

There are nine variables at the top of `styles.css`. Change these and the
desktop, taskbar, Start menu, window frames and boot screen all follow along.
It is the quickest way to make Bubbles look like your own.

```css
:root {
  --tint-1: #e6f8fe;   /* palest sky, window tints and hovers */
  --tint-2: #b6e9fa;   /* soft aqua                           */
  --tint-3: #7fd6f2;   /* mid aqua                            */
  --accent: #1f9bc9;   /* strong aqua, links and active bits  */
  --ink:    #0d4a68;   /* deep blue, headings and strong text */

  --alt-1: #eefbe2;    /* palest green, secondary surfaces    */
  --alt-2: #cdf0aa;    /* fresh green                         */
  --alt-3: #9fd8e8;    /* seafoam                             */

  --outline: #2c7ea3;  /* window and control outlines         */
}
```

The window frames come from `FRAME`, `FRAME_BLUR`, `SURFACE` and `OUTLINE` at
the top of `script.js`, because that is how 7.css says to theme them.

### Wallpaper

```css
--wallpaper: url("assets/wallpaper.jpg");
--scenery: none;      /* hides the built in floor grid and horizon haze */
```

Want no image at all? Set `--wallpaper: none;` and `--scenery: "";` and you get
a built in sky to grass gradient with a perspective grid. 

Please resize big photos before uploading. Around 1920px wide at JPEG quality
80 keeps things under half a megabyte, which is much kinder to phones.

### Making Boxicons look glossy

Boxicons are flat by default. You can fake the glossy
Windows 7 plastic look with pure CSS though. Bubbles does this to its smaller
glyphs, and here is how it works so you can do it to any icon.

The Aero look is really just three things stacked up:

1. a gradient that goes light at the top and dark at the bottom
2. a hard colour break in the middle, which reads as the shine line
3. a little bounce light at the very bottom

You paint all three through the glyph with `background-clip: text`:

```css
.my-icon .bx::before {
  background: linear-gradient(180deg,
    #ffffff 0%,      /* bright top      */
    #e2f6fe 44%,     /* still bright    */
    #8ad3ef 46%,     /* the shine break */
    #2a87b8 80%,     /* darker bottom   */
    #63b6da 100%);   /* bounce light    */
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

Notice that it is `.bx::before` and not `.bx`. Boxicons draws the glyph in a
`::before` pseudo element, so a gradient on `.bx` has no text to clip against
and nothing shows up at all. That one takes a while to spot.

Then add the shadow on the parent so the icon lifts off the wallpaper:

```css
.my-icon .bx {
  filter:
    drop-shadow(0 1px 0 rgba(3,44,68,.55))
    drop-shadow(0 2px 4px rgba(2,32,52,.7));
}
```

**One gotcha:** if the icon sits inside something with a `text-shadow` (desktop
icon labels do), that shadow inherits down and paints on top of your gradient,
which turns the icon into a dark blob. Turn it off:

```css
.my-icon .bx,
.my-icon .bx::before { text-shadow: none; }
```

Use `filter: drop-shadow()` for the icon shadow instead, as above.

One last thing: wrap the gradient in `@supports` so older browsers get a plain
solid icon instead of an invisible one:

```css
@supports ((-webkit-background-clip: text) or (background-clip: text)) {
  /* gradient rules go in here */
}
```

Recolouring is easy after that. Keep the two lightest stops near white, put
your colour in the bottom two, and keep the hard break at 44 to 46 percent.
Pinks and greens both look lovely.

---

### The rest of the branding

- The corner window that says "welcome to my website" is pure decoration. It's
  `#desk-panel` near the top of `index.html`, it cannot be clicked or dragged on
  purpose, and you can delete the whole block if you would rather not have it.
- `OS_NAME` at the top of `script.js` is the name in every window's status bar.
  Rename your OS to whatever you like.
- **Shut down** fades the screen and then sends the visitor to another site.
  It points at nekoweb.org by default. Change `data-url` on the Shut down
  button in `index.html` to send people somewhere else, like your own
  homepage or a friend's site.
- The boot screen's name and picture are near the top of `index.html`.
- `assets/user-icon.jpg` is the logon tile and your About picture.
- `assets/windowsbutton.svg` is the mark on the Start orb. It's a plain image
  with the white already baked in, so swap the file to change it.
- `assets/favicon.svg` is the little browser tab icon.
- `assets/wallpaper.jpg` is the wallpaper.
- `assets/icons/` holds the Vista icons the windows use. There is a whole set in
  `assets/vista-icons/` if you would like a different one.

---

## How it behaves

- **On a computer:** windows open at a normal size, stacked slightly, draggable
  by the title bar, resizable from the edges, with minimize, maximize, close
  and taskbar buttons.
- **On a phone (640px and under):** windows open full screen, side panels turn
  into scrollable strips, and dragging switches off because there is nowhere to
  drag to. Rotate to landscape and the desktop layout comes back.
- **The boot screen** holds for a moment and then fades. Timing lives in
  `BOOT_MIN_MS` and `BOOT_MAX_MS` in `script.js`. It always removes itself, so
  nobody gets stuck staring at a loading bar.

---

## What's in the folder

```
index.html      everything you edit: desktop, taskbar, Start menu, window content
styles.css      the whole look (colour variables at the top)
script.js       windows, taskbar, boot screen (you can leave this one alone)
not_found.html  the themed 404 page
assets/         wallpaper, icons, and whatever you add
```

---

## Credits 🫧

You do not need to credit me! 

Please do keep the Credits window though, or the links from it somewhere on
your site. Bubbles was made possible with these assets :)

- [7.css](https://khang-nd.github.io/7.css/) gives us the Windows 7 buttons,
  windows and scrollbars (MIT)
- [WinBox.js](https://nextapps-de.github.io/winbox/) makes the windows drag,
  resize and stack (Apache 2.0)
- [Boxicons](https://boxicons.com) for the smaller interface glyphs (MIT,
  CC-BY-4.0 for the logos)
- [Frutiger Aero Archive](https://frutigeraeroarchive.org/) for the wallpaper, 
  images on the gallery, and the Windows Vista icons

Windows 7 and the Windows logo are trademarks of Microsoft Corporation.
Bubbles recreates the look with CSS and is not affiliated with or endorsed by
Microsoft. If you would rather not ship Microsoft's logo, swap
`assets/windowsbutton.svg` for your own mark.

## Licence

**The code is public domain.** index.html, styles.css, script.js and
not_found.html are released under [the Unlicense](https://unlicense.org), so
take them, change them, sell them, do whatever you like. No credit needed, no
strings attached. Full text is in the LICENSE file.

**The assets are different.** The files in `assets/` are not mine to
hand out, so the Unlicense does not cover them:

| File | Where it comes from |
|------|---------------------|
| `wallpaper.jpg` | Frutiger Aero Archive. Rights belong to whoever made it. |
| `vista-icons/` and `icons/` | Windows Vista icons, copyright Microsoft. |
| `windowsbutton.svg` | The Windows flag shape, a Microsoft trademark. |
| `user-icon.jpg` | The old Messenger buddy icon, also Microsoft. |
| `gallery/` | Anime wallpapers found on Frutiger Aero Archive. |
| `favicon.svg` | Made for this template, public domain like the code. |

So: the code is yours to do anything with, and the pictures are placeholders to
swap out.

Bubbles also loads 7.css, WinBox and Boxicons from a CDN rather than bundling
them, so their licences (MIT, Apache 2.0 and MIT / CC-BY-4.0) stay with those
projects. If you decide to host copies yourself, keep their licence files
alongside them.
