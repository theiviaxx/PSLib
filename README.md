PSLib
=====

PSLib is released under the MIT license. It is simple and easy to understand and places almost no restrictions on what you can do with PSLib.
[More Information](http://en.wikipedia.org/wiki/MIT_License)

CommonJS Modules 1.1 for Photoshop.

Engine: ExtendScript 4.1.28 (CS5.5)*
* Have not tested with other versions, but I am sure this will work with ExtendScript CS3+

To Install
----------
* Extract tar/zip

To Test
-------
* In ESTK, open require.jsx
* Add dir to require.path to reflect the `tests` dir
* Run it

Notes
-----
Passes all tests except for:

* 1.0/method - members not implicitly bound

Included libs
-------------
I've included some boilerplate libs that have proven invaluable

* JSON.jsx https://github.com/douglascrockford/JSON-js
* underscore.jsx - http://documentcloud.github.com/underscore/