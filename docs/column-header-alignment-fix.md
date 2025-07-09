# Column Header Alignment Fix

The original layout for the labels at the top of the Encryptor card used
`justify-content: space-between` within the `.card-labels` flex container.
Because the first label (`.label-clue`) was configured with `flex-grow: 1`,
this caused the browser to push the remaining labels all the way to the right
edge. The headers no longer matched the width of the input columns below them.

The fix was to remove the `justify-content` rule and rely on a small `gap`
between flex items instead. This mirrors the spacing used for the input rows
(`.clue-row`) so each header lines up perfectly with its column.

```css
.card-labels {
    display: flex;
    gap: 8px;               /* match .clue-row spacing */
}
.card-labels .label-guess {
    width: 35px;            /* same width as the input boxes */
    flex-shrink: 0;
    text-align: center;
}
```

With this change the headers stay aligned with the text fields and guess boxes
beneath them.
