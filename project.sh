#!/usr/bin/env sh

case $1 in
  install-deployctl) # Install
    deno install -A --no-check -f https://deno.land/x/deploy/deployctl.ts
    ;;
  run) # Run project.
    deployctl run main.ts
    ;;
  fmt)
    deno fmt
    ;;
  *)
    grep ') #' "$0" | grep -v grep
    exit 1
    ;;
esac