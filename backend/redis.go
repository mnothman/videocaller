// redis.go
package utils

import (
	"context"
	"github.com/go-redis/redis/v8"
)

// Context for Redis operations
var ctx = context.Background()

// Redis client instance
var RDB = redis.NewClient(&redis.Options{
	Addr: "localhost:6379", // Default Redis address
})

// Utility function to check Redis connection
func PingRedis() error {
	_, err := RDB.Ping(ctx).Result()
	return err
}
