SCRIPTPATH='~/games/stanleysqueaks'
killall xjoy2key
~/xjoy2key/src/xjoy2key "$SCRIPTPATH/xjoy2key.cfg" &
firefox -p "Full Screen" -no-remote "$SCRIPTPATH/index.html"
killall xjoy2key