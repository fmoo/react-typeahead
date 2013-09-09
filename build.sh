#!/usr/bin/env bash

pushd src >/dev/null
for f in $(find . -name '*.js'); do
  jsx $f > ../build/$f
done
popd >/dev/null
