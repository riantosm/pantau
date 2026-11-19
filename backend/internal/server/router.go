// Package server menyusun router Gin: middleware, CORS, dan semua route.
package server

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/readpref"

	"github.com/riantosm/pantau/backend/internal/entity"
	"github.com/riantosm/pantau/backend/internal/entitytype"
	"github.com/riantosm/pantau/backend/internal/httpx"
)

// Deps adalah semua yang dibutuhkan router dari luar.
type Deps struct {
	Client         *mongo.Client
	DB             *mongo.Database
	AllowedOrigins []string
}

// New membuat *gin.Engine yang siap dijalankan.
func New(d Deps) *gin.Engine {
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

	// Render berada di belakang proxy, tapi kita tidak memakai IP klien,
	// jadi tidak perlu mempercayai header X-Forwarded-For.
	_ = r.SetTrustedProxies(nil)

	r.Use(cors.New(cors.Config{
		AllowOrigins: d.AllowedOrigins,
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions},
		AllowHeaders: []string{"Content-Type"},
		MaxAge:       12 * time.Hour,
	}))

	r.GET("/healthz", healthz(d.Client))

	// Repository Mongo. entityRepo juga dipakai handler jenis untuk menghitung pemakaian,
	// dan typeRepo dipakai handler entitas untuk memastikan typeId ada.
	entityRepo := entity.NewMongoRepository(d.DB)
	typeRepo := entitytype.NewMongoRepository(d.DB)

	api := r.Group("/api/v1")
	entity.NewHandler(entityRepo, typeRepo).Register(api)
	entitytype.NewHandler(typeRepo, entityRepo).Register(api)

	r.NoRoute(func(c *gin.Context) {
		httpx.Error(c, http.StatusNotFound, httpx.CodeNotFound, "Endpoint tidak ditemukan", nil)
	})

	return r
}

// healthz membalas status server dan database.
// Dipakai health check Render dan untuk "membangunkan" server dari frontend.
func healthz(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 3*time.Second)
		defer cancel()

		if err := client.Ping(ctx, readpref.Primary()); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"status": "degraded", "db": "down"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "ok", "db": "up"})
	}
}
