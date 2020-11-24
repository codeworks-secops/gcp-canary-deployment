for ((i=1;i<=100;i++)); 
do
	curl -s 'http://192.168.99.100:31453' | grep '<title>.*</title>'
	sleep 2s
done
