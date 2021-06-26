## mini JS builder

A simple js builder tool with no config but the main file as a unique argument, works with commonjs modules. Totally commonjs complaint (see [doc](http://wiki.commonjs.org/wiki/Modules/1.1))

![Example about how works](./docs/example-output.jpg)

### How works

* It resolves the DFS three of requires dependencies by using the Babel parser and the Babel translator.
* It overrides the `exports` attribute and the `require` method for each file and it creates a unique scope for each of them.
* Concat all the modules!
* Execute the main one!
* ???
* Profit

### How to use it

It only accepts a main file:

```sh
// using the main file directly
npm start ../other-things/my-file-with-requires.js
// or...
npm start --main='../other-things/my-file-with-requires.js'
```

By default, the generated file is stored in `dist/output.js`, but you could
modify it by using the `--output` argument:

```sh
npm start ../other-things/my-file-with-requires.js --output='./other-output-name.js'
```


### Check it!

You can check the output of [a variety of different examples](./tests) by executing:

```sh
npm start ./tests/${nameOfExample}/a.js
```

### TODO
* Have a serious CLI, with proper documentation
* Tests, all of them
