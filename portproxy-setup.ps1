$wslIP = (wsl hostname -I).Trim().Split()[0]
netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=8010
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=8010 connectaddress=$wslIP connectport=8010