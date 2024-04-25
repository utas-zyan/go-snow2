target=/home/ubuntu/gosnow/gosnow2_docker3/misago/_patch
origin=/home/ubuntu/gosnow/go-snow2/
for x in $(echo "
misago/conf/migrations/0004_create_settings.py
misago/static/misago/css/misago.css
misago/static/misago/css/misago.css.map
misago/static/misago/js/hljs.js
misago/static/misago/js/hljs.js.map
misago/static/misago/js/misago.js
misago/static/misago/js/misago.js.map
misago/static/misago/js/vendor.js
misago/static/misago/js/vendor.js.map
misago/static/misago/js/zxcvbn.js
misago/templates/misago/footer.html
")
do
    echo "Processing $x"
    echo  "folder is $(dirname $x)"
    echo cp $origin/$x $target/$x
    mkdir -p $target/$(dirname $x)
    cp $origin/$x $target/$x
done