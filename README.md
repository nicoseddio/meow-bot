# meow-bot

## Configuring the Raspberry Pi
`meow-bot` was written using Node v12+. As of this writing, the highest Node version officially supported by my Raspberry Pi model B (`armv6`) is v10.19.0, which breaks on some missing functions. I had to manually install an unsupported build of v12.18.3 using the following commands and [this thread](https://gist.github.com/davps/6c6e0ba59d023a9e3963cea4ad0fb516):
```
wget https://unofficial-builds.nodejs.org/download/release/v12.18.3/node-v12.18.3-linux-armv6l.tar.gz
tar -xzf node-v12.18.3-linux-armv6l.tar.gz
cd node-v12.18.3-linux-armv6l
sudo cp -R * /usr/local

export PATH=$PATH:/usr/local/bin

node -v
npm -v
```
The last two showed `v12.18.3` and `6.14.6` respectively.