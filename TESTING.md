# TESTING

-   Test that the width of the tap area and visualization doesn't change when the
    list of recorded values grows long enough to cause a scrollbar to appear.
    In particular, test this on Edge on Windows, since scrollbars there "take up space"
    rather than being an "overlay" like on MacOS, and the latest versions of Edge support
    `scrollbar-gutter: stable;` in CSS.
