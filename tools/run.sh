#!/usr/bin/env bash
#
# Run jekyll serve and then launch the site

prod=false
host="127.0.0.1"

bundle_cmd=(bundle)
if command -v rbenv >/dev/null 2>&1; then
  bundle_cmd=(rbenv exec bundle)
fi

help() {
  echo "Usage:"
  echo
  echo "   bash /path/to/run [options]"
  echo
  echo "Options:"
  echo "     -H, --host [HOST]    Host to bind to."
  echo "     -p, --production     Run Jekyll in 'production' mode."
  echo "     -h, --help           Print this help information."
}

while (($#)); do
  opt="$1"
  case $opt in
  -H | --host)
    host="$2"
    shift 2
    ;;
  -p | --production)
    prod=true
    shift
    ;;
  -h | --help)
    help
    exit 0
    ;;
  *)
    echo -e "> Unknown option: '$opt'\n"
    help
    exit 1
    ;;
  esac
done

jekyll_cmd=("${bundle_cmd[@]}" exec jekyll s -l -H "$host")

if [ -e /proc/1/cgroup ] && grep -q docker /proc/1/cgroup; then
  jekyll_cmd+=(--force_polling)
fi

echo -e "\n> ${jekyll_cmd[*]}\n"
if $prod; then
  JEKYLL_ENV=production "${jekyll_cmd[@]}"
else
  "${jekyll_cmd[@]}"
fi
