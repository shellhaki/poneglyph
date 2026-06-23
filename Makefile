dev:
	go run ./cmd/server/main.go

build:
	go build  -o  ./bin/app ./cmd/server/main.go

start:
	./bin/app
	
clean:
	rm ./bin/app