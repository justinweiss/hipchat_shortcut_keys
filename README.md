Extra shortcut keys for the HipChat Fluid instance
==================================================

If you're like me, you don't like using Adobe AIR. Luckily, the
HipChat developers were awesome enough to do a really excellent job
developing a webapp [that works really well under
Fluid](http://ruby-on-the-interrails.blogspot.com/2011/03/hipchat-without-air.html). Unfortunately,
the common tab-manipulation commands in Mac OS don't work on the
software tabs that hipchat provides. Fortunately, I wrote a quick
userscript to add those shortcuts back into the Fluid app. You won't
miss the AIR app at all! (Unless you video chat! (which is kind of out
of the scope of javascript :-( )))

Extra Shortcuts
---------------

* Cmd-W now closes the current tab, if it's closeable.
* Cmd-1 through Cmd-9 select the tab at position 1 through 9.
* Cmd-{ goes to the previous tab, and Cmd-} goes to the next tab.

Installation
------------

In your HipChat Fluid instance, open 'Preferences', go to the
'Advanced' section and add *.user.js as a pattern to browse to inside
Fluid. Then, go to File, Open Location and paste the following url:

    https://github.com/justinweiss/hipchat_shortcut_keys/raw/master/hipchat_shortcut_keys.user.js

Install the script when Fluid asks you to.

Feel free to improve it, add common shortcuts, and send me pull
requests! If you're a better JavaScript developer than me (which
shouldn't be hard), feel free to make the code better, too!

