# fold-editor-and-preview

it adds fold function to markdown editor and preview.
you can add fold section wherever you want.

## install

```
ipm install fold-editor-and-preview
```

## Usage

Put the code you want to fold between 
```
<!-- region -->
```
and
```
<!-- endregion -->
```
.
if you write start fold name is
```
<!-- region foo -->
```
, foo is the label for the disclosure widget in preview.

![example](https://github.com/mystster/fold-editor-and-preview/raw/master/docs/images/screencapture.gif)

## TODO
- [ ] support nested fold
- [ ] customize keyword
- [ ] auto expand

## Changelog
- 0.1.0 - First release