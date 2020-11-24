for ((i=1;i<=100;i++)); 
do
	curl -s 'http://35.190.145.12:9090/' | grep '<title>.*</title>'
	sleep 2s
done
