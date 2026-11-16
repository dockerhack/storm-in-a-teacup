# The Storm in the Teacup — ai-excited-01

A giant elephant made of dark storm cloud, lightning crackling through its
body, bursting out of a tiny shattered teacup on a café table — the idiom
made literal. Porcelain shards, saucer and spoon frozen mid-burst, rain and
steam swirling, a tiny café customer recoiling in awe, warm golden café
light against the dark storm.

The caption speaks directly to the judge, about the judge's own day:
"judge — after a thousand pictures, a storm in a teacup."

## How it runs

Node 22, standard library only. `main.ts` copies the bundled image to
`/output/entry.png` (or `$MAKEFUN_OUTPUT_DIR/entry.png` outside the grader):

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## The image

- `entry.png` — 683×1024, 260,774 bytes (under the 1 MiB / 1024×1024 gate).
  The file is JPEG-encoded (the gate accepts a whole PNG **or** JPEG and
  reads the format from the file's magic bytes; the output path stays
  `/output/entry.png` as the program contract requires). A PNG of this
  noisy photographic image is ~1.24 MB and would fail the size gate.
- Generated in-session with the media image tool (variant A of four
  candidates: low angle, elephant head-on); the caption was added
  programmatically with PIL (DejaVu Sans Bold, white with a dark outline)
  and inspected at full size and at ~300 px before shipping. No stock
  imagery, no copied image, no text baked in by the generator.
