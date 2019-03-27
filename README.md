need to have redis-server installed alongside node etc.
sudo apt-get redis-server

useful commands to run on command line with redis:
redis-cli //access redis command line interface
KEYS \* //show all keys in this db
HGETALL example //get all key/value pairs in example hashmap
