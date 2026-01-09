# TESTING

-   Test that the "animation" works:
    -   While a "note" is being held, the last bar should continually grow.
    -   If the user taps with touch and holds, but then drags out of the tap area,
        it should also register as the end of a tap when the pointer leaves the tap area.
        (This is to prevent the tap getting "stuck on" if they then release the hold outside of the tap area.)
-   Tab, Shift, Ctrl, Alt are ignored as keys that can be used for tapping the rhythm. (Technically this
    contracts the UI instruction to tap "any" key, but I think it would be more confusing to explain this to the user, hopefully this will intuitively make sense.)
    -   Test that Ctrl+r to reload, and keeping the Ctrl key held down for a few seconds, doesn't cause adverse effects (this was a bug).
    -   Similar for Alt-Tab to another window or tabbing that moved focus to browser chrome (it left the tap "stuck on" which was also a bug).
-   Test that the width of the tap area and visualization doesn't change when the
    list of recorded values grows long enough to cause a scrollbar to appear.
    In particular, test this on Edge on Windows, since scrollbars there "take up space"
    rather than being an "overlay" like on MacOS, and the latest versions of Edge support
    `scrollbar-gutter: stable;` in CSS.
-   Test in dark mode.
