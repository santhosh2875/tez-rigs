# TEZ · Rigs

A scroll site for a workshop that hand-builds gaming PCs. The page opens on three machines on a dark desk; scrolling flies the camera through the glass side panel of the middle one and stops among the parts, where a statement arrives word by word. Below it a workbench picture grows from the middle of the screen, three ideas pass one at a time on cut-corner cards, a sentence lights up as it crosses the screen, and the services wipe past with their pictures. The last section is a form to spec a rig.

"Tez" is a demo brand. The company, the machines and the contact details are invented.

It shares its scroll engine with `arka-motorworks`; the words, the look and the pictures are its own.

Plain HTML, CSS and JavaScript. No build step and no dependencies.

## Run it
```bash
python -m http.server 5196
```
Then open http://localhost:5196.

## Edit it
Everything the site says is in `config.js`: the brand, the headline, the statement, the approach, the three ideas, the long sentence, the services and the closing section.

## Media
- `assets/pc/`: the three PCs (`rigs`), the inside of the middle one (`inside`), the workbench picture (`craft`), three square pictures for the ideas (`value-1` to `value-3`) and four for the services (`cooling`, `cables`, `lighting`, `testing`). The first service reuses `inside`.
- `assets/film/`: the opening as a frame sequence (`f-0001.jpg` onwards, with `manifest.json`). Without it, the first picture zooms in and the second fades up through it.

## Files
```
index.html      all sections
styles.css      all styles
config.js       all the content
app.js          the film, the scroll effects and the form
guide.html      how the pictures and the clip were made
```
